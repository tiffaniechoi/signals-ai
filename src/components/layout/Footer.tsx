/** Site footer with financial disclaimer and data-source attribution. */
export function Footer() {
  return (
    <footer className="footer-padding" style={{ borderTop: "1px solid #E4E1DA", backgroundColor: "#FFFFFF" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <p style={{ fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: "0.85rem", color: "#A1A1AA", margin: 0 }}>
          ⚠ Not financial advice — for informational purposes only.
        </p>
        <p style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: "0.75rem", color: "#C4C2BC", margin: 0, letterSpacing: "0.04em" }}>
          Yahoo Finance · Groq AI
        </p>
      </div>
    </footer>
  );
}
