import { useState, useCallback } from 'react';
import {
  HEALTH_GRID_TILE_SIZE,
  HEALTH_GRID_GAP,
  HEALTH_GRID_MAX_TILES,
  HEALTH_GRID_HOVER_SCALE,
  HEALTH_GRID_STAGGER_STEP_MS,
  HEALTH_GRID_STAGGER_MAX_MS,
} from '@/utils/constants';

// Grade ordering: worst → best
const GRADE_ORDER = ['F', 'D', 'C', 'B', 'A'] as const;
type Grade = (typeof GRADE_ORDER)[number];

// Saturated colors used for filter buttons and distribution squares (always readable with white text)
const GRADE_PRIMARY: Record<Grade, string> = {
  A: '#15803D',
  B: '#4F46E5',
  C: '#B45309',
  D: '#C2410C',
  F: '#DC2626',
};

export interface HealthGridProps {
  workspaces: Array<{
    id: string;
    name: string;
    score: number;
    grade: string;
    topFailedCheck?: string;
  }>;
  onWorkspaceClick?: (workspaceId: string) => void;
}

interface TooltipState {
  x: number;
  y: number;
  entry: HealthGridProps['workspaces'][number];
}

// ---------------------------------------------------------------------------
// Tooltip — fixed-positioned near cursor
// ---------------------------------------------------------------------------
function Tooltip({ state }: { state: TooltipState }) {
  const { x, y, entry } = state;
  const primary = GRADE_PRIMARY[entry.grade as Grade] ?? '#868E96';

  return (
    <div
      style={{
        position: 'fixed',
        left: x + 14,
        top: y - 10,
        transform: 'translateY(-100%)',
        zIndex: 600,
        pointerEvents: 'none',
        background: 'var(--m-neutral-900)',
        border: '1px solid var(--m-neutral-700)',
        borderRadius: 8,
        padding: '8px 10px',
        minWidth: 180,
        maxWidth: 260,
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--m-neutral-0)',
          marginBottom: 6,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.name}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: primary,
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {entry.grade}
        </span>
        <span style={{ fontSize: 12, color: 'var(--m-neutral-300)' }}>
          {entry.score}/100
        </span>
      </div>
      {entry.topFailedCheck && (
        <p
          style={{
            marginTop: 6,
            fontSize: 11,
            lineHeight: 1.4,
            color: 'var(--m-neutral-400)',
          }}
        >
          <span style={{ color: 'var(--m-accent-400, #FBBF24)' }}>Quick win:</span>{' '}
          {entry.topFailedCheck}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Distribution summary bar
// ---------------------------------------------------------------------------
function DistributionBar({
  workspaces,
  activeGrade,
  shownCount,
}: {
  workspaces: HealthGridProps['workspaces'];
  activeGrade: string | null;
  shownCount: number;
}) {
  const counts = GRADE_ORDER.reduce<Record<string, number>>((acc, g) => {
    acc[g] = workspaces.filter((w) => w.grade === g).length;
    return acc;
  }, {});
  const total = workspaces.length;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {GRADE_ORDER.map((g) => {
        const count = counts[g];
        if (count === 0) return null;
        return (
          <div key={g} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: GRADE_PRIMARY[g] }}
            />
            <span className="text-xs text-[var(--m-text-secondary)]">
              <span className="font-semibold text-[var(--m-text)]">{count}</span> {g}
            </span>
          </div>
        );
      })}
      {activeGrade !== null && (
        <span className="text-xs text-[var(--m-text-tertiary)]">
          {shownCount} of {total} shown
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact summary mode — horizontal bars per grade
// ---------------------------------------------------------------------------
function SummaryView({ workspaces }: { workspaces: HealthGridProps['workspaces'] }) {
  const total = workspaces.length;
  return (
    <div className="space-y-2">
      {GRADE_ORDER.map((g) => {
        const count = workspaces.filter((w) => w.grade === g).length;
        if (count === 0) return null;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={g} className="flex items-center gap-3">
            <span
              className="w-4 shrink-0 text-center text-xs font-bold"
              style={{ color: GRADE_PRIMARY[g] }}
            >
              {g}
            </span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-[var(--m-surface)]">
              <div
                className="h-full rounded transition-all"
                style={{ width: `${pct}%`, backgroundColor: GRADE_PRIMARY[g], opacity: 0.85 }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs text-[var(--m-text-secondary)]">
              {count} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HealthGrid
// ---------------------------------------------------------------------------
export function HealthGrid({ workspaces, onWorkspaceClick }: HealthGridProps) {
  const [activeGrade, setActiveGrade] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  const isCompact = workspaces.length > HEALTH_GRID_MAX_TILES;

  // Sort worst-first (ascending score)
  const sorted = [...workspaces].sort((a, b) => a.score - b.score);

  // Apply grade filter
  const filtered = activeGrade ? sorted.filter((w) => w.grade === activeGrade) : sorted;

  // In compact grid mode, cap at MAX_TILES
  const tiles = isCompact && showGrid ? filtered.slice(0, HEALTH_GRID_MAX_TILES) : filtered;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, entry: HealthGridProps['workspaces'][number]) => {
      setTooltip({ x: e.clientX, y: e.clientY, entry });
    },
    [],
  );

  const handleTileEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = `scale(${HEALTH_GRID_HOVER_SCALE})`;
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
  }, []);

  const handleTileOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none';
    setTooltip(null);
  }, []);

  const handleFilterClick = useCallback(
    (grade: string | null) => setActiveGrade((prev) => (prev === grade ? null : grade)),
    [],
  );

  if (workspaces.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--m-text)]">Workspace Health Grid</h2>
        {isCompact && (
          <button
            onClick={() => setShowGrid((v) => !v)}
            className="-my-1 py-1 text-xs font-semibold text-[var(--m-primary)] transition-colors hover:underline"
          >
            {showGrid ? 'Show summary' : 'Show grid'}
          </button>
        )}
      </div>

      {/* Filter buttons */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => handleFilterClick(null)}
          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors"
          style={
            activeGrade === null
              // primary-600 rather than the --m-primary alias: the alias lightens
              // to primary-400 in dark, which fails AA under white text.
              ? { backgroundColor: 'var(--m-primary-600)', color: '#FFFFFF' }
              : { backgroundColor: 'var(--m-surface)', color: 'var(--m-text-secondary)' }
          }
        >
          All
        </button>
        {GRADE_ORDER.map((g) => {
          const count = workspaces.filter((w) => w.grade === g).length;
          if (count === 0) return null;
          const isActive = activeGrade === g;
          return (
            <button
              key={g}
              onClick={() => handleFilterClick(g)}
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors"
              style={
                isActive
                  ? { backgroundColor: GRADE_PRIMARY[g], color: '#FFFFFF' }
                  : { backgroundColor: 'var(--m-surface)', color: 'var(--m-text-secondary)' }
              }
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Grid or summary */}
      {!isCompact || showGrid ? (
        <>
          {isCompact && filtered.length > HEALTH_GRID_MAX_TILES && (
            <p className="mb-2 text-xs text-[var(--m-text-tertiary)]">
              Showing {HEALTH_GRID_MAX_TILES} of {filtered.length} workspaces (worst first)
            </p>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${HEALTH_GRID_TILE_SIZE}px, ${HEALTH_GRID_TILE_SIZE}px))`,
              gap: `${HEALTH_GRID_GAP}px`,
            }}
          >
            {tiles.map((entry, i) => (
              <button
                key={entry.id}
                className="m-tile-in"
                onClick={() => onWorkspaceClick?.(entry.id)}
                onMouseMove={(e) => handleMouseMove(e, entry)}
                onMouseEnter={handleTileEnter}
                onMouseLeave={handleTileOut}
                aria-label={`${entry.name}: Grade ${entry.grade}, ${entry.score}%`}
                style={{
                  animationDelay: `${Math.min(
                    i * HEALTH_GRID_STAGGER_STEP_MS,
                    HEALTH_GRID_STAGGER_MAX_MS,
                  )}ms`,
                  width: HEALTH_GRID_TILE_SIZE,
                  height: HEALTH_GRID_TILE_SIZE,
                  borderRadius: 6,
                  background: `var(--health-${entry.grade.toLowerCase()}-bg)`,
                  color: `var(--health-${entry.grade.toLowerCase()})`,
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  transition: `transform 120ms ease-out, box-shadow 120ms ease-out`,
                  flexShrink: 0,
                }}
              >
                {entry.grade}
              </button>
            ))}
            {tiles.length === 0 && (
              <p className="text-xs text-[var(--m-text-tertiary)]">
                No workspaces match the selected filter.
              </p>
            )}
          </div>
        </>
      ) : (
        <SummaryView workspaces={filtered} />
      )}

      {/* Distribution bar */}
      <div className="mt-4 border-t border-[var(--m-border-subtle)] pt-3">
        <DistributionBar
          workspaces={workspaces}
          activeGrade={activeGrade}
          shownCount={filtered.length}
        />
      </div>

      {/* Tooltip */}
      {tooltip && <Tooltip state={tooltip} />}
    </div>
  );
}
