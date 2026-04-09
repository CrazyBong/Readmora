/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import type { VibeId } from '@/types/database';
import type { SubscriptionPlan } from '@/types/database';
import { updateVibePreference, updateProfile } from '@/app/actions/settings.actions';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createRazorpayOrder } from '@/app/actions/subscription.actions';
import { Loader2, Check, Crown, Sparkles, User, Palette, Upload } from 'lucide-react';
import dynamic from 'next/dynamic';

const RazorpayCheckout = dynamic(() => import('@/components/RazorpayCheckout'), { ssr: false });

const VIBES: { id: VibeId; name: string; preview: string; color: string; primary: string }[] = [
  {
    id: 'wildflower',
    name: 'Wildflower',
    preview: 'Light, soothing periwinkle',
    color: '#E8ECF8',
    primary: '#A2A6F2',
  },
  {
    id: 'winter_frost',
    name: 'Winter Frost',
    preview: 'Cool dawn with rosewood accents',
    color: '#E3E9F4',
    primary: '#4A5568',
  },
  {
    id: 'sakura',
    name: 'Sakura',
    preview: 'Warm floral with chocolate tones',
    color: '#F2CFCA',
    primary: '#443025',
  },
  {
    id: 'botanical',
    name: 'Botanical',
    preview: 'Earthy greens, focused',
    color: '#DEC59E',
    primary: '#202808',
  },
  {
    id: 'harvest',
    name: 'Harvest',
    preview: 'Warm autumnal cream and tomato',
    color: '#F5EDD6',
    primary: '#C64632',
  },
];

interface SettingsInterfaceProps {
  currentVibe: VibeId;
  currentUsername: string;
  currentBio: string;
  avatarUrl: string | null;
  isPremium: boolean;
  subscriptionExpiresAt: string | null;
  userId: string;
  userEmail: string;
  userName: string;
}

