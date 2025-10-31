/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development',
    NEXT_PUBLIC_ENABLE_DEV_AUTH: process.env.NODE_ENV === 'development' ? 'true' : 'false',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: 'spw57w8h92.ufs.sh',
      },
    ],
  },
  eslint: {
    // Disable ESLint during build as we've already set up .eslintrc.json
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;