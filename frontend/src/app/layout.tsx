import type { Metadata, Viewport } from "next";
import "./globals.css";
import AIBackground from "@/components/AIBackground";
import CommandPalette from "@/components/CommandPalette";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0c15",
};

export const metadata: Metadata = {
  title: "MarketGenius AI — AI-Powered Marketing Automation Platform",
  description:
    "MarketGenius AI is a production-ready marketing automation platform that generates content, automates campaigns, personalizes customer journeys, and optimizes conversions using AI.",
  openGraph: {
    title: "MarketGenius AI",
    description: "AI-powered marketing automation: content generation, campaign automation, personalization, and analytics.",
    siteName: "MarketGenius AI",
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AIBackground />
        <div className="relative z-10">{children}</div>
        <CommandPalette />
      </body>
    </html>
  );
}
