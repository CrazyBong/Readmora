'use client';

import { Quote, X, Download, Share2 } from 'lucide-react';
import { InstagramLogo, LinkedinLogo, FacebookLogo } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface SocialCardModalProps {
  bookTitle: string;
  bookAuthor: string;
  quote: string;
  onClose: () => void;
}

export default function SocialCardModal({
  bookTitle,
  bookAuthor,
  quote,
  onClose,
}: SocialCardModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleShare = (platform: string) => {
    console.log(`Sharing to ${platform}...`);
    // Implementation for social sharing would go here
  };

  const handleExport = () => {
    console.log('Exporting high-res image...');
    // Implementation for exporting as image (e.g., using html2canvas) would go here
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-[2.5rem] overflow-hidden w-full max-w-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-black/5 hover:bg-black/10 transition-all duration-300 z-50 hover:rotate-90"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Visual Card Side - Preview */}
          <div className="w-full md:w-[45%] aspect-square md:aspect-auto bg-[#0a0a0a] p-12 flex flex-col justify-between relative group overflow-hidden">
            {/* Dynamic Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/10 to-transparent opacity-60" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] group-hover:bg-indigo-500/30 transition-colors duration-1000" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Quote className="w-14 h-14 text-indigo-400 mb-8 opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110 origin-left" />
                <p className="text-white text-2xl md:text-3xl font-display italic leading-[1.2] tracking-tight mb-8 drop-shadow-sm">
                  &quot;{quote || 'Life itself is the most wonderful fairy tale.'}&quot;
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative z-10 pt-8 border-t border-white/10"
            >
              <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-[9px] mb-2 opacity-80">
                Source Archive
              </p>
              <h4 className="text-white font-bold text-2xl tracking-tighter mb-1 leading-tight">
                {bookTitle}
              </h4>
              <p className="text-white/50 text-sm font-medium italic">{bookAuthor}</p>
            </motion.div>

            {/* Branded Watermark */}
            <div className="absolute top-12 right-12 opacity-30 hover:opacity-100 transition-opacity flex items-center gap-2">
              <span className="text-white font-bold text-[10px] tracking-[0.2em] uppercase">
                Readmora
              </span>
            </div>
          </div>

          {/* Controls Side - Actions */}
          <div className="flex-1 p-10 md:p-14 flex flex-col justify-between bg-stone-50/30">
            <div className="space-y-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-4">
                  <Share2 className="w-3 h-3" />
                  Aesthetic Share
                </div>
                <h3
                  id="modal-title"
                  className="font-display font-bold text-4xl tracking-tight mb-3 text-stone-900 leading-none"
                >
                  Share the Vibe
                </h3>
                <p className="text-stone-500 text-base leading-relaxed font-medium">
                  Export this beautifully formatted snippet to your social circles.
                </p>
              </div>

              <div className="space-y-5">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                  Select Platform
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      icon: InstagramLogo,
                      color: 'text-pink-600',
                      bg: 'bg-pink-50',
                      border: 'border-pink-100',
                      label: 'Instagram',
                    },
                    {
                      icon: LinkedinLogo,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                      border: 'border-blue-100',
                      label: 'LinkedIn',
                    },
                    {
                      icon: FacebookLogo,
                      color: 'text-indigo-600',
                      bg: 'bg-indigo-50',
                      border: 'border-indigo-100',
                      label: 'Facebook',
                    },
                  ].map((platform, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleShare(platform.label)}
                      className={`flex flex-col items-center justify-center aspect-square rounded-[2rem] ${platform.bg} ${platform.color} ${platform.border} border-2 hover:scale-[1.05] hover:shadow-lg transition-all active:scale-95 group relative overflow-hidden`}
                      aria-label={`Share on ${platform.label}`}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                      <platform.icon className="w-6 h-6 mb-2 relative z-10" weight="bold" />
                      <span className="text-[9px] font-bold uppercase tracking-wider relative z-10">
                        {platform.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-5 rounded-[1.5rem] hover:bg-indigo-700 shadow-[0_12px_32px_-8px_rgba(79,70,229,0.4)] hover:shadow-[0_16px_40px_-6px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98] group"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                Export High-Res Image
              </button>

              <div className="flex items-center justify-center gap-3 opacity-30 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                <div className="h-px flex-1 bg-stone-300" />
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-500">
                  Readmora AI
                </span>
                <div className="h-px flex-1 bg-stone-300" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
