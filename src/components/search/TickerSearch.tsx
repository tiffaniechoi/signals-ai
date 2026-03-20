"use client";

/**
 * TickerSearch — search input with 300 ms debounced autocomplete.
 * Calls GET /api/search, shows a styled dropdown, and submits via
 * click, Enter, or direct ticker entry.
 */
import { useState, useRef, useEffect, useCallback } from "react";

interface Suggestion {
  ticker: string;
  name: string;
  type: string;
}

interface TickerSearchProps {
  onAdd: (ticker: string) => void;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

const TYPE_STYLE: Record<string, { color: string; bg: string }> = {
  Stock:        { color: "#16A34A", bg: "#F0FDF4" },
  ETF:          { color: "#2563EB", bg: "#EFF6FF" },
  INDEX:        { color: "#7C3AED", bg: "#F5F3FF" },
  CRYPTOCURRENCY: { color: "#D97706", bg: "#FFFBEB" },
  Crypto:       { color: "#D97706", bg: "#FFFBEB" },
};

export function TickerSearch({ onAdd, isLoading, error, onClearError }: TickerSearchProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [fetching, setFetching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) { setSuggestions([]); setShowDropdown(false); return; }
    setFetching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.results ?? []);
      setShowDropdown((data.results ?? []).length > 0);
    } catch {
      setSuggestions([]); setShowDropdown(false);
    } finally {
      setFetching(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);
    setHighlighted(-1);
    if (error) onClearError();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v.trim()), 300);
  }

  function handleSelect(ticker: string) {
    setValue(""); setSuggestions([]); setShowDropdown(false); setHighlighted(-1);
    onAdd(ticker);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (highlighted >= 0 && suggestions[highlighted]) {
      handleSelect(suggestions[highlighted].ticker); return;
    }
    const ticker = value.trim().toUpperCase();
    if (!ticker) return;
    setValue(""); setSuggestions([]); setShowDropdown(false);
    onAdd(ticker);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Escape") { setShowDropdown(false); setHighlighted(-1); }
  }

  function handleBlur() {
    blurTimeoutRef.current = setTimeout(() => { setShowDropdown(false); setHighlighted(-1); }, 150);
  }

  function handleFocus() {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (suggestions.length > 0) setShowDropdown(true);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ maxWidth: "640px", width: "100%" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.75rem" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Search ticker or company name…"
              disabled={isLoading}
              autoComplete="off"
              style={{
                width: "100%",
                padding: "0.875rem 1.25rem",
                backgroundColor: "#FFFFFF",
                border: `1.5px solid ${error ? "#DC2626" : showDropdown ? "#2563EB" : "#E4E1DA"}`,
                borderRadius: showDropdown ? "0.625rem 0.625rem 0 0" : "0.625rem",
                color: "#18181B",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "1rem",
                letterSpacing: "0.05em",
                outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxSizing: "border-box",
                boxShadow: showDropdown ? "0 0 0 3px rgba(37,99,235,0.1)" : "0 1px 3px rgba(0,0,0,0.06)",
              }}
            />
            {fetching && (
              <span style={{
                position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
                color: "#A1A1AA", fontSize: "0.8rem",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}>
                …
              </span>
            )}
            {/* Autocomplete dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #2563EB",
                  borderTop: "1px solid #E4E1DA",
                  borderRadius: "0 0 0.625rem 0.625rem",
                  overflow: "hidden",
                  zIndex: 100,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1), 0 0 0 3px rgba(37,99,235,0.08)",
                }}
              >
                {suggestions.map((s, i) => {
                  const ts = TYPE_STYLE[s.type] ?? { color: "#71717A", bg: "#F9F9F8" };
                  return (
                    <div
                      key={s.ticker}
                      onMouseDown={() => handleSelect(s.ticker)}
                      onMouseEnter={() => setHighlighted(i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.75rem 1.25rem",
                        cursor: "pointer",
                        backgroundColor: i === highlighted ? "#F8F7FF" : "transparent",
                        borderBottom: i < suggestions.length - 1 ? "1px solid #F4F2ED" : "none",
                        transition: "background-color 0.1s",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "#18181B",
                          letterSpacing: "0.08em",
                          minWidth: "68px",
                        }}
                      >
                        {s.ticker}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-space-grotesk), sans-serif",
                          fontSize: "0.9rem",
                          color: "#52525B",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.name}
                      </span>
                      <span
                        style={{
                          padding: "0.15rem 0.5rem",
                          borderRadius: "4px",
                          backgroundColor: ts.bg,
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                          fontSize: "0.68rem",
                          color: ts.color,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {s.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            style={{
              padding: "0.875rem 1.75rem",
              borderRadius: "0.625rem",
              backgroundColor: isLoading || !value.trim() ? "#F4F2ED" : "#2563EB",
              border: "none",
              color: isLoading || !value.trim() ? "#A1A1AA" : "#FFFFFF",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: isLoading || !value.trim() ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
              letterSpacing: "0.03em",
              flexShrink: 0,
              boxShadow: isLoading || !value.trim() ? "none" : "0 2px 6px rgba(37,99,235,0.3)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && value.trim()) e.currentTarget.style.backgroundColor = "#1D4ED8";
            }}
            onMouseLeave={(e) => {
              if (!isLoading && value.trim()) e.currentTarget.style.backgroundColor = "#2563EB";
            }}
          >
            {isLoading ? "Adding…" : "+ Add"}
          </button>
        </form>

      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.875rem",
            borderRadius: "0.5rem",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            fontFamily: "var(--font-space-grotesk), sans-serif",
            fontSize: "0.9rem",
            color: "#DC2626",
            fontWeight: 500,
          }}
        >
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
