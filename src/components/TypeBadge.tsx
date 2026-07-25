import { RecordType } from '@/store/types';

const CONFIG: Record<RecordType, { label: string; bg: string; color: string }> = {
  vendor_inward: { label: 'INWARD', bg: 'hsl(168 62% 38% / 0.12)', color: 'hsl(168 62% 30%)' },
  production: { label: 'PRODUCTION', bg: 'hsl(32 85% 44% / 0.12)', color: 'hsl(32 85% 35%)' },
  challan: { label: 'CHALLAN', bg: 'hsl(200 65% 42% / 0.12)', color: 'hsl(200 65% 32%)' },
  adjustment: { label: 'ADJUSTMENT', bg: 'hsl(280 55% 50% / 0.12)', color: 'hsl(280 55% 40%)' },
};

export function TypeBadge({ type }: { type: RecordType }) {
  const cfg = CONFIG[type];
  return (
    <span
      className="type-badge"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}
