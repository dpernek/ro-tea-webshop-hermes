import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles static and dynamic Next.js pages natively.
  // We keep the default output format for optimal performance on Vercel.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "fmqcjvoemdmghikrzulk.supabase.co" },
    ],
  },
  trailingSlash: false,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
