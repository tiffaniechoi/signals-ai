"use client";

/** Displays sentiment (bullish/bearish/neutral), confidence level, and directional arrow. */
import type { Sentiment, Confidence } from "@/types";

interface SentimentBadgeProps {
  sentiment: Sentiment;
  confidence: Confidence;
  prediction: "up" | "down" | "sideways";
}

const SENTIMENT_CONFIG = {
  bullish: {
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    icon: "▲",
    label: "Bullish",
  },
  bearish: {
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    icon: "▼",
    label: "Bearish",
  },
  neutral: {
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    icon: "◆",
    label: "Neutral",
  },
};

const CONFIDENCE_COLORS: Record<Confidence, { color: string; bg: string; border: string }> = {
  high:   { color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  medium: { color: "#71717A", bg: "#F4F4F5", border: "#E4E4E7" },
  low:    { color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
};

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  high: "High Confidence",
  medium: "Med Confidence",
  low: "Low Confidence",
};

export function SentimentBadge({ sentiment, confidence, prediction }: SentimentBadgeProps) {
  const cfg = SENTIMENT_CONFIG[sentiment];
  const confCfg = CONFIDENCE_COLORS[confidence];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
      {/* Main sentiment pill */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          padding: "0.375rem 0.875rem",
          borderRadius: "9999px",
          backgroundColor: cfg.bg,
          border: `1.5px solid ${cfg.border}`,
          color: cfg.color,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "0.95rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        <span style={{ fontSize: "0.7rem" }}>{cfg.icon}</span>
        {cfg.label}
      </span>

      {/* Confidence pill */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.3rem 0.75rem",
          borderRadius: "9999px",
          backgroundColor: confCfg.bg,
          border: `1px solid ${confCfg.border}`,
          color: confCfg.color,
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "0.8rem",
          fontWeight: 600,
          letterSpacing: "0.03em",
        }}
      >
        {CONFIDENCE_LABELS[confidence]}
      </span>

      {/* Direction arrow */}
      <span
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: "1rem",
          fontWeight: 700,
          color: cfg.color,
        }}
      >
        {prediction === "up" ? "↑" : prediction === "down" ? "↓" : "→"}
      </span>
    </div>
  );
}
