import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
      "images.unsplash.com", // สำหรับ Unsplash images
      "plus.unsplash.com", // สำหรับ Unsplash plus images
      "via.placeholder.com", // สำหรับ placeholder images
      "res.cloudinary.com", // สำหรับ Cloudinary
      "amazonaws.com", // สำหรับ AWS S3
      "s3.amazonaws.com",
    ],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
        pathname: "/**",
      },
    ],
    // ⭐ เพิ่ม unoptimized สำหรับ development
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
