"use client";

import { useState, useEffect, useCallback } from "react";
import type { TrackedSecurity, StockAnalysis } from "@/types";

/** Static fallback used if the dynamic ticker fetch fails. */
const FALLBACK_TICKERS = ["SPY", "QQQ", "AAPL", "MSFT", "NVDA", "TSLA", "BTC-USD", "^GSPC"];
const INITIAL_TICKER_COUNT = 3;

/**
 * Manages AI sentiment analysis for a dynamically fetched set of market tickers.
 * Tickers are sourced from /api/tickers (Yahoo Finance trending + most-active),
 * falling back to a static list if the fetch fails.
 * Auto-fetches the first three tickers on mount; exposes refreshTicker,
 * refreshAll, and removeTicker.
 */
export function useMarkets() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, StockAnalysis>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const watchlist: TrackedSecurity[] = tickers.map((ticker) => ({
    ticker,
    name: ticker,
    addedAt: 0,
  }));

  /** Fetches quote + AI sentiment for a single ticker. */
  const fetchTicker = useCallback(async (ticker: string) => {
    setLoading((prev) => new Set(prev).add(ticker));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[ticker];
      return next;
    });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
      setAnalyses((prev) => ({ ...prev, [ticker]: data as StockAnalysis }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error.";
      setErrors((prev) => ({ ...prev, [ticker]: message }));
    } finally {
      setLoading((prev) => {
        const next = new Set(prev);
        next.delete(ticker);
        return next;
      });
    }
  }, []);

  /** Re-fetches a single ticker — wired to the Refresh button on each card. */
  const refreshTicker = useCallback(
    (ticker: string) => {
      fetchTicker(ticker);
    },
    [fetchTicker]
  );

  /** Re-fetches all current market tickers simultaneously. */
  const refreshAll = useCallback(() => {
    tickers.forEach((ticker) => fetchTicker(ticker));
  }, [fetchTicker, tickers]);

  const removeTicker = useCallback((ticker: string) => {
    setTickers((prev) => prev.filter((item) => item !== ticker));
    setAnalyses((prev) => {
      const next = { ...prev };
      delete next[ticker];
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[ticker];
      return next;
    });
  }, []);

  // On mount: fetch the dynamic ticker list, then analyze the first three.
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/tickers");
        const data = await res.json();
        const list: string[] = (data?.tickers ?? FALLBACK_TICKERS).slice(0, INITIAL_TICKER_COUNT);
        setTickers(list);
        list.forEach((ticker) => fetchTicker(ticker));
      } catch {
        const fallback = FALLBACK_TICKERS.slice(0, INITIAL_TICKER_COUNT);
        setTickers(fallback);
        fallback.forEach((ticker) => fetchTicker(ticker));
      }
    }
    init();
  }, [fetchTicker]);

  return { watchlist, analyses, loading, errors, refreshTicker, refreshAll, removeTicker };
}
