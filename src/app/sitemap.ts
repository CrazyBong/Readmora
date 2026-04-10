import type { MetadataRoute } from 'next';
import { stat } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://readmora.space';

const publicRoutes = [
  { url: '/', file: 'src/app/page.tsx' },
  { url: '/login', file: 'src/app/(auth)/login/page.tsx' },
  { url: '/signup', file: 'src/app/(auth)/signup/page.tsx' },
] as const;

async function getLastModified(filePath: string) {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    const fileStats = await stat(absolutePath);
    return fileStats.mtime;
  } catch {
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return Promise.all(
    publicRoutes.map(async (route) => ({
      url: `${SITE_URL}${route.url}`,
      lastModified: await getLastModified(route.file),
      changeFrequency: route.url === '/' ? 'daily' : 'weekly',
      priority: route.url === '/' ? 1 : 0.7,
    }))
  );
}
