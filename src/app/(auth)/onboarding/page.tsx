import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import OnboardingFlow from './OnboardingFlow';

export const metadata = {
  title: 'Onboarding — Readmora',
};

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileData = profile as { onboarding_complete: boolean } | null;

  if (profileData?.onboarding_complete) {
    redirect('/home');
  }

  return (
    <div className="onboarding-page min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* Full-page sunny yellow radial glow — sits behind everything */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 40%, #fde047 0%, transparent 65%)',
          opacity: 0.5,
        }}
      />
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="w-full max-w-md">
          <OnboardingFlow userEmail={user.email ?? ''} />
        </div>
      </div>
    </div>
  );
}
