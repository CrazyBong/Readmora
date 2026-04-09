import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getURL } from '../utils';

describe('getURL', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it('should return localhost if no environment variables are set', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    expect(getURL()).toBe('http://localhost:3000');
  });

  it('should favor NEXT_PUBLIC_SITE_URL if set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://readmora.space';
    process.env.NEXT_PUBLIC_VERCEL_URL = 'readmora-preview.vercel.app';
    expect(getURL()).toBe('https://readmora.space');
  });

  it('should fallback to window.location.origin if env vars are missing (Client-side simulation)', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;

    // Simulate window.location.origin
    vi.stubGlobal('window', { location: { origin: 'https://readmora.space' } });

    expect(getURL()).toBe('https://readmora.space');
  });

  it('should use NEXT_PUBLIC_VERCEL_URL if SITE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_VERCEL_URL = 'readmora-preview.vercel.app';
    // Expect protocol enforcement
    expect(getURL()).toBe('https://readmora-preview.vercel.app');
  });

  it('should normalize paths with a leading slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://readmora.space';
    expect(getURL('home')).toBe('https://readmora.space/home');
    expect(getURL('/home')).toBe('https://readmora.space/home');
  });

  it('should remove trailing slashes from the base URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://readmora.space/';
    expect(getURL('auth')).toBe('https://readmora.space/auth');
  });

  it('should handle complex paths', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://readmora.space';
    expect(getURL('/api/v1/search')).toBe('https://readmora.space/api/v1/search');
  });

  it('should enforce https for vercel URLs', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_VERCEL_URL = 'readmora.vercel.app';
    expect(getURL()).toBe('https://readmora.vercel.app');
  });
});
