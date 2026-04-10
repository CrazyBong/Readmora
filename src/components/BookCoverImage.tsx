'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';

import { normalizeCoverUrl } from '@/lib/books';

interface BookCoverImageProps {
  title: string;
  alt?: string;
  coverUrl?: string | null;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  fallbackClassName?: string;
}

export default function BookCoverImage({
  title,
  alt,
  coverUrl,
  sizes,
  priority = false,
  fill = false,
  width,
  height,
  className = 'object-cover',
  fallbackClassName = '',
}: BookCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const normalizedCoverUrl = normalizeCoverUrl(coverUrl);
  const showFallback = failed || !normalizedCoverUrl;

  if (showFallback) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-[color:var(--color-primary)]/90 p-3 text-white ${fallbackClassName}`.trim()}
      >
        <BookOpen className="mb-2 h-8 w-8 text-white/70" />
        <p className="line-clamp-4 text-center font-serif text-xs font-semibold leading-tight">
          {title}
        </p>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={normalizedCoverUrl}
        alt={alt ?? `Cover of ${title}`}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <Image
      src={normalizedCoverUrl}
      alt={alt ?? `Cover of ${title}`}
      width={width ?? 80}
      height={height ?? 120}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
