import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import SettingsInterface from './SettingsInterface';

export const metadata = { title: 'Settings — Readmora' };

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const admin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin.from('profiles') as any)
    .select(
      'username, avatar_url, bio, vibe_preference, subscription_status, subscription_expires_at'
    )
    .eq('id', user.id)
    .maybeSingle();

  const isPremium =
    profile?.subscription_status === 'premium' &&
    (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">Settings</h1>
        <p className="text-muted-foreground font-bold text-sm tracking-tight opacity-60">
          Tailor your reading experience and profile.
        </p>
      </div>

      <SettingsInterface
        currentVibe={profile?.vibe_preference ?? 'wildflower'}
        currentUsername={profile?.username ?? ''}
        currentBio={profile?.bio ?? ''}
        avatarUrl={profile?.avatar_url ?? null}
        isPremium={isPremium}
        subscriptionExpiresAt={profile?.subscription_expires_at ?? null}
        userId={user.id}
        userEmail={user.email ?? ''}
        userName={profile?.username ?? user.email ?? ''}
      />
    </div>
  );
}
