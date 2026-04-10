/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProfileRepository } from '@/repository/profiles.repository';
import { AppError } from '@/lib/error';
import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';
import type { VibeId } from '@/types/database';
import { ErrorCode } from '@/types/api';
import { isValidVibe } from '@/lib/books';

export async function updateVibePreference(vibe_preference: VibeId) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);

    if (!isValidVibe(vibe_preference)) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid vibe ID', 400);
    }

    await ProfileRepository.update(supabase, user.id, { vibe_preference });

    // Revalidate everything to reflect the new vibe globally
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (err) {
    logger.error({ err, vibe_preference }, 'updateVibePreference failed');
    return { success: false, error: 'Failed to update vibe', code: ErrorCode.INTERNAL_ERROR };
  }
}

export async function updateProfile(updates: {
  username: string;
  bio: string;
  avatarUrl?: string | null;
}) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);

    if (updates.username.length < 3) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Username too short', 400);
    }

    // Use db alias to bypass strict Supabase row type constraints
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;
    const { error } = await db
      .from('profiles')
      .update({
        username: updates.username,
        bio: updates.bio || null,
        avatar_url: updates.avatarUrl || null,
      })
      .eq('id', user.id);

    if (error) {
      if (error.code === '23505') {
        // postgres unique violation
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Username is already taken.', 400);
      }
      throw error;
    }

    revalidatePath('/settings');
    revalidatePath('/home', 'layout');

    return { success: true };
  } catch (err) {
    logger.error({ err }, 'updateProfile failed');
    if (err instanceof AppError) {
      return { success: false, error: err.message, code: err.code };
    }
    return { success: false, error: 'Failed to update profile', code: ErrorCode.INTERNAL_ERROR };
  }
}
