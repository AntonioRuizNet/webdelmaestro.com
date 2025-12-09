/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      {
        source: "/wp-content/uploads/:path*",
        destination: "https://media.webdelmaestro.com/uploads/:path*",
        permanent: true,
      },
      {
        source: "/educacion/wp-content/uploads/:path*",
        destination: "https://media.webdelmaestro.com/uploads/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
