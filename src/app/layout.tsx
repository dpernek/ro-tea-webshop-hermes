import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalPublicLayout } from "@/components/layout/ConditionalPublicLayout";
import { site } from "@/lib/data";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} | ${site.tagline}`,
  description: site.description,
  metadataBase: new URL(site.url),
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    type: "website",
    images: [
      {
        url: "/images/rotea-logo.webp",
        width: 1170,
        height: 180,
        alt: site.name,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://ro-tea-webshop-hermes.vercel.app" />
        {/* DNS-prefetch for external resources */}
        <link rel="dns-prefetch" href="https://ro-tea-webshop-hermes.vercel.app" />
        {/* Preload LCP hero image (first slide) */}
        <link
          rel="preload"
          as="image"
          href="/images/hero/hero-welder-1920w.webp"
          fetchPriority="high"
        />
        {/* GLS ParcelShop map widget — loads custom <gls-dpm> element */}
        <script type="module" src="https://map.gls-hungary.com/widget/gls-dpm.js" />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <ConditionalPublicLayout>{children}</ConditionalPublicLayout>
      </body>
    </html>
  );
}
