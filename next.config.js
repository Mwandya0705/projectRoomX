/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['img.clerk.com', 'images.unsplash.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Increased for image uploads (max 5MB)
    },
  },
}

module.exports = nextConfig

