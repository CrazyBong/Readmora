/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import { motion, Variants, HTMLMotionProps } from 'framer-motion';
import { Upload, Loader2, AtSign, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface OnboardingFormProps extends Omit<HTMLMotionProps<'div'>, 'onSubmit'> {
  imageSrc: string;
  avatarSrc?: string | undefined;
  avatarFallback: string;
  title: string;
  description: string;
  inputPlaceholder: string;
  buttonText: string;
  /** Called with the typed username; should return true if available */
  onCheckUsername: (username: string) => Promise<boolean>;
  onAvatarFile?: (file: File) => void;
  onSubmit: (username: string) => void;
  isSubmitting?: boolean;
  isUploading?: boolean;
}

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' } },
};

const OnboardingForm = React.forwardRef<HTMLDivElement, OnboardingFormProps>(
  (
    {
      className,
      imageSrc,
      avatarSrc,
      avatarFallback,
      title,
      description,
      inputPlaceholder,
      buttonText,
      onCheckUsername,
      onAvatarFile,
      onSubmit,
      isSubmitting = false,
      isUploading = false,
      ...props
    },
    ref
  ) => {
    const [username, setUsername] = React.useState('');
    // null = not checked yet, true = available, false = taken
    const [available, setAvailable] = React.useState<boolean | null>(null);
    const [checking, setChecking] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setUsername(val);
      setAvailable(null); // reset status while typing

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (val.length < 3) {
        setChecking(false);
        return;
      }

      setChecking(true);
      debounceRef.current = setTimeout(async () => {
        const isAvailable = await onCheckUsername(val);
        setAvailable(isAvailable);
        setChecking(false);
      }, 600);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (available) onSubmit(username);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && onAvatarFile) onAvatarFile(file);
    };

    const canSubmit = available === true && !isSubmitting && !checking;

    return (
      <motion.div
        initial="hidden"
        animate="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.15 } },
        }}
        className={cn(
          'w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-xl',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Decorative top image */}
        <motion.div variants={FADE_UP}>
          <img src={imageSrc} alt="Welcome Banner" className="h-48 w-full object-cover" />
        </motion.div>

        <div className="space-y-6 p-8 text-center">
          {/* Title + Description */}
          <motion.div variants={FADE_UP} className="space-y-2">
            <h1 className="font-bold text-2xl text-foreground">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </motion.div>

          {/* Avatar upload section */}
          <motion.div
            variants={FADE_UP}
            className="flex items-center justify-between rounded-xl border bg-gray-50 p-3"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={avatarSrc} alt="User Avatar" />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="font-medium text-sm text-foreground">Your avatar</p>
                <p className="text-xs text-muted-foreground">PNG or JPG up to 2MB</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isUploading ? 'Uploading…' : 'Upload'}
            </Button>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Username input */}
            <motion.div variants={FADE_UP} className="space-y-1.5">
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder={inputPlaceholder}
                  className={cn(
                    'pl-9 pr-9 transition-colors',
                    available === true && 'border-green-500 focus-visible:ring-green-400',
                    available === false && 'border-red-400 focus-visible:ring-red-400'
                  )}
                  value={username}
                  onChange={handleUsernameChange}
                  minLength={3}
                  required
                  autoComplete="off"
                />
                {/* Inline status icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!checking && available === true && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {!checking && available === false && <XCircle className="h-4 w-4 text-red-400" />}
                </div>
              </div>

              {/* Availability status message */}
              {username.length >= 3 && (
                <p
                  className={cn(
                    'text-xs text-left pl-1 transition-all',
                    checking && 'text-muted-foreground',
                    available === true && 'text-green-600',
                    available === false && 'text-red-500',
                    available === null && !checking && 'text-muted-foreground'
                  )}
                >
                  {checking && 'Checking availability…'}
                  {!checking && available === true && '✓ Username is available!'}
                  {!checking && available === false && '✗ Username is already taken.'}
                </p>
              )}
              {username.length > 0 && username.length < 3 && (
                <p className="text-xs text-left pl-1 text-muted-foreground">
                  Must be at least 3 characters
                </p>
              )}
            </motion.div>

            {/* Submit button */}
            <motion.div variants={FADE_UP} className="pt-2">
              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {buttonText}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    );
  }
);

OnboardingForm.displayName = 'OnboardingForm';

export { OnboardingForm };
