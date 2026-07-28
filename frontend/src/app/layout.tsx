import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d0e1a" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "MarketPilot AI — The Autonomous AI Marketing Team",
    template: "%s | MarketPilot AI",
  },
  description:
    "AI-powered marketing operating system for small businesses. Automate content, SEO, ads, campaigns, and analytics with a single input.",
  keywords: [
    "AI marketing",
    "marketing automation",
    "content generation",
    "SEO optimization",
    "campaign management",
    "marketing analytics",
    "small business marketing",
    "AI marketing platform",
    "digital marketing AI",
    "marketing operating system",
  ],
  authors: [{ name: "MarketPilot AI" }],
  creator: "MarketPilot AI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://marketpilot.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "MarketPilot AI",
    title: "MarketPilot AI — The Autonomous AI Marketing Team",
    description:
      "AI-powered marketing operating system for small businesses. Automate content, SEO, ads, campaigns, and analytics with a single input.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MarketPilot AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketPilot AI — The Autonomous AI Marketing Team",
    description:
      "AI-powered marketing operating system for small businesses.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.classList.add(t)}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <Providers>
          <div className="min-h-screen bg-background antialiased">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
