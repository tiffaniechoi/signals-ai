/** A ticker the user has added to their watchlist. */
export interface TrackedSecurity {
  ticker: string;
  /** Display name resolved from Yahoo Finance at add-time. */
  name: string;
  /** Unix ms timestamp of when the ticker was added. */
  addedAt: number;
}

/** Live quote data returned by Yahoo Finance and stored in StockAnalysis. */
export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  /** Absolute price change from previous close. */
  change: number;
  /** Percentage price change from previous close. */
  changePercent: number;
  volume: number;
}

/** A single news headline from Yahoo Finance. */
export interface NewsItem {
  title: string;
  publisher: string;
  /** Full article URL. */
  url: string;
  /** Unix seconds (not ms) as returned by Yahoo Finance. */
  providerPublishTime: number;
}

export type Sentiment = "bullish" | "bearish" | "neutral";
export type Confidence = "high" | "medium" | "low";

/** Structured sentiment prediction returned by the Gemini API. */
export interface SentimentAnalysis {
  sentiment: Sentiment;
  confidence: Confidence;
  prediction: "up" | "down" | "sideways";
  /** 2-3 bullet point summary from Groq. */
  summary: string[];
  /** Up to 3 key factors driving the prediction. */
  keyFactors: string[];
  /** Human-readable prediction window, e.g. "1-5 days". */
  timeframe: string;
}

/** Full analysis result returned by POST /api/analyze. */
export interface StockAnalysis {
  quote: StockQuote;
  news: NewsItem[];
  sentiment: SentimentAnalysis;
  /** Unix ms timestamp of when the analysis was run. */
  analyzedAt: number;
}
