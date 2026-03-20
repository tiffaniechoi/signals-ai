"use client";

/**
 * StockCard — animated card showing quote, AI sentiment, news, and actions.
 *
 * A 4px left border is colored by sentiment so the entire grid is
 * scannable at a glance without reading individual labels.
 * News is collapsed to 2 items with a "Show more" toggle to keep cards compact.
 * In readOnly mode the Remove button is hidden.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import type { StockAnalysis, Sentiment } from "@/types";
import { SentimentBadge } from "./SentimentBadge";
import { NewsItem } from "./NewsItem";

interface StockCardProps {
  analysis: StockAnalysis;
  onRemove: (ticker: string) => void;
  onRefresh: (ticker: string) => void;
  readOnly?: boolean;
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(1)}B`;
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`;
  return vol.toString();
}

/** Left border color keyed to sentiment for at-a-glance grid scanning. */
const SENTIMENT_COLOR: Record<Sentiment, string> = {
  bullish: "#16A34A",
  bearish: "#DC2626",
  neutral: "#D97706",
};

const NEWS_PREVIEW = 2; // items shown before "Show more"

export function StockCard({ analysis, onRemove, onRefresh, readOnly = false }: StockCardProps) {
  const { quote, news, sentiment } = analysis;
  const [showAllNews, setShowAllNews] = useState(false);

  const isPositive = quote.changePercent >= 0;
  const changeColor = isPositive ? "#16A34A" : "#DC2626";
  const changeSign = isPositive ? "+" : "";
  const accentColor = SENTIMENT_COLOR[sentiment.sentiment];

  const visibleNews = showAllNews ? news : news.slice(0, NEWS_PREVIEW);
  const hasMore = news.length > NEWS_PREVIEW;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E4E1DA",
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: "0.75rem",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header: ticker + price */}
      <div
        style={{
          padding: "1.5rem 1.75rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#18181B",
              letterSpacing: "0.08em",
              marginBottom: "0.25rem",
            }}
          >
            {quote.ticker}
          </div>
          <div
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "0.95rem",
              color: "#71717A",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "min(200px, 40vw)",
            }}
          >
            {quote.name}
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "clamp(1.5rem, 5vw, 2rem)",
              fontWeight: 700,
              color: "#18181B",
              letterSpacing: "0.01em",
              lineHeight: 1,
            }}
          >
            ${formatPrice(quote.price)}
          </div>
          {/* Change pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginTop: "0.375rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              backgroundColor: isPositive ? "#F0FDF4" : "#FEF2F2",
              border: `1px solid ${isPositive ? "#BBF7D0" : "#FECACA"}`,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "0.88rem",
                fontWeight: 600,
                color: changeColor,
              }}
            >
              {changeSign}{formatPrice(quote.change)} ({changeSign}{quote.changePercent.toFixed(2)}%)
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.75rem",
              color: "#A1A1AA",
              marginTop: "0.3rem",
              letterSpacing: "0.04em",
            }}
          >
            VOL {formatVolume(quote.volume)}
          </div>
        </div>
      </div>

      <div style={{ height: "1px", backgroundColor: "#F4F2ED", margin: "0 1.75rem" }} />

      {/* Sentiment section */}
      <div style={{ padding: "1.25rem 1.75rem" }}>
        <SentimentBadge
          sentiment={sentiment.sentiment}
          confidence={sentiment.confidence}
          prediction={sentiment.prediction}
        />

        {/* Summary bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", margin: "0.875rem 0" }}>
          {sentiment.summary.map((point, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
              <span
                style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  backgroundColor: accentColor, marginTop: "0.5rem", flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-space-grotesk), sans-serif",
                  fontSize: "0.95rem", color: "#3F3F46", lineHeight: 1.6,
                }}
              >
                {point}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "0.875rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.2rem 0.625rem",
            borderRadius: "4px",
            backgroundColor: "#F4F2ED",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.75rem",
            color: "#71717A",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          ⏱ {sentiment.timeframe}
        </div>
      </div>

      {/* News section — collapsed by default */}
      {news.length > 0 && (
        <div
          style={{
            padding: "1rem 1.75rem 1.125rem",
            backgroundColor: "#FAFAF8",
            borderTop: "1px solid #F4F2ED",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "0.72rem",
              color: "#A1A1AA",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
              fontWeight: 600,
            }}
          >
            Latest News
          </div>

          {visibleNews.map((item, i) => (
            <NewsItem key={i} item={item} />
          ))}

          {/* Show more / Show less toggle */}
          {hasMore && (
            <button
              onClick={() => setShowAllNews((v) => !v)}
              style={{
                marginTop: "0.625rem",
                padding: "0.35rem 0.75rem",
                borderRadius: "9999px",
                backgroundColor: "transparent",
                border: "1px solid #E4E1DA",
                color: "#71717A",
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#2563EB";
                e.currentTarget.style.color = "#2563EB";
                e.currentTarget.style.backgroundColor = "#EFF6FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E4E1DA";
                e.currentTarget.style.color = "#71717A";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {showAllNews
                ? "↑ Show less"
                : `↓ ${news.length - NEWS_PREVIEW} more article${news.length - NEWS_PREVIEW > 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      )}

      {/* Footer: timestamp + actions */}
      <div
        style={{
          padding: "0.875rem 1.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto",
          borderTop: "1px solid #F4F2ED",
          backgroundColor: "#FAFAF8",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.72rem",
            color: "#A1A1AA",
            letterSpacing: "0.04em",
          }}
        >
          {new Date(analysis.analyzedAt).toLocaleTimeString()}
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => onRefresh(quote.ticker)}
            title="Refresh analysis"
            style={{
              padding: "0.45rem 0.875rem", borderRadius: "0.375rem",
              backgroundColor: "transparent", border: "1px solid #E4E1DA",
              color: "#71717A", fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2563EB";
              e.currentTarget.style.color = "#2563EB";
              e.currentTarget.style.backgroundColor = "#EFF6FF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E4E1DA";
              e.currentTarget.style.color = "#71717A";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ↻ Refresh
          </button>
          {!readOnly && (
            <button
              onClick={() => onRemove(quote.ticker)}
              title="Remove from watchlist"
              style={{
                padding: "0.45rem 0.875rem", borderRadius: "0.375rem",
                backgroundColor: "transparent", border: "1px solid #E4E1DA",
                color: "#71717A", fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#DC2626";
                e.currentTarget.style.color = "#DC2626";
                e.currentTarget.style.backgroundColor = "#FEF2F2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E4E1DA";
                e.currentTarget.style.color = "#71717A";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              ✕ Remove
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
