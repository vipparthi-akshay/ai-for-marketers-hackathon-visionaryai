import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MarketPilot AI - The Autonomous AI Marketing Team",
  description: "AI-powered marketing operating system for small businesses. Automate content, SEO, ads, campaigns, and analytics.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "MarketPilot AI",
    description: "The Autonomous AI Marketing Team",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-background antialiased">
          {children}
        </div>
      </body>
    </html>
  );
}