export default function SettingsInterface({
  currentVibe,
  currentUsername,
  currentBio,
  avatarUrl,
  isPremium,
  subscriptionExpiresAt,
  userId,
  userEmail,
  userName,
}: SettingsInterfaceProps) {
  const [vibe, setVibe] = useState<VibeId>(currentVibe);
  const [vibeSaving, setVibeSaving] = useState(false);
  const [vibeSaved, setVibeSaved] = useState(false);

  const [username, setUsername] = useState(currentUsername);
  const [bio, setBio] = useState(currentBio);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  const [upgradeOrder, setUpgradeOrder] = useState<{
    orderId: string;
    plan: SubscriptionPlan;
    amount: number;
  } | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState<SubscriptionPlan | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  const handleVibeChange = async (newVibe: VibeId) => {
    setVibe(newVibe);
    document.documentElement.setAttribute('data-vibe', newVibe);
    setVibeSaving(true);
    setVibeSaved(false);
    const res = await updateVibePreference(newVibe);
    setVibeSaving(false);
    if (res.success) {
      setVibeSaved(true);
      setTimeout(() => setVibeSaved(false), 3000);
    } else {
      alert('Failed to save vibe. Please try again.');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSaved(false);
    setProfileError(null);
    const res = await updateProfile({ username, bio, avatarUrl: avatar });
    setProfileSaving(false);
    if (res.success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } else {
      setProfileError(res.error || 'Failed to save profile');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setAvatarUploading(true);
      setProfileError(null);
      const file = e.target.files?.[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file as any);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatar(data.publicUrl);
    } catch (error: any) {
      setProfileError(error.message || 'Error uploading image.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    setUpgradeLoading(plan);
    setUpgradeError(null);
    const result = await createRazorpayOrder(plan);
    setUpgradeLoading(null);
    if ('error' in result) {
      setUpgradeError(result.error);
      return;
    }
    setUpgradeOrder({ orderId: result.orderId, plan, amount: plan === 'annual' ? 99900 : 14900 });
  };

  const formatExpiry = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start pb-24 md:pb-8">
      {/* ── Column 1: Account Profile ────────────────── */}
      <section className="bg-white/40 border border-white/60 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 bg-[color:var(--color-primary)] text-white rounded-xl shadow-sm">
            <User className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-foreground tracking-tight uppercase">Profile</h2>
        </div>

        <div className="text-sm opacity-60 space-y-1 mb-8 pb-6 border-b border-black/5">
          <p>
            <span className="font-semibold text-foreground">Email:</span> {userEmail}
          </p>
          <p>
            <span className="font-semibold text-foreground">Member ID:</span> {userId.slice(0, 8)}
          </p>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-6">
          {profileError && (
            <p className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-xl">
              {profileError}
            </p>
          )}

          {/* Avatar */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-3 text-foreground/50">
              Photo
            </label>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-black/5 shadow-inner shrink-0 scale-100 hover:scale-105 transition-transform duration-300">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-9 h-9 text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-white border px-4 py-2 rounded-full text-xs font-black shadow-sm hover:shadow-md transition-all text-foreground uppercase tracking-wider active:scale-95">
                  {avatarUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {avatarUploading ? 'Uploading' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                </label>
                <p className="text-[10px] text-muted-foreground font-bold tracking-tight">
                  Best quality: 400x400 JPG/PNG
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-foreground/50">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/60 border border-black/5 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[color:var(--color-primary)]/10 transition-all font-bold text-foreground"
              placeholder="bookworm_99"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-foreground/50">
              Your Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              className="w-full bg-white/60 border border-black/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-[color:var(--color-primary)]/10 transition-all resize-none font-medium text-foreground leading-relaxed"
              placeholder="Tell the world about your reading style..."
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={profileSaving || (username === currentUsername && bio === currentBio)}
              className="bg-[color:var(--color-primary)] text-white px-8 py-3.5 rounded-full font-black text-sm hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center min-w-[140px] shadow-lg shadow-[color:var(--color-primary)]/20 active:scale-95"
            >
              {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Profile'}
            </button>
            {profileSaved && (
              <div className="flex items-center gap-1.5 text-green-600 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                <Check className="w-4 h-4" /> Updated
              </div>
            )}
          </div>
        </form>
      </section>

      {/* ── Column 2: Subscription ─────────────────── */}
      <section className="bg-white/40 border border-white/60 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 bg-[color:var(--color-accent)] text-white rounded-xl shadow-sm">
            <Crown className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-foreground tracking-tight uppercase">
            Membership
          </h2>
        </div>

        {isPremium ? (
          <div className="bg-gradient-to-br from-[color:var(--color-accent)]/10 to-transparent p-5 rounded-2xl border border-[color:var(--color-accent)]/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[color:var(--color-accent)] text-white text-[10px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase">
                Premium
              </span>
              <span className="text-sm font-bold text-foreground">Unlimited AI Summaries</span>
            </div>
            {subscriptionExpiresAt && (
              <p className="text-xs font-bold text-foreground/40 mt-1 uppercase tracking-widest">
                Renews {formatExpiry(subscriptionExpiresAt)}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-black/5 text-[10px] font-black px-4 py-2 rounded-full text-foreground/40 tracking-widest uppercase">
                Free Plan
              </span>
            </div>
            <p className="text-sm font-medium text-foreground/60 leading-relaxed bg-white/40 p-4 rounded-2xl border border-white/60 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[color:var(--color-accent)] shrink-0" />
              Upgrade to Premium for unlimited AI book summaries and exclusive theme accents.
            </p>

            {upgradeSuccess ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest border border-green-100">
                <Check className="w-5 h-5" /> Payment success! Reloading...
              </div>
            ) : (
              <>
                {upgradeError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-4 rounded-xl">
                    {upgradeError}
                  </p>
                )}
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => handleUpgrade('monthly')}
                    disabled={!!upgradeLoading}
                    className="group border border-black/5 bg-white/60 rounded-2xl p-6 text-left hover:border-[color:var(--color-primary)] transition-all active:scale-95 shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-black text-2xl text-[color:var(--color-primary)]">₹149</p>
                      {upgradeLoading === 'monthly' && (
                        <Loader2 className="w-5 h-5 animate-spin text-[color:var(--color-primary)]" />
                      )}
                    </div>
                    <p className="text-xs font-black text-foreground/40 tracking-widest uppercase">
                      Monthly Pass
                    </p>
                  </button>

                  <button
                    onClick={() => handleUpgrade('annual')}
                    disabled={!!upgradeLoading}
                    className="group border-2 border-[color:var(--color-accent)] bg-[color:var(--color-accent)]/5 rounded-2xl p-6 text-left hover:bg-[color:var(--color-accent)] hover:text-white transition-all active:scale-95 relative shadow-xl shadow-[color:var(--color-accent)]/5 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bg-[color:var(--color-accent)] text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl tracking-[0.2em] uppercase">
                      Save 44%
                    </div>
                    <div className="flex justify-between items-center mb-1 mt-2">
                      <p className="font-black text-2xl text-[color:var(--color-accent)] group-hover:text-white transition-colors">
                        ₹999
                      </p>
                      {upgradeLoading === 'annual' && (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      )}
                    </div>
                    <p className="text-xs font-black text-foreground/40 group-hover:text-white/60 transition-colors tracking-widest uppercase">
                      Annual Founder
                    </p>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* ── Column 3: Aesthetic Vibe ─────────────────── */}
      <section className="bg-white/40 border border-white/60 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 bg-foreground text-white rounded-xl shadow-sm">
            <Palette className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-foreground tracking-tight">The Vibe</h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {VIBES.map((v) => (
            <label
              key={v.id}
              style={{ backgroundColor: vibe === v.id ? 'white' : v.color }}
              className={`p-4 rounded-2xl flex items-center cursor-pointer transition-all border-2 ${
                vibe === v.id
                  ? 'border-[color:var(--color-primary)] shadow-md scale-[1.02]'
                  : 'border-black/5 hover:scale-[1.01]'
              }`}
            >
              <input
                type="radio"
                name="vibe"
                value={v.id}
                checked={vibe === v.id}
                onChange={() => handleVibeChange(v.id)}
                className="hidden"
              />
              <div className="flex items-center justify-between w-full">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full shadow-sm border border-black/5"
                      style={{ backgroundColor: v.primary }}
                    />
                    <p className="font-bold text-base text-foreground tracking-tight leading-none">
                      {v.name}
                    </p>
                  </div>
                  <p
                    className="text-xs font-semibold text-foreground/50 leading-snug pl-6.5"
                    style={{ paddingLeft: '26px' }}
                  >
                    {v.preview}
                  </p>
                </div>
                {vibe === v.id && (
                  <div className="bg-[color:var(--color-primary)] p-1.5 rounded-full text-white shadow-lg">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 flex items-center h-8 px-2">
          {vibeSaving && (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-3 text-[color:var(--color-primary)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                Syncing...
              </span>
            </>
          )}
          {vibeSaved && !vibeSaving && (
            <>
              <Check className="w-4 h-4 mr-3 text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-green-700">
                Aesthetic Preserved
              </span>
            </>
          )}
        </div>
      </section>

      {upgradeOrder && (
        <RazorpayCheckout
          orderId={upgradeOrder.orderId}
          amount={upgradeOrder.amount}
          plan={upgradeOrder.plan}
          userId={userId}
          userEmail={userEmail}
          userName={userName}
          onSuccess={() => {
            setUpgradeOrder(null);
            setUpgradeSuccess(true);
            setTimeout(() => window.location.reload(), 2000);
          }}
          onFailure={(reason) => {
            setUpgradeOrder(null);
            setUpgradeError(reason);
          }}
        />
      )}
    </div>
  );
}
