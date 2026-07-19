import type { FabricItemType } from '@/api/types/item';
import { itemTypeToken } from '@/utils/constants';

interface Props {
  type: FabricItemType;
}

// Pill badge — rounded-full, semibold, uppercase, 0.04em tracking.
// Color is map-driven: itemTypeToken() resolves the type to an --item-* CSS
// token (mode-aware via .dark {} overrides in index.css); unmapped types get
// the neutral 'default' token. Inline style is used so the token name can be
// composed dynamically (Tailwind can't scan a templated var name).
export function ItemTypeBadge({ type }: Props) {
  const token = itemTypeToken(type);
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{
        color: `var(--item-${token})`,
        backgroundColor: `var(--item-${token}-bg)`,
      }}
    >
      {type}
    </span>
  );
}
