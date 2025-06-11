/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
  eslint: {
    // Disable ESLint during build as we've already set up .eslintrc.json
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;