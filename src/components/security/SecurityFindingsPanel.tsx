import { useState } from 'react';
import { ShieldAlert, AlertTriangle, Info, ChevronRight, ShieldCheck } from 'lucide-react';
import type { SecurityFinding, FindingSeverity } from '@/utils/securityFindings';

interface Props {
  findings: SecurityFinding[];
}

const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { icon: typeof ShieldAlert; rowBg: string; iconColor: string; sectionBg: string; sectionText: string }
> = {
  critical: {
    icon: ShieldAlert,
    rowBg: 'hover:bg-[var(--m-surface-hover)]',
    iconColor: 'text-[var(--m-error)]',
    sectionBg: 'bg-[var(--m-error-bg)] text-[var(--m-error-text)]',
    sectionText: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    rowBg: 'hover:bg-[var(--m-surface-hover)]',
    iconColor: 'text-[var(--m-warning)]',
    sectionBg: 'bg-[var(--m-warning-bg)] text-[var(--m-warning-text)]',
    sectionText: 'Warning',
  },
  info: {
    icon: Info,
    rowBg: 'hover:bg-[var(--m-surface-hover)]',
    iconColor: 'text-[var(--m-primary)]',
    sectionBg: 'bg-[var(--m-primary-subtle)] text-[var(--m-primary)]',
    sectionText: 'Info',
  },
};

function FindingRow({
  finding,
  expanded,
  onToggle,
}: {
  finding: SecurityFinding;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cfg = SEVERITY_CONFIG[finding.severity];
  const Icon = cfg.icon;

  return (
    <div className="border-b border-[var(--m-border)] last:border-0">
      <button
        onClick={onToggle}
        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${cfg.rowBg}`}
      >
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.iconColor}`} />

        <div className="min-w-0 flex-1">
          <p className="text-sm text-[var(--m-text)]">{finding.title}</p>
          <p className="mt-0.5 text-xs text-[var(--m-text-secondary)]">{finding.detail}</p>
        </div>

        <span className="mt-0.5 shrink-0 rounded-full bg-[var(--m-surface)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-text-secondary)]">
          {finding.affectedItems.length}
        </span>

        <ChevronRight
          className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--m-text-tertiary)] transition-transform duration-200 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="flex flex-wrap gap-1.5 pb-3 pl-11 pr-4">
          {finding.affectedItems.map((item, i) => (
            <div
              key={i}
              className="rounded-full border border-[var(--m-border)] bg-[var(--m-surface)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--m-text-secondary)]"
              title={item.sublabel}
            >
              {item.label}
              {item.sublabel && (
                <span className="ml-1 text-[var(--m-text-tertiary)]">· {item.sublabel}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FindingSection({
  severity,
  findings,
  expandedIds,
  onToggle,
}: {
  severity: FindingSeverity;
  findings: SecurityFinding[];
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (findings.length === 0) return null;
  const { sectionBg, sectionText } = SEVERITY_CONFIG[severity];

  return (
    <div>
      <div className={`px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${sectionBg}`}>
        {sectionText}
      </div>
      {findings.map((f) => (
        <FindingRow
          key={f.id}
          finding={f}
          expanded={expandedIds.has(f.id)}
          onToggle={() => onToggle(f.id)}
        />
      ))}
    </div>
  );
}

export function SecurityFindingsPanel({ findings }: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const critical = findings.filter((f) => f.severity === 'critical');
  const warning = findings.filter((f) => f.severity === 'warning');
  const info = findings.filter((f) => f.severity === 'info');

  return (
    <div className="rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--m-border)] px-4 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--m-text-secondary)]">
          Security Findings
        </h2>
        {findings.length > 0 ? (
          <div className="flex items-center gap-2">
            {critical.length > 0 && (
              <span className="rounded-full bg-[var(--m-error-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-error-text)]">
                {critical.length} critical
              </span>
            )}
            {warning.length > 0 && (
              <span className="rounded-full bg-[var(--m-warning-bg)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-warning-text)]">
                {warning.length} warning
              </span>
            )}
            {info.length > 0 && (
              <span className="rounded-full bg-[var(--m-primary-subtle)] px-2 py-0.5 text-[11px] font-semibold text-[var(--m-primary)]">
                {info.length} info
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* All clear */}
      {findings.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <ShieldCheck className="h-8 w-8 text-[var(--m-success)]" />
          <p className="text-sm font-medium text-[var(--m-text)]">No security findings.</p>
          <p className="text-xs text-[var(--m-text-secondary)]">
            All checks passed — access looks clean.
          </p>
        </div>
      ) : (
        <div>
          <FindingSection
            severity="critical"
            findings={critical}
            expandedIds={expandedIds}
            onToggle={toggle}
          />
          <FindingSection
            severity="warning"
            findings={warning}
            expandedIds={expandedIds}
            onToggle={toggle}
          />
          <FindingSection
            severity="info"
            findings={info}
            expandedIds={expandedIds}
            onToggle={toggle}
          />
        </div>
      )}
    </div>
  );
}
