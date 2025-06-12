import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'utfs.io',
      'uploadthing.com',
      '*.ufs.sh'
    ],
  },
};

export default nextConfig;
