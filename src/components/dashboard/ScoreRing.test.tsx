// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreRing } from './ScoreRing';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({ matches: false }),
  });
});

describe('ScoreRing', () => {
  it('renders grade and score without benchmark', () => {
    render(<ScoreRing score={82} grade="B" />);
    expect(screen.getByRole('img')).toBeTruthy();
    // benchmark label must NOT appear
    expect(screen.queryByText(/vs\. typical/i)).toBeNull();
  });

  it('renders benchmark label when benchmark prop is provided', () => {
    render(<ScoreRing score={82} grade="B" benchmark={78} />);
    expect(screen.getByText('vs. typical 78')).toBeTruthy();
  });

  it('benchmark label text is exactly "vs. typical N" with no variation', () => {
    render(<ScoreRing score={65} grade="C" benchmark={72} />);
    expect(screen.getByText('vs. typical 72')).toBeTruthy();
  });
});
