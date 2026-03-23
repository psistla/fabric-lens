import { useEffect, useRef, useState } from 'react';
import {
  SCORE_RING_ANIMATION_MS,
  SCORE_RING_DEFAULT_SIZE,
  SCORE_RING_STROKE_WIDTH,
} from '@/utils/constants';

const GRADE_STROKE_COLORS: Record<string, string> = {
  A: 'var(--health-a)',
  B: 'var(--health-b)',
  C: 'var(--health-c)',
  D: 'var(--health-d)',
  F: 'var(--health-f)',
};

interface ScoreRingProps {
  score: number;
  grade: string;
  size?: number;
  strokeWidth?: number;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ScoreRing({
  score,
  grade,
  size = SCORE_RING_DEFAULT_SIZE,
  strokeWidth = SCORE_RING_STROKE_WIDTH,
}: ScoreRingProps) {
  const reduced = prefersReducedMotion();
  const [animatedScore, setAnimatedScore] = useState(0);
  const rafRef = useRef<number | null>(null);

  // When reduced motion is preferred, derive displayed value directly from score
  // (no state update needed). Otherwise use the rAF-animated value.
  const displayed = reduced ? score : animatedScore;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    if (reduced) return;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / SCORE_RING_ANIMATION_MS, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [score, reduced]);

  const arcProgress = displayed / 100;
  const dashOffset = circumference * (1 - arcProgress);
  const strokeColor = GRADE_STROKE_COLORS[grade] ?? 'var(--health-f)';

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Tenant health score: ${score} (Grade ${grade})`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="var(--m-border)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: reduced ? 'none' : undefined }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold leading-none"
          style={{ fontSize: size * 0.28, color: strokeColor }}
        >
          {grade}
        </span>
        <span
          className="font-medium leading-none text-[var(--m-text-secondary)] tabular-nums"
          style={{ fontSize: size * 0.16, marginTop: size * 0.04 }}
        >
          {displayed}
        </span>
      </div>
    </div>
  );
}
