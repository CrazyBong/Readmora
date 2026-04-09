import { describe, it, expect } from 'vitest';
import {
  UpdateProfileSchema,
  AddToShelfSchema,
  AiSummaryRequestSchema,
  CompleteOnboardingSchema,
} from '@/types/api';

describe('UpdateProfileSchema', () => {
  it('accepts a valid update', () => {
    const result = UpdateProfileSchema.safeParse({
      username: 'book_lover_123',
      bio: 'I read 50 books a year!',
      vibe_preference: 'wildflower',
    });
    expect(result.success).toBe(true);
  });

  it('rejects username shorter than 3 characters', () => {
    const result = UpdateProfileSchema.safeParse({ username: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects username with special characters', () => {
    const result = UpdateProfileSchema.safeParse({ username: 'user name!' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid vibe_preference', () => {
    const result = UpdateProfileSchema.safeParse({ vibe_preference: 'dark_academia' });
    expect(result.success).toBe(false);
  });

  it('rejects avatar_url that is not a URL', () => {
    const result = UpdateProfileSchema.safeParse({ avatar_url: 'not-a-url' });
    expect(result.success).toBe(false);
  });
});

describe('AddToShelfSchema', () => {
  it('accepts a valid shelf entry', () => {
    const result = AddToShelfSchema.safeParse({
      book_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      shelf: 'finished',
      rating: 5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects rating outside 1-5', () => {
    const result = AddToShelfSchema.safeParse({
      book_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      shelf: 'finished',
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid shelf value', () => {
    const result = AddToShelfSchema.safeParse({
      book_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      shelf: 'reading',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-UUID book_id', () => {
    const result = AddToShelfSchema.safeParse({
      book_id: 'not-a-uuid',
      shelf: 'want_to_read',
    });
    expect(result.success).toBe(false);
  });
});

describe('AiSummaryRequestSchema', () => {
  it('accepts a valid UUID book_id', () => {
    const result = AiSummaryRequestSchema.safeParse({
      book_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing book_id', () => {
    const result = AiSummaryRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('CompleteOnboardingSchema', () => {
  it('accepts a valid onboarding payload', () => {
    const result = CompleteOnboardingSchema.safeParse({
      username: 'readmora_user',
      genre_preferences: ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror'],
      vibe_preference: 'botanical',
    });
    expect(result.success).toBe(true);
  });

  it('rejects genre_preferences with fewer than 5 entries', () => {
    const result = CompleteOnboardingSchema.safeParse({
      username: 'readmora_user',
      genre_preferences: ['Fantasy', 'Sci-Fi', 'Mystery'],
      vibe_preference: 'botanical',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid vibe_preference during onboarding', () => {
    const result = CompleteOnboardingSchema.safeParse({
      username: 'readmora_user',
      genre_preferences: ['Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Horror'],
      vibe_preference: 'invalid_vibe',
    });
    expect(result.success).toBe(false);
  });
});
