import { AlertTriangle, Share2, ShieldCheck } from 'lucide-react';
import type { WidelySharedArtifact } from '@/api/types/widelyShared';
import type { FabricItemType } from '@/api/types/item';
import { ItemTypeBadge } from '@/components/shared/ItemTypeBadge';
import { FABRIC_ADMIN_PORTAL_SETTINGS_URL } from '@/utils/constants';

interface Props {
  artifacts: WidelySharedArtifact[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/** Maps Power BI API artifactType values to FabricItemType for ItemTypeBadge.
 *  The API returns 'Dataset' where Fabric uses 'SemanticModel'. All other
 *  values (Report, PaginatedReport, Dashboard, Dataflow) are valid FabricItemType members. */
function toItemType(raw: WidelySharedArtifact['artifactType']): FabricItemType {
  const map: Record<WidelySharedArtifact['artifactType'], FabricItemType> = {
    Report: 'Report',
    PaginatedReport: 'PaginatedReport',
    Dashboard: 'Dashboard',
    Dataset: 'SemanticModel',
    Dataflow: 'Dataflow',
  };
  return map[raw];
}

export function WidelySharedPanel({ artifacts, loading, error, onRetry }: Props) {
  // Loading state
  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <Share2 className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Widely Shared Objects
          </h2>
        </div>
        <div className="divide-y divide-[var(--m-border)]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="m-skeleton h-4 w-48" />
              <div className="m-skeleton h-5 w-20 rounded-full" />
              <div className="m-skeleton h-4 w-16" />
              <div className="m-skeleton h-4 w-16" />
              <div className="m-skeleton h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <Share2 className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Widely Shared Objects
          </h2>
        </div>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-[var(--m-warning-text)]">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--m-warning)]" />
            Widely shared artifacts unavailable — check admin permissions
          </div>
          <button
            onClick={onRetry}
            className="shrink-0 rounded-lg px-3 py-1 text-xs font-semibold text-[var(--m-primary)] ring-1 ring-[var(--m-primary)]/40 transition-colors hover:bg-[var(--m-primary-subtle)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (artifacts.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="flex items-center gap-2 border-b border-[var(--m-border)] px-4 py-3">
          <Share2 className="h-4 w-4 text-[var(--m-text-tertiary)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Widely Shared Objects
          </h2>
        </div>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <ShieldCheck className="h-7 w-7 text-[var(--m-success)]" />
          <p className="text-sm font-medium text-[var(--m-text)]">
            No items are shared with the whole organization.
          </p>
          <p className="text-xs text-[var(--m-text-secondary)]">
            No org-wide share links detected.
          </p>
        </div>
      </div>
    );
  }

  const items = [...artifacts].sort((a, b) => a.displayName.localeCompare(b.displayName));

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-[var(--m-error)]" />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
            Widely Shared Objects
          </h2>
        </div>
        <span className="rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-error-text)]">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Item
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Type
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Share Type
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Access
              </th>
              <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--m-text-secondary)]">
                Shared By
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--m-border)]">
            {items.map((artifact) => (
              <tr key={artifact.artifactId} className="hover:bg-[var(--m-surface-hover)]">
                <td className="px-4 py-2.5">
                  <span className="font-medium text-[var(--m-text)]">{artifact.displayName}</span>
                </td>
                <td className="px-4 py-2.5">
                  <ItemTypeBadge type={toItemType(artifact.artifactType)} />
                </td>
                <td className="px-4 py-2.5 text-[var(--m-text-secondary)]">
                  {artifact.shareType}
                </td>
                <td className="px-4 py-2.5 text-[var(--m-text-secondary)]">
                  {artifact.accessRight}
                </td>
                <td className="px-4 py-2.5">
                  {artifact.sharer ? (
                    <>
                      <span className="font-medium text-[var(--m-text)]">
                        {artifact.sharer.displayName}
                      </span>
                      <span className="block text-[10px] text-[var(--m-text-tertiary)]">
                        {artifact.sharer.emailAddress}
                      </span>
                    </>
                  ) : (
                    <span className="text-[var(--m-text-tertiary)]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--m-border)] bg-[var(--m-surface)] px-4 py-2 text-[11px] text-[var(--m-text-tertiary)]">
        <span>
          These items are accessible to everyone in your organization. Review and restrict as needed.
        </span>
        <a
          href={FABRIC_ADMIN_PORTAL_SETTINGS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 shrink-0 text-[var(--m-primary)] hover:underline"
        >
          Open Admin Portal
        </a>
      </div>
    </div>
  );
}
