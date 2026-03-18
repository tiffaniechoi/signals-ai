import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Signal — AI Stock Sentiment Predictor",
  description:
    "AI-powered sentiment analysis for stocks, ETFs, and indices. Real-time market data + Gemini-powered predictions.",
  openGraph: {
    title: "Signal — AI Stock Sentiment Predictor",
    description:
      "Track any ticker and get AI-powered bullish/bearish/neutral predictions powered by Gemini.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <Script src="https://www.clarity.ms/tag/vxck7j2i4k" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
