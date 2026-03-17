"use client";

/**
 * useWatchlist — manages the user's personal watchlist.
 *
 * Persists the list of tracked tickers to localStorage so it survives
 * page reloads.  Each ticker is validated against /api/analyze before
 * being added, which also pre-loads its first analysis result.
 *
 * Exposed API:
 *   watchlist      — ordered list of TrackedSecurity items
 *   analyses       — map of ticker → latest StockAnalysis
 *   loading        — set of tickers currently being fetched
 *   errors         — map of ticker → per-card error message
 *   addError       — error for the Add flow (cleared on next add attempt)
 *   addTicker      — validate + add a ticker and fetch its first analysis
 *   removeTicker   — remove a ticker and clean up its state
 *   refreshTicker  — re-run analysis for a single ticker
 *   refreshAll     — re-run analysis for all tracked tickers
 *   clearAddError  — manually dismiss the add-error message
 */
import { useState, useEffect, useCallback } from "react";
import type { TrackedSecurity, StockAnalysis } from "@/types";

const STORAGE_KEY = "signal_watchlist";

/** Reads the watchlist from localStorage; returns [] on parse failure or SSR. */
function loadFromStorage(): TrackedSecurity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrackedSecurity[]) : [];
  } catch {
    return [];
  }
}

/** Writes the watchlist to localStorage; silently ignores storage quota errors. */
function saveToStorage(watchlist: TrackedSecurity[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  } catch {
    // storage full or unavailable
  }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<TrackedSecurity[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, StockAnalysis>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addError, setAddError] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setWatchlist(loadFromStorage());
  }, []);

  // Persist watchlist to localStorage
  useEffect(() => {
    saveToStorage(watchlist);
  }, [watchlist]);

  const analyzeTickerInternal = useCallback(async (ticker: string) => {
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
      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed.");
      }
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

  const addTicker = useCallback(
    async (rawTicker: string) => {
      const ticker = rawTicker.trim().toUpperCase();
      if (!ticker) return;
      setAddError(null);

      if (watchlist.some((s) => s.ticker === ticker)) {
        setAddError(`${ticker} is already in your watchlist.`);
        return;
      }

      // Validate by calling the API first
      setLoading((prev) => new Set(prev).add(ticker));
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticker }),
        });
        const data = await res.json();
        if (!res.ok) {
          setAddError(data.error ?? `Could not find ticker "${ticker}".`);
          return;
        }
        const analysis = data as StockAnalysis;
        setWatchlist((prev) => [
          ...prev,
          { ticker, name: analysis.quote.name, addedAt: Date.now() },
        ]);
        setAnalyses((prev) => ({ ...prev, [ticker]: analysis }));
      } catch {
        setAddError(`Failed to add "${ticker}". Please try again.`);
      } finally {
        setLoading((prev) => {
          const next = new Set(prev);
          next.delete(ticker);
          return next;
        });
      }
    },
    [watchlist]
  );

  const removeTicker = useCallback((ticker: string) => {
    setWatchlist((prev) => prev.filter((s) => s.ticker !== ticker));
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

  const refreshTicker = useCallback(
    (ticker: string) => {
      analyzeTickerInternal(ticker);
    },
    [analyzeTickerInternal]
  );

  const refreshAll = useCallback(() => {
    watchlist.forEach((s) => analyzeTickerInternal(s.ticker));
  }, [watchlist, analyzeTickerInternal]);

  const clearAddError = useCallback(() => setAddError(null), []);

  return {
    watchlist,
    analyses,
    loading,
    errors,
    addError,
    addTicker,
    removeTicker,
    refreshTicker,
    refreshAll,
    clearAddError,
  };
}
