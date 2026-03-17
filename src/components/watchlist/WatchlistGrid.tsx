"use client";

/**
 * WatchlistGrid — responsive grid that maps a watchlist to StockCards.
 *
 * Renders a LoadingCard while a ticker is being fetched, an error card if
 * the fetch failed, and the full StockCard once analysis is available.
 * Shows EmptyState when the watchlist is empty (non-readOnly pages only).
 */
import { AnimatePresence } from "framer-motion";
import type { TrackedSecurity, StockAnalysis } from "@/types";
import { StockCard } from "./StockCard";
import { LoadingCard } from "@/components/shared/LoadingCard";
import { EmptyState } from "./EmptyState";

interface WatchlistGridProps {
  watchlist: TrackedSecurity[];
  analyses: Record<string, StockAnalysis>;
  loading: Set<string>;
  errors: Record<string, string>;
  onRemove: (ticker: string) => void;
  onRefresh: (ticker: string) => void;
  onAdd?: (ticker: string) => void;
  readOnly?: boolean;
}

export function WatchlistGrid({
  watchlist,
  analyses,
  loading,
  errors,
  onRemove,
  onRefresh,
  onAdd,
  readOnly = false,
}: WatchlistGridProps) {
  if (watchlist.length === 0 && !readOnly) {
    return <EmptyState onAdd={onAdd ?? (() => {})} />;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
        gap: "1.5rem",
      }}
    >
      <AnimatePresence>
        {watchlist.map((security) => {
          const isLoading = loading.has(security.ticker);
          const analysis = analyses[security.ticker];
          const error = errors[security.ticker];

          if (isLoading) {
            return <LoadingCard key={security.ticker} ticker={security.ticker} />;
          }

          if (error && !analysis) {
            return (
              <div
                key={security.ticker}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid rgba(239,68,68,0.3)",
                  borderRadius: "0.75rem",
                  padding: "1.75rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "#0F172A",
                    letterSpacing: "0.1em",
                  }}
                >
                  {security.ticker}
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-space-grotesk), sans-serif",
                    fontSize: "0.95rem",
                    color: "#EF4444",
                  }}
                >
                  {error}
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => onRefresh(security.ticker)}
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: "0.375rem",
                      backgroundColor: "transparent",
                      border: "1.5px solid #E2E8F0",
                      color: "#64748B",
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => onRemove(security.ticker)}
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: "0.375rem",
                      backgroundColor: "transparent",
                      border: "1.5px solid #E2E8F0",
                      color: "#64748B",
                      fontFamily: "var(--font-space-grotesk), sans-serif",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          }

          if (!analysis) {
            return <LoadingCard key={security.ticker} ticker={security.ticker} />;
          }

          return (
            <StockCard
              key={security.ticker}
              analysis={analysis}
              onRemove={onRemove}
              onRefresh={onRefresh}
              readOnly={readOnly}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
