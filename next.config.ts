import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large base64 payloads for PDF/image uploads to the AI proxy
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};


export default nextConfig;
