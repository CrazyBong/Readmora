import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Home, Library, Settings, Compass, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import MobileBottomNav from '@/components/MobileBottomNav';
import { signOut } from '@/lib/actions/auth-actions';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  const profile = data as { username: string; avatar_url: string | null } | null;

  const navLinks = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/shelf', label: 'My Books', icon: Library },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  // We only pass a sanitized version of navLinks (no functions) to the Client Component
  const serializableNavLinks = navLinks.map(({ href, label }) => ({ href, label }));

  return (
    <div className="flex h-screen bg-[color:var(--color-bg)] overflow-hidden">
      {/* ── Desktop Sidebar (hidden on mobile) ──────────── */}
      <aside
        className="hidden md:flex w-[72px] shrink-0 border-r flex-col items-center py-6 bg-white/40 backdrop-blur-md z-50 h-full justify-between"
        style={{ borderColor: 'var(--color-primary)' }}
      >
        <div className="flex flex-col items-center gap-8 w-full">
          {/* Short Official Branding Logo */}
          <Link
            href="/home"
            className="w-12 h-12 mb-4 hover:scale-105 transition-transform rounded-full overflow-hidden border border-black/5 shadow-sm"
          >
            <Image
              src="https://res.cloudinary.com/djozgxq9k/image/upload/v1775730895/Gemini_Generated_Image_9a5qpf9a5qpf9a5q_xu6ewt.png"
              width={48}
              height={48}
              className="w-full h-full object-cover"
              alt="Readmora R"
            />
          </Link>

          <nav className="flex flex-col items-center gap-6 w-full">
            {navLinks.slice(0, 3).map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="p-3 text-foreground/70 hover:text-[color:var(--color-primary)] hover:bg-black/5 rounded-2xl transition-all"
                title={label}
              >
                <Icon className="w-6 h-6" strokeWidth={2} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <form action={signOut} className="w-full flex justify-center">
            <button
              type="submit"
              className="p-3 text-foreground/70 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
              title="Logout"
            >
              <LogOut className="w-6 h-6" strokeWidth={2} />
            </button>
          </form>
          <Link
            href="/settings"
            className="p-3 text-foreground/70 hover:text-[color:var(--color-primary)] hover:bg-black/5 rounded-2xl transition-all"
            title="Settings"
          >
            <Settings className="w-6 h-6" strokeWidth={2} />
          </Link>
          {/* Avatar Profile Link */}
          <Link
            href="/settings"
            className="w-10 h-10 rounded-full border-2 border-transparent hover:border-[color:var(--color-primary)] overflow-hidden transition-all shadow-sm flex items-center justify-center bg-[color:var(--color-primary)] text-white font-bold text-sm"
          >
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="Avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              profile?.username?.charAt(0).toUpperCase() || 'U'
            )}
          </Link>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="flex-1 w-full relative z-10 overflow-y-auto">{children}</main>

      {/* ── Mobile Bottom Navigation (hidden on md+) ─────── */}
      <MobileBottomNav
        navLinks={serializableNavLinks}
        avatarUrl={profile?.avatar_url ?? null}
        username={profile?.username ?? ''}
      />
    </div>
  );
}
