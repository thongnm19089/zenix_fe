const withNextIntl = require("next-intl/plugin")(
  "./src/i18n.ts"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, 
  
  // Keep this if antd styles break on refresh, but optimize imports below will help speed.
  transpilePackages: ["antd"], 
  swcMinify: true,
  
  // Add this to drastically speed up dev compilation for heavy UI libraries
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },

  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      canvas: "commonjs canvas",
    });
    return config;
  },

  images: {
    // Note: 'domains' is deprecated in Next 14+. Consider moving to 'remotePatterns' in the future.
    domains: ["dv73hlpty9r4q.cloudfront.net", "ik.imagekit.io", "images.macrumors.com"],
  },
};

module.exports = withNextIntl(nextConfig);
