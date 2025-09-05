/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/mortgage-admin',
  assetPrefix: '/mortgage-admin',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
}

export default nextConfig