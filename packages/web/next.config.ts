import type { NextConfig } from "next"

const apiUrl = process.env.API_URL ?? "http://localhost:3000"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
      {
        source: "/auth/cli/:path*",
        destination: `${apiUrl}/auth/cli/:path*`,
      },
    ]
  },
}

export default nextConfig
