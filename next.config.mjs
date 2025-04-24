/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.hairin.xyz",
        pathname: "/media/**",
      },
    ],
  },
};

export default nextConfig;
