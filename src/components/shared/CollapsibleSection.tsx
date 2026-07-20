import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * A titled section that starts collapsed, for detail a page should offer but
 * not lead with. Native `<details>`, so keyboard operation and browser
 * find-in-page work without any state of our own.
 */
export function CollapsibleSection({
  title,
  description,
  defaultOpen,
  children,
}: Props) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-xl border border-[var(--m-border)] bg-[var(--m-bg)]"
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 p-4 transition-colors hover:bg-[var(--m-surface-hover)]">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-[var(--m-text)]">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-[var(--m-text-secondary)]">
              {description}
            </p>
          )}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--m-text-tertiary)] transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="space-y-4 border-t border-[var(--m-border)] p-4">
        {children}
      </div>
    </details>
  );
}
