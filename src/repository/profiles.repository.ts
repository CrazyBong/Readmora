import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '@/types/database';
import type { UpdateProfileInput } from '@/types/api';
import { AppError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { ErrorCode } from '@/types/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>;

/**
 * ProfileRepository
 * All profile DB operations go through this layer.
 * The `db` parameter accepts both typed and admin clients.
 * Type safety is enforced at the return boundary via explicit casts.
 */
export const ProfileRepository = {
  async findById(db: AnyClient, userId: string): Promise<Profile | null> {
    const { data, error } = await db.from('profiles').select('*').eq('id', userId).maybeSingle();

    if (error) {
      logger.error({ err: error, userId }, 'ProfileRepository.findById failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to fetch profile', 500);
    }

    return data as Profile;
  },

  async isUsernameAvailable(db: AnyClient, username: string): Promise<boolean> {
    const { data, error } = await db
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      logger.error({ err: error, username }, 'ProfileRepository.isUsernameAvailable failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to check username availability', 500);
    }

    return data === null;
  },

  async update(db: AnyClient, userId: string, updates: UpdateProfileInput): Promise<Profile> {
    const { data, error } = await db
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError(ErrorCode.DUPLICATE_ENTRY, 'Username is already taken', 409);
      }
      logger.error({ err: error, userId }, 'ProfileRepository.update failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to update profile', 500);
    }

    return data as Profile;
  },

  async completeOnboarding(
    db: AnyClient,
    userId: string,
    payload: {
      username: string;
      genre_preferences: string[];
      vibe_preference: Profile['vibe_preference'];
      avatar_url?: string;
    }
  ): Promise<Profile> {
    const { data, error } = await db
      .from('profiles')
      .update({
        username: payload.username,
        genre_preferences: payload.genre_preferences,
        vibe_preference: payload.vibe_preference,
        avatar_url: payload.avatar_url ?? null,
        onboarding_complete: true,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError(ErrorCode.DUPLICATE_ENTRY, 'Username is already taken', 409);
      }
      logger.error({ err: error, userId }, 'ProfileRepository.completeOnboarding failed');
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to complete onboarding', 500);
    }

    return data as Profile;
  },

  async setSubscriptionStatus(
    db: AnyClient,
    userId: string,
    status: 'free' | 'premium',
    expiresAt: string | null
  ): Promise<void> {
    const { error } = await db
      .from('profiles')
      .update({ subscription_status: status, subscription_expires_at: expiresAt })
      .eq('id', userId);

    if (error) {
      logger.error(
        { err: error, userId, status },
        'ProfileRepository.setSubscriptionStatus failed'
      );
      throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to update subscription status', 500);
    }
  },
};
