/**
 * POST /api/analyze
 *
 * Accepts { ticker: string }, fetches a live quote + recent news from Yahoo
 * Finance, then calls the Groq API to produce a near-term sentiment
 * prediction.  The Groq API key is read from GROQ_API_KEY and is
 * never exposed to the client.
 *
 * Returns: { quote, news, sentiment, analyzedAt }
 * Errors:  400 (missing/invalid ticker) | 404 (ticker not on Yahoo) | 500 (AI failure)
 */
import { NextRequest, NextResponse } from "next/server";
import type { StockQuote, NewsItem, SentimentAnalysis } from "@/types";
import { rateLimit } from "@/lib/rateLimit";

// Groq Chat Completions endpoint — free tier: 1,000 req/day, 6,000 req/min
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/** Fetches the latest quote for a ticker from Yahoo Finance. Returns null on any error. */
async function fetchQuote(ticker: string): Promise<StockQuote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
        },
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price: number = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    const prevClose: number = meta.previousClose ?? meta.chartPreviousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    return {
      ticker: ticker.toUpperCase(),
      name: meta.longName ?? meta.shortName ?? ticker.toUpperCase(),
      price,
      change,
      changePercent,
      volume: meta.regularMarketVolume ?? 0,
    };
  } catch {
    return null;
  }
}

/** Fetches up to 5 recent news headlines for a ticker from Yahoo Finance. Returns [] on any error. */
async function fetchNews(ticker: string, companyName?: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(ticker)}&newsCount=10&quotesCount=0`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
        },
        next: { revalidate: 0 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const upperTicker = ticker.toUpperCase();
    // Build a list of name keywords to match against (e.g. ["Microsoft"] from "Microsoft Corporation")
    const nameKeywords = companyName
      ? companyName.split(/[\s,./]+/).filter((w) => w.length > 2).map((w) => w.toLowerCase())
      : [];

    const allNews: NewsItem[] = (data?.news ?? [])
      .filter((n: { title?: string; summary?: string; relatedTickers?: string[] }) => {
        // Accept if ticker is in relatedTickers
        const tickers: string[] = n.relatedTickers ?? [];
        if (tickers.length > 0 && tickers.some((t) => t.toUpperCase() === upperTicker)) return true;
        // Accept if ticker or any company name keyword appears in the title or summary
        const text = `${n.title ?? ""} ${n.summary ?? ""}`.toLowerCase();
        if (text.includes(upperTicker.toLowerCase())) return true;
        if (nameKeywords.some((kw) => text.includes(kw))) return true;
        // Reject if relatedTickers is populated but none matched (unrelated article)
        if (tickers.length > 0) return false;
        // No relatedTickers and no text match — keep as fallback
        return true;
      })
      .slice(0, 5)
      .map(
        (n: { title?: string; publisher?: string; link?: string; providerPublishTime?: number }) => ({
          title: n.title ?? "",
          publisher: n.publisher ?? "",
          url: n.link ?? "",
          providerPublishTime: n.providerPublishTime ?? 0,
        })
      );
    return allNews;
  } catch {
    return [];
  }
}

/**
 * Calls the Groq API with price action + news headlines and returns a
 * structured SentimentAnalysis.  Uses native JSON mode so the response is
 * always valid JSON — no regex cleanup needed.
 * Throws on non-2xx response or missing content.
 */
async function analyzeWithGroq(
  apiKey: string,
  quote: StockQuote,
  news: NewsItem[]
): Promise<SentimentAnalysis> {
  const headlinesList = news
    .map((n, i) => `${i + 1}. "${n.title}" — ${n.publisher}`)
    .join("\n");

  const prompt = `You are a financial analyst AI. Analyze the following market data and recent news headlines for ${quote.ticker} (${quote.name}).

Current price: $${quote.price.toFixed(2)}
Today's change: ${quote.change >= 0 ? "+" : ""}${quote.change.toFixed(2)} (${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%)
Volume: ${quote.volume.toLocaleString()}

Recent news headlines:
${headlinesList || "No recent news available."}

Based on the news sentiment and price action, provide a near-term (1–5 day) directional prediction.

Respond with ONLY valid JSON in exactly this structure:
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": "high" | "medium" | "low",
  "prediction": "up" | "down" | "sideways",
  "summary": ["brief bullet point 1", "brief bullet point 2", "brief bullet point 3"],
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "timeframe": "1-5 days"
}`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
      // Native JSON mode — guarantees valid JSON output without regex cleanup
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq API error ${res.status}: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";

  return JSON.parse(text) as SentimentAnalysis;
}

export async function POST(request: NextRequest) {
  // Rate limit: 15 analyses per IP per minute to protect Groq quota.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(ip, { limit: 15, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured." }, { status: 500 });
  }

  let ticker: string;
  try {
    const body = await request.json();
    ticker = (body.ticker ?? "").trim().toUpperCase();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required." }, { status: 400 });
  }
  if (ticker.length > 20) {
    return NextResponse.json({ error: "Invalid ticker." }, { status: 400 });
  }

  const quote = await fetchQuote(ticker);
  if (!quote) {
    return NextResponse.json(
      { error: `Ticker "${ticker}" not found on Yahoo Finance.` },
      { status: 404 }
    );
  }

  const news = await fetchNews(ticker, quote.name);

  let sentiment: SentimentAnalysis;
  try {
    sentiment = await analyzeWithGroq(apiKey, quote, news);
  } catch (err) {
    console.error("Groq analysis failed:", err);
    return NextResponse.json({ error: "AI analysis failed. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ quote, news, sentiment, analyzedAt: Date.now() });
}
