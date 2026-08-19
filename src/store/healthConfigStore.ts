import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_NAMING_PATTERN,
  DEFAULT_NAMING_PATTERN_STRING,
} from '@/utils/constants';

interface HealthConfigState {
  namingPattern: string;
  setNamingPattern: (pattern: string) => void;
  reset: () => void;
}

export const useHealthConfigStore = create<HealthConfigState>()(
  persist(
    (set) => ({
      namingPattern: DEFAULT_NAMING_PATTERN_STRING,
      setNamingPattern: (namingPattern: string) => set({ namingPattern }),
      reset: () => set({ namingPattern: DEFAULT_NAMING_PATTERN_STRING }),
    }),
    { name: 'fabric-lens-health-config' },
  ),
);

/** True when the pattern compiles. Settings uses this to flag bad input
 *  before it silently falls back. */
export function isValidPattern(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

/** Compiles the stored pattern, falling back to the default when the user has
 *  typed something that is not a valid regex. The value is persisted from
 *  localStorage and reaches `new RegExp` directly, so it is untrusted input:
 *  without this guard one bad character blanks every page that scores a
 *  workspace. */
export function compileNamingPattern(pattern: string): RegExp {
  try {
    return new RegExp(pattern);
  } catch {
    return DEFAULT_NAMING_PATTERN;
  }
}
