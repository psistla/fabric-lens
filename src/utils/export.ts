function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Security: prevent CSV formula injection. Spreadsheet apps (Excel, Sheets)
// execute cell values beginning with =, +, -, @, tab, or CR as formulas.
// Prefixing with a single quote renders the value as literal text.
function sanitizeCsvValue(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) {
    return "'" + value;
  }
  return value;
}

function escapeCSVField(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  const sanitized = sanitizeCsvValue(str);
  if (sanitized.includes(',') || sanitized.includes('"') || sanitized.includes('\n')) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.map(escapeCSVField).join(','),
    ...data.map((row) =>
      headers.map((h) => escapeCSVField(row[h])).join(','),
    ),
  ];

  downloadFile(csvRows.join('\n'), filename, 'text/csv;charset=utf-8;');
}

export function exportToJSON(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}
