import { useId } from 'react';

interface Props {
  /** Sizing utilities. The mark is square and scales with whatever you pass. */
  className?: string;
}

/**
 * The fabric-lens brand mark: an aperture on the cobalt-to-cyan gradient.
 *
 * Kept identical to `public/favicon.svg` and the header mark in
 * `scripts/og-image.mjs` — those two live outside the bundle (a static asset
 * and a generator string), so the three are synced by hand, not by import.
 */
export function LensMark({ className = 'h-8 w-8' }: Props) {
  // Gradient ids are document-global, so two marks on one page would collide.
  const gradientId = useId();

  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`} />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="#fff" strokeWidth="4.5" />
      <circle cx="16" cy="16" r="2.6" fill="#fff" />
    </svg>
  );
}
