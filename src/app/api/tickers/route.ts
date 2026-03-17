/**
 * GET /api/tickers
 *
 * Returns a dynamic list of major market tickers by combining:
 *   1. Yahoo Finance trending tickers (US)
 *   2. Yahoo Finance most-active screener
 *
 * Deduplicates, filters to EQUITY / ETF / INDEX / CRYPTOCURRENCY,
 * and caps at 8 tickers. Falls back to a static list if Yahoo is unreachable.
 */
import { NextResponse } from "next/server";

const FALLBACK = ["SPY", "QQQ", "AAPL", "MSFT", "NVDA", "TSLA", "BTC-USD", "^GSPC"];
const ALLOWED_TYPES = new Set(["EQUITY", "ETF", "INDEX", "CRYPTOCURRENCY"]);
const HEADERS = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

async function fetchTrending(): Promise<string[]> {
  const res = await fetch(
    "https://query1.finance.yahoo.com/v1/finance/trending/US?count=10",
    { headers: HEADERS, next: { revalidate: 900 } } // cache 15 min
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.finance?.result?.[0]?.quotes ?? []).map(
    (q: { symbol: string }) => q.symbol
  );
}

async function fetchMostActive(): Promise<string[]> {
  const res = await fetch(
    "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=most_actives&count=10",
    { headers: HEADERS, next: { revalidate: 900 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.finance?.result?.[0]?.quotes ?? []).map(
    (q: { symbol: string }) => q.symbol
  );
}

async function getQuoteTypes(symbols: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!symbols.length) return map;

  const res = await fetch(
    `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(symbols.join(" "))}&quotesCount=20&newsCount=0`,
    { headers: HEADERS, next: { revalidate: 900 } }
  );
  if (!res.ok) return map;
  const data = await res.json();
  for (const q of data?.quotes ?? []) {
    if (q.symbol && q.quoteType) map.set(q.symbol, q.quoteType);
  }
  return map;
}

export async function GET() {
  try {
    const [trending, mostActive] = await Promise.all([fetchTrending(), fetchMostActive()]);

    // Merge and deduplicate, trending first
    const seen = new Set<string>();
    const candidates: string[] = [];
    for (const ticker of [...trending, ...mostActive]) {
      if (!seen.has(ticker)) {
        seen.add(ticker);
        candidates.push(ticker);
      }
    }

    if (!candidates.length) {
      return NextResponse.json({ tickers: FALLBACK });
    }

    // Filter to allowed security types
    const typeMap = await getQuoteTypes(candidates);
    const filtered = candidates.filter((t) => {
      const type = typeMap.get(t);
      return !type || ALLOWED_TYPES.has(type); // include if type unknown (e.g. ^GSPC)
    });

    const tickers = filtered.slice(0, 8);
    return NextResponse.json({ tickers: tickers.length >= 4 ? tickers : FALLBACK });
  } catch {
    return NextResponse.json({ tickers: FALLBACK });
  }
}
