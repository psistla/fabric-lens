import { describe, it, expect, beforeEach } from 'vitest';
import {
  useHealthConfigStore,
  compileNamingPattern,
  isValidPattern,
} from '@/store/healthConfigStore';
import {
  DEFAULT_NAMING_PATTERN,
  DEFAULT_NAMING_PATTERN_STRING,
} from '@/utils/constants';

describe('compileNamingPattern', () => {
  it('compiles a valid pattern', () => {
    const re = compileNamingPattern('^PRD-');
    expect(re.test('PRD-Sales')).toBe(true);
    expect(re.test('Sales')).toBe(false);
  });

  it('falls back to the default when the pattern is not valid regex', () => {
    // An unclosed group is what a half-typed pattern looks like. Without the
    // guard this throws inside render and blanks every page that scores.
    expect(() => compileNamingPattern('^(PRD')).not.toThrow();
    expect(compileNamingPattern('^(PRD').source).toBe(DEFAULT_NAMING_PATTERN.source);
  });

  it('flags validity so Settings can warn before the fallback happens', () => {
    expect(isValidPattern('^PRD-')).toBe(true);
    expect(isValidPattern('^(PRD')).toBe(false);
  });
});

describe('useHealthConfigStore', () => {
  beforeEach(() => {
    useHealthConfigStore.getState().reset();
  });

  it('defaults to the shipped naming pattern', () => {
    expect(useHealthConfigStore.getState().namingPattern).toBe(
      DEFAULT_NAMING_PATTERN_STRING,
    );
  });

  it('stores a custom pattern and resets back to the default', () => {
    useHealthConfigStore.getState().setNamingPattern('^PRD-');
    expect(useHealthConfigStore.getState().namingPattern).toBe('^PRD-');

    useHealthConfigStore.getState().reset();
    expect(useHealthConfigStore.getState().namingPattern).toBe(
      DEFAULT_NAMING_PATTERN_STRING,
    );
  });
});
