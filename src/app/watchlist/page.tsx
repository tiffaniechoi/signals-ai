"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TickerSearch } from "@/components/search/TickerSearch";
import { WatchlistGrid } from "@/components/watchlist/WatchlistGrid";
import { useWatchlist } from "@/hooks/useWatchlist";

export default function WatchlistPage() {
  const { watchlist, analyses, loading, errors, addError, addTicker, removeTicker, refreshTicker, refreshAll, clearAddError } = useWatchlist();
  const anyLoading = loading.size > 0;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, width: "100%", padding: "2.5rem 3rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: "2.5rem", fontWeight: 700, color: "#18181B",
                  margin: "0 0 0.375rem", letterSpacing: "0.04em",
                }}
              >
                My Watchlist
              </h1>
              <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "1.1rem", color: "#71717A", margin: 0 }}>
                Track any stock, ETF, index, or crypto with live AI sentiment analysis.
              </p>
            </div>

            {watchlist.length > 0 && (
              <button
                onClick={refreshAll}
                disabled={anyLoading}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.7rem 1.25rem", borderRadius: "0.5rem",
                  backgroundColor: "#FFFFFF", border: "1.5px solid #E4E1DA",
                  color: anyLoading ? "#A1A1AA" : "#52525B",
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: "0.95rem", fontWeight: 600,
                  cursor: anyLoading ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => {
                  if (!anyLoading) { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E4E1DA"; e.currentTarget.style.color = anyLoading ? "#A1A1AA" : "#52525B";
                }}
              >
                <span>{anyLoading ? "⏳" : "↻"}</span> Refresh All
              </button>
            )}
          </div>

          <TickerSearch onAdd={addTicker} isLoading={anyLoading && watchlist.length === 0} error={addError} onClearError={clearAddError} />
        </div>

        <WatchlistGrid watchlist={watchlist} analyses={analyses} loading={loading} errors={errors} onRemove={removeTicker} onRefresh={refreshTicker} onAdd={addTicker} />
      </main>

      <Footer />
    </div>
  );
}
