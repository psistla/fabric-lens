import { useMemo } from 'react';
import {
  useHealthConfigStore,
  compileNamingPattern,
} from '@/store/healthConfigStore';

/** The user's naming-convention pattern, compiled. Every surface that scores a
 *  workspace reads it from here so a Settings change moves all of them at once. */
export function useNamingPattern(): RegExp {
  const pattern = useHealthConfigStore((s) => s.namingPattern);
  return useMemo(() => compileNamingPattern(pattern), [pattern]);
}
