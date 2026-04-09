'use client';

interface PaywallModalProps {
  resetsAt: string;
  onClose: () => void;
}

function formatDate(iso: string): string {
  if (!iso) return 'next week';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'next week';
  }
}

export default function PaywallModal({ resetsAt, onClose }: PaywallModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[color:var(--color-bg)] border border-white/20 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h2 className="text-xl font-bold text-[color:var(--foreground)] mb-2">
          Weekly Limit Reached
        </h2>
        <p className="text-sm text-[color:var(--foreground)] opacity-70 mb-2">
          You&apos;ve used your 3 free AI summaries for this week.
        </p>
        <p className="text-sm text-[color:var(--foreground)] opacity-50 mb-6">
          Resets on <strong>{formatDate(resetsAt)}</strong>
        </p>

        <div className="space-y-3">
          <div className="bg-[color:var(--color-primary)] text-white rounded-xl p-4">
            <p className="font-bold text-base mb-1">Readmora Premium</p>
            <p className="text-sm opacity-90 mb-3">Unlimited AI summaries, every week</p>
            <div className="flex gap-2 justify-center text-sm">
              <span className="bg-white/20 rounded-lg px-3 py-1.5 font-semibold">₹149 / mo</span>
              <span className="bg-white/20 rounded-lg px-3 py-1.5 font-semibold">₹999 / yr</span>
            </div>
          </div>

          <button
            onClick={() => {
              window.location.href = '/settings?upgrade=true';
            }}
            className="w-full login-btn login-btn--primary"
          >
            Upgrade to Premium →
          </button>
          <button
            onClick={onClose}
            className="w-full text-sm text-[color:var(--foreground)] opacity-50 hover:opacity-80 transition-opacity py-2"
          >
            Wait until {formatDate(resetsAt)}
          </button>
        </div>
      </div>
    </div>
  );
}
