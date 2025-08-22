import withPWA from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // فقط أزل serverActions أو غيّرها لكائن فارغ
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  output: 'standalone',
};

export default withPWA({
  dest: 'public',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/jsonplaceholder\.typicode\.com/,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'api-cache' },
      },
    ],
  },
})(nextConfig);