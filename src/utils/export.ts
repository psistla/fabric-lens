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

function escapeCSVField(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
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
