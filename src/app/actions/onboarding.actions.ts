'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProfileRepository } from '@/repository/profiles.repository';
import { CompleteOnboardingSchema, type CompleteOnboardingInput, ErrorCode } from '@/types/api';
import { AppError } from '@/lib/error';
import { isValidVibe } from '@/lib/books';
import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';

/**
 * Validates if a username is available.
 * Used for live validation in the onboarding form.
 */
export async function checkUsername(username: string): Promise<boolean> {
  try {
    const supabase = createSupabaseServerClient();
    // Validate string pattern first
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return false;
    }
    return await ProfileRepository.isUsernameAvailable(supabase, username);
  } catch (err) {
    logger.error({ err, username }, 'checkUsername failed');
    return false; // Fail safe
  }
}

/**
 * Completes the onboarding process, updating the user's profile
 * and marking onboarding_complete as true.
 */
export async function submitOnboarding(input: CompleteOnboardingInput) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    // Validate payload against schema
    const payload = CompleteOnboardingSchema.parse(input);

    // Additional runtime validation for vibe_preference
    if (!isValidVibe(payload.vibe_preference)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid vibe preference selected', 400);
    }

    const profile = await ProfileRepository.completeOnboarding(supabase, user.id, {
      username: payload.username,
      genre_preferences: payload.genre_preferences,
      vibe_preference: payload.vibe_preference,
      avatar_url: payload.avatar_url,
    } as Parameters<typeof ProfileRepository.completeOnboarding>[2]);

    // Revalidate paths to reflect new vibe
    revalidatePath('/', 'layout');

    return { success: true, profile };
  } catch (err) {
    logger.error({ err, input }, 'submitOnboarding failed');

    if (err instanceof ZodError) {
      return {
        success: false,
        error: (err as ZodError).issues[0]?.message || 'Validation error',
        code: ErrorCode.VALIDATION_ERROR,
      };
    }
    if (err instanceof AppError) {
      return { success: false, error: err.message, code: err.code };
    }
    return {
      success: false,
      error: 'Failed to complete onboarding. Please try again.',
      code: ErrorCode.INTERNAL_ERROR,
    };
  }
}
