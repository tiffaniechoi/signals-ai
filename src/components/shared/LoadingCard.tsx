"use client";

/**
 * LoadingCard — skeleton placeholder shown while a ticker's analysis is
 * being fetched. Pulse animation is defined inline to avoid a globals.css dep.
 */
export function LoadingCard({ ticker }: { ticker: string }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E4E1DA",
        borderLeft: "4px solid #E4E1DA",
        borderRadius: "0.75rem",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.125rem",
        minHeight: "320px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#18181B",
              letterSpacing: "0.08em",
            }}
          >
            {ticker}
          </span>
          <div style={{ width: "130px", height: "13px", backgroundColor: "#F4F2ED", borderRadius: "4px", animation: "shimmer 1.6s ease-in-out infinite" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end" }}>
          <div style={{ width: "100px", height: "26px", backgroundColor: "#F4F2ED", borderRadius: "4px", animation: "shimmer 1.6s ease-in-out infinite" }} />
          <div style={{ width: "120px", height: "22px", backgroundColor: "#F4F2ED", borderRadius: "9999px", animation: "shimmer 1.6s ease-in-out infinite 0.2s" }} />
        </div>
      </div>

      {/* Sentiment skeleton */}
      <div style={{ width: "220px", height: "32px", backgroundColor: "#F4F2ED", borderRadius: "9999px", animation: "shimmer 1.6s ease-in-out infinite 0.3s" }} />

      {/* Reasoning skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {[100, 88, 72].map((w, i) => (
          <div
            key={i}
            style={{
              width: `${w}%`,
              height: "13px",
              backgroundColor: "#F4F2ED",
              borderRadius: "4px",
              animation: `shimmer 1.6s ease-in-out infinite ${i * 0.12}s`,
            }}
          />
        ))}
      </div>

      {/* Analyzing indicator */}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "0.625rem" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#2563EB",
            animation: "pulse 1.2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.75rem",
            color: "#A1A1AA",
            letterSpacing: "0.1em",
          }}
        >
          ANALYZING...
        </span>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
