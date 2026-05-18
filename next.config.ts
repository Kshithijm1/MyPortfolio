import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <-- ADD THIS LINE
  images: {
    unoptimized: true, // <-- ADD THIS LINE (GitHub Pages doesn't support Next.js default image optimization)
  },
};

export default nextConfig;