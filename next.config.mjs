function getSupabaseHostname() {
  const fallbackUrl = 'https://jmqfvhyqrukavhkjochs.supabase.co';

  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackUrl).hostname;
  } catch {
    return new URL(fallbackUrl).hostname;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [48, 64, 80, 96, 120, 160, 240, 320],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: getSupabaseHostname(),
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/djozgxq9k/**',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
