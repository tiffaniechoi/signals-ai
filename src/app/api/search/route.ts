/**
 * GET /api/search?q=<query>
 *
 * Proxies the Yahoo Finance autocomplete endpoint and returns up to 8
 * ticker suggestions filtered to equities, ETFs, indices, and crypto.
 * No API key is required — Yahoo Finance search is a public endpoint.
 *
 * Returns: { results: Array<{ ticker, name, type }> }
 */
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

/** Security types surfaced to the user; others (futures, warrants, etc.) are hidden. */
const ALLOWED_TYPES = new Set(["EQUITY", "ETF", "INDEX", "CRYPTOCURRENCY"]);

export async function GET(req: NextRequest) {
  // Rate limit: 60 searches per IP per minute.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(ip, { limit: 60, windowMs: 60_000 })) {
    return NextResponse.json({ results: [] });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1 || q.length > 50) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&enableFuzzyQuery=true`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    const quotes: Array<{ symbol: string; longname?: string; shortname?: string; quoteType: string }> =
      data?.quotes ?? [];

    const results = quotes
      .filter((q) => ALLOWED_TYPES.has(q.quoteType))
      .slice(0, 8)
      .map((q) => ({
        ticker: q.symbol,
        name: q.longname ?? q.shortname ?? q.symbol,
        type: q.quoteType === "EQUITY" ? "Stock" : q.quoteType === "CRYPTOCURRENCY" ? "Crypto" : q.quoteType,
      }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
