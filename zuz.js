/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
const path = require("path");

const buildConf = () => {

const [ d, distDir, bistDir ] = process.argv.find(v => v.indexOf('dir=') > -1).split("=")

return `import type { NextConfig } from "next";
import path from "path";
const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites(){
    return [
      { source: "/@/:method*/:action*", destination: "/api/:method*/:action*" },
      { source: "/@/:method*", destination: "/api/:method*" }
    ]
  },
  typedRoutes: false,
  distDir: "${bistDir || distDir || `.next`}",
  cleanDistDir: true,
  poweredByHeader: false,
  images: {
    loader: 'custom',
    loaderFile: './imgloader.ts',
    remotePatterns: [
        {
            protocol: "https",
            hostname: "*"
        }
    ]
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
    reactRemoveProperties: true,
  },

  // Experimental TypeScript features
  experimental: {
    
    
    // Enable server actions
    serverActions: {
      bodySizeLimit: '1mb',
      allowedOrigins: ['*']
    },
  },

  // Performance and build optimizations
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  typescript: { ignoreBuildErrors: true },
  allowedDevOrigins: ['*'],
  webpack: (config) => {

    config.resolve.fallback = {
      ...config.resolve.fallback,  
      fs: false,
      path: false,
      url: false
    };
    return config;
  },

};

export default nextConfig;`;
}

fs.writeFileSync(
    `./next.config.ts`,
    buildConf(),
    {
        encoding:'utf8',
        flag:'w'
    }
)