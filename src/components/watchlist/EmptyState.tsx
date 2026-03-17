"use client";

/** Empty state shown on the Watchlist page before any tickers are added. */
interface EmptyStateProps {
  onAdd: (ticker: string) => void;
}

const SUGGESTIONS = ["SPY", "QQQ", "^GSPC", "AAPL", "BTC-USD"];

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "5rem 2rem",
        gap: "1.75rem",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "1rem",
          background: "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)",
          border: "1.5px solid #BFDBFE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          boxShadow: "0 2px 8px rgba(37,99,235,0.1)",
        }}
      >
        📡
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#18181B",
            margin: 0,
          }}
        >
          No securities tracked yet
        </h2>
        <p
          style={{
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "1.05rem",
            color: "#71717A",
            margin: 0,
            maxWidth: "420px",
            lineHeight: 1.6,
          }}
        >
          Search for any stock, ETF, index, or crypto above to get AI-powered sentiment analysis.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.72rem",
            color: "#A1A1AA",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Quick add
        </span>
        <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", justifyContent: "center" }}>
          {SUGGESTIONS.map((ticker) => (
            <button
              key={ticker}
              onClick={() => onAdd(ticker)}
              style={{
                padding: "0.45rem 1rem",
                borderRadius: "9999px",
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E4E1DA",
                color: "#52525B",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: "pointer",
                letterSpacing: "0.06em",
                transition: "all 0.15s",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#EFF6FF";
                e.currentTarget.style.borderColor = "#BFDBFE";
                e.currentTarget.style.color = "#2563EB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
                e.currentTarget.style.borderColor = "#E4E1DA";
                e.currentTarget.style.color = "#52525B";
              }}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
