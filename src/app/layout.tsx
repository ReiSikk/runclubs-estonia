import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import SiteFooter from "./components/Footer/SiteFooter";
// Providers
import Providers from "./providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Run Clubs Estonia | Find Run clubs in Tallinn, Tartu and across Estonia",
  description: "Find and join running clubs across Estonia. Connect with local running communities in Tallinn, Tartu, Pärnu and other cities. Free directory of Estonian run clubs.",
  keywords: "running, runclubs, run clubs, Estonia, Eesti run clubs, Estonia run clubs, Run clubs in Estonia, Run clubs in Tallinn, Run Clubs in Tartu, Tartu, Tallinn, jooksuklubid, jooksmine, jooksijad eestis, Eesti run club, Eesti runners, run groups Estonia, run groups Tallinn, run groups Tartu, running club, running clubs, running clubs in Estonia, running clubs in Tallinn, running clubs in Tartu, running clubs in Pärnu",
  authors: [{ name: "Rei Sikk", url: "https://reihopsti.ee" }],
  creator: "Rei Sikk",
  openGraph: {
    title: "Run Clubs Estonia | Find Your Running Community",
    description: "Discover and join running clubs across Estonia. Connect with runners in Tallinn, Tartu, Pärnu and beyond.",
    type: 'website',
    siteName: "Run Clubs Estonia",
    url: "https://runclubs.ee",
    images: [
      {
        url: "../app/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt: "Run Clubs Estonia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Run Clubs Estonia | Find Your Running Community",
    description: "Discover running clubs across Estonia. Find and join a running community near you.",
    images: ["../app/opengraph-image.jpg"], 
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://runclubs.ee"),
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://runclubs.ee",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
        <body className={`${geistSans.variable} ${geistMono.variable} ${interTight.variable}`}>
              <Providers>{children}</Providers>
              <SiteFooter />
              <Script
                src="/js/analytics.js"
                data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
                strategy="afterInteractive"
                defer
              />
        </body>
          <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2ED5JW8H4V');
          `}
        </Script>
    </html>
  );
}
