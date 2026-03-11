import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { Workspace } from '@/api/types/workspace';
import type { Item } from '@/api/types/item';
import type { HealthGrade } from '@/utils/healthScore';
import { calculateWorkspaceHealth } from '@/utils/healthScore';

interface Props {
  workspaces: Workspace[];
  allItemsByWorkspace: Record<string, Item[]>;
}

const GRADE_COLORS: Record<HealthGrade, string> = {
  A: 'var(--health-a)',
  B: 'var(--health-b)',
  C: 'var(--health-c)',
  D: 'var(--health-d)',
  F: 'var(--health-f)',
};

interface TileData {
  id: string;
  name: string;
  grade: HealthGrade;
  percentage: number;
}

export function HealthGrid({ workspaces, allItemsByWorkspace }: Props) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const tiles = useMemo((): TileData[] => {
    return workspaces.map((ws) => {
      const items = allItemsByWorkspace[ws.id] ?? [];
      const health = calculateWorkspaceHealth(ws, items);
      return {
        id: ws.id,
        name: ws.displayName,
        grade: health.grade,
        percentage: health.percentage,
      };
    });
  }, [workspaces, allItemsByWorkspace]);

  if (tiles.length === 0) return null;

  const gradeCounts = tiles.reduce<Record<HealthGrade, number>>(
    (acc, t) => {
      acc[t.grade]++;
      return acc;
    },
    { A: 0, B: 0, C: 0, D: 0, F: 0 },
  );

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-medium tracking-[-0.005em] text-[var(--text-primary)]">
          Tenant Health Grid
        </h2>
        <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
          {(['A', 'B', 'C', 'D', 'F'] as HealthGrade[]).map((grade) => (
            <span key={grade} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: GRADE_COLORS[grade] }}
              />
              {grade}: {gradeCounts[grade]}
            </span>
          ))}
        </div>
      </div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(32px, 1fr))',
        }}
      >
        {tiles.map((tile) => {
          const isHovered = hoveredId === tile.id;
          return (
            <div key={tile.id} className="relative">
              <button
                onClick={() => void navigate(`/workspaces/${tile.id}`)}
                onMouseEnter={() => setHoveredId(tile.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex h-8 w-full items-center justify-center rounded-[var(--radius-sm)] text-xs font-bold text-white transition-transform duration-[120ms] hover:scale-[1.15]"
                style={{ backgroundColor: GRADE_COLORS[tile.grade] }}
                title={`${tile.name}: ${tile.grade} (${tile.percentage}%)`}
              >
                {tile.grade}
              </button>
              {isHovered && (
                <div className="absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-md)] bg-[var(--surface-inverse)] px-2.5 py-1.5 text-xs text-[var(--text-inverse)] shadow-[var(--shadow-lg)]">
                  <span className="font-medium">{tile.name}</span>
                  <span className="ml-1.5 opacity-75">{tile.percentage}%</span>
                  <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[var(--surface-inverse)]" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-[var(--text-tertiary)]">
        {tiles.length} workspaces — click a tile to view details.
      </p>
    </div>
  );
}
