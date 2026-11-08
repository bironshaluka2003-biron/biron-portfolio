import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { WaterTransitionProvider } from "@/components/water-transition-provider";
import { SiteFooter } from "@/components/site-footer";
import { LoadingIntro } from "@/components/loading-intro";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biron Shaluka | Portfolio",
  description:
    "The portfolio of Biron Shaluka, Computer Systems and Network Engineering undergraduate focused on networking and IT infrastructure.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
    >
      <head>
        <Script id="portfolio-intro-session-guard" strategy="beforeInteractive">
          {`(() => { try { const key = "biron-portfolio-intro-seen"; const root = document.documentElement; if (sessionStorage.getItem(key) === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { root.dataset.portfolioIntroSeen = "true"; } else { sessionStorage.setItem(key, "true"); } } catch (_) {} })();`}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col">
        <WaterTransitionProvider>
          <LoadingIntro />
          <Navigation />
          {children}
          <SiteFooter />
        </WaterTransitionProvider>
      </body>
    </html>
  );
}
