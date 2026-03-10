import { type ReactNode, useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState<T> {
  key: keyof T | null;
  direction: SortDirection;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found.',
  onRowClick,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState<T>>({
    key: null,
    direction: null,
  });

  function handleSort(key: keyof T) {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: null };
    });
  }

  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return data;
    const key = sort.key;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * dir;
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * dir;
      }
      return String(aVal).localeCompare(String(bVal)) * dir;
    });
  }, [data, sort]);

  function renderSortIcon(col: Column<T>) {
    if (!col.sortable) return null;
    if (sort.key !== col.key || !sort.direction) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400" />;
    }
    return sort.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-blue-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-600" />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
                    col.sortable
                      ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200'
                      : ''
                  }`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    {col.header}
                    {renderSortIcon(col)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && sortedData.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {!loading &&
              sortedData.map((row, i) => (
                <tr
                  key={i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={
                    onRowClick
                      ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50'
                      : ''
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3 text-slate-700 dark:text-slate-300"
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer with row count */}
      {!loading && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {sortedData.length} {sortedData.length === 1 ? 'row' : 'rows'}
          </span>
        </div>
      )}
    </div>
  );
}
