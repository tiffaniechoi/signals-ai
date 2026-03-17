"use client";

/** Sticky top navigation bar with active-route highlighting. */
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        style={{
          fontFamily: "var(--font-space-grotesk), sans-serif",
          fontSize: "1.05rem",
          fontWeight: isActive ? 700 : 500,
          color: isActive ? "#2563EB" : "#71717A",
          textDecoration: "none",
          letterSpacing: "0.02em",
          paddingBottom: "3px",
          borderBottom: isActive ? "2.5px solid #2563EB" : "2.5px solid transparent",
          transition: "color 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.color = "#18181B";
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.color = "#71717A";
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header
      style={{
        borderBottom: "1px solid #E4E1DA",
        backgroundColor: "#FFFFFF",
        position: "sticky",
        top: 0,
        zIndex: 50,
        width: "100%",
        boxShadow: "0 1px 0 #E4E1DA, 0 4px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "0 3rem",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.625rem" }}>
            {/* Brand mark — identical to favicon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" style={{ flexShrink: 0 }}>
              <defs>
                <linearGradient id="logo-g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB"/>
                  <stop offset="100%" stopColor="#16A34A"/>
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="7" fill="url(#logo-g)"/>
              <polyline points="4,22 9,14 14,18 20,9 28,13" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#18181B",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Signal
            </span>
          </Link>
          <span
            style={{
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              backgroundColor: "#EFF6FF",
              border: "1px solid #BFDBFE",
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#2563EB",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            AI
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          {navLink("/", "Markets")}
          {navLink("/watchlist", "My Watchlist")}
        </nav>
      </div>
    </header>
  );
}
