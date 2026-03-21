// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exportToCSV } from '@/utils/export';

// ---------------------------------------------------------------------------
// Test harness: intercept Blob content without triggering a real download.
// jsdom provides Blob but not URL.createObjectURL; we stub both.
// ---------------------------------------------------------------------------

let capturedContent = '';

// Suppress jsdom "Not implemented: navigation" warnings from anchor.click()
const originalConsoleError = console.error;
beforeEach(() => {
  capturedContent = '';
  console.error = () => undefined;

  vi.stubGlobal('Blob', class MockBlob {
    constructor(parts?: BlobPart[], _options?: BlobPropertyBag) {
      capturedContent = (parts ?? []).map(String).join('');
    }
  });

  // jsdom does not implement URL.createObjectURL
  Object.defineProperty(globalThis.URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:mock-url'),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
    value: vi.fn(),
    writable: true,
    configurable: true,
  });

  // Prevent jsdom from attempting navigation on anchor.click()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
});

afterEach(() => {
  console.error = originalConsoleError;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Call exportToCSV and return the raw CSV string. */
function getCSV(data: Record<string, unknown>[]): string {
  exportToCSV(data, 'test.csv');
  return capturedContent;
}

/** Parse CSV into [headers, ...rows] as string arrays. */
function parseCSV(csv: string): string[][] {
  return csv.split('\n').map((line) => line.split(','));
}

// ---------------------------------------------------------------------------
// a) CSV structure — headers and data rows
// ---------------------------------------------------------------------------

describe('exportToCSV — structure', () => {
  it('generates a header row with the object keys', () => {
    const csv = getCSV([{ name: 'Alice', role: 'Admin', workspace: 'WS1' }]);
    const [header] = parseCSV(csv);
    expect(header).toEqual(['name', 'role', 'workspace']);
  });

  it('generates data rows that match the input values', () => {
    const csv = getCSV([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3); // header + 2 data rows
    expect(lines[1]).toBe('Alice,30');
    expect(lines[2]).toBe('Bob,25');
  });

  it('uses first object keys as column order for all rows', () => {
    const csv = getCSV([
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ]);
    const rows = parseCSV(csv);
    expect(rows[0]).toEqual(['a', 'b']);
    expect(rows[1]).toEqual(['1', '2']);
    expect(rows[2]).toEqual(['3', '4']);
  });

  it('handles null and undefined values as empty strings', () => {
    const csv = getCSV([{ name: null, role: undefined }] as Record<string, unknown>[]);
    const rows = parseCSV(csv);
    expect(rows[1]).toEqual(['', '']);
  });

  it('does nothing when data array is empty', () => {
    exportToCSV([], 'test.csv');
    expect(capturedContent).toBe(''); // Blob never constructed
  });
});

// ---------------------------------------------------------------------------
// b) CSV escaping — commas, quotes, newlines
// ---------------------------------------------------------------------------

describe('exportToCSV — special character escaping', () => {
  it('wraps fields containing commas in double quotes', () => {
    const csv = getCSV([{ description: 'Lakehouse, Notebook' }]);
    const rows = csv.split('\n');
    expect(rows[1]).toBe('"Lakehouse, Notebook"');
  });

  it('escapes double quotes by doubling them', () => {
    const csv = getCSV([{ note: 'She said "hello"' }]);
    const rows = csv.split('\n');
    expect(rows[1]).toBe('"She said ""hello"""');
  });

  it('wraps fields containing newlines in double quotes', () => {
    const csv = getCSV([{ text: 'line1\nline2' }]);
    const rows = csv.split('\n');
    // The field is quoted; the whole string has multiple lines
    expect(rows[1]).toBe('"line1');
    expect(rows[2]).toBe('line2"');
  });

  it('plain values with no special characters are not quoted', () => {
    const csv = getCSV([{ status: 'Active' }]);
    expect(csv.split('\n')[1]).toBe('Active');
  });

  it('numeric values are stringified without quotes', () => {
    const csv = getCSV([{ count: 42, ratio: 3.14 }]);
    expect(csv.split('\n')[1]).toBe('42,3.14');
  });

  it('handles a field that is only a double quote', () => {
    const csv = getCSV([{ x: '"' }]);
    expect(csv.split('\n')[1]).toBe('""""');
  });
});

// ---------------------------------------------------------------------------
// c) CSV injection prevention
// ---------------------------------------------------------------------------

describe('exportToCSV — CSV injection prevention', () => {
  const injectionPrefixes = ['=SUM(A1)', '+cmd|/C', '-2+3', '@SUM', '\t=cmd', '\r=cmd'];

  for (const value of injectionPrefixes) {
    it(`prefixes "${value[0]}" with a single quote to neutralise formula injection`, () => {
      const csv = getCSV([{ formula: value }]);
      const dataRow = csv.split('\n')[1];
      // The sanitized value starts with ' which is not a formula trigger character
      expect(dataRow.startsWith("'")).toBe(true);
    });
  }

  it('value starting with = is prefixed with single quote', () => {
    const csv = getCSV([{ cell: '=1+1' }]);
    expect(csv.split('\n')[1]).toBe("'=1+1");
  });

  it('value starting with + is prefixed with single quote', () => {
    const csv = getCSV([{ cell: '+HYPERLINK(...)' }]);
    expect(csv.split('\n')[1]).toBe("'+HYPERLINK(...)");
  });

  it('value starting with - is prefixed with single quote', () => {
    const csv = getCSV([{ cell: '-2+3' }]);
    expect(csv.split('\n')[1]).toBe("'-2+3");
  });

  it('value starting with @ is prefixed with single quote', () => {
    const csv = getCSV([{ cell: '@SUM(1,2)' }]);
    // '@SUM(1,2)' contains a comma so it will also be quoted
    expect(csv.split('\n')[1]).toBe('"\'@SUM(1,2)"');
  });

  it('safe values are not prefixed with single quote', () => {
    const csv = getCSV([{ name: 'Alice', value: '100' }]);
    const rows = csv.split('\n');
    expect(rows[1]).toBe('Alice,100');
  });

  it('injection prefix inside a quoted field is still sanitized', () => {
    // Value with comma + injection prefix: should be quoted AND prefixed
    const csv = getCSV([{ formula: '=A1+B1,extra' }]);
    const dataRow = csv.split('\n')[1];
    // starts with " (quoted), contains ' prefix, comma is inside quotes
    expect(dataRow).toBe('"\'=A1+B1,extra"');
  });
});
