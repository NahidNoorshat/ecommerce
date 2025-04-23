/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "13.51.157.149",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
