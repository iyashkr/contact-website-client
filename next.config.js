/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "firebasestorage.googleapis.com",
      "cdn-icons-png.flaticon.com"
    ]
  },
}

module.exports = nextConfig
