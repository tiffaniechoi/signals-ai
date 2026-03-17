"use client";

/** Clickable news link with publisher and relative timestamp. */
import type { NewsItem as NewsItemType } from "@/types";

/**
 * Converts a Yahoo Finance Unix timestamp (seconds) to a human-readable
 * relative string, e.g. "3h ago", "2d ago".
 */
function relativeTime(epochSecs: number): string {
  const diff = Math.floor(Date.now() / 1000) - epochSecs;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface NewsItemProps {
  item: NewsItemType;
}

export function NewsItem({ item }: NewsItemProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        padding: "0.625rem 0",
        borderBottom: "1px solid #F4F2ED",
        textDecoration: "none",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.65")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <p
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "0.9rem",
          color: "#3F3F46",
          lineHeight: 1.5,
          marginBottom: "0.25rem",
          fontWeight: 500,
        }}
      >
        {item.title}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.72rem",
            color: "#A1A1AA",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {item.publisher}
        </span>
        <span style={{ color: "#D4D2CC", fontSize: "0.7rem" }}>·</span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "0.72rem",
            color: "#A1A1AA",
          }}
        >
          {relativeTime(item.providerPublishTime)}
        </span>
      </div>
    </a>
  );
}
