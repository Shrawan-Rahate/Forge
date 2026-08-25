interface Props {
  label: string;
  percent: number;          // 0–100
  variant: 'user' | 'enemy';
  loading?: boolean;
}

const VARIANT_STYLES = {
  user: {
    bar: 'bg-amber-500',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    label: 'text-amber-400',
    track: 'bg-slate-800',
  },
  enemy: {
    bar: 'bg-red-600',
    glow: 'shadow-[0_0_12px_rgba(220,38,38,0.5)]',
    label: 'text-red-400',
    track: 'bg-slate-800',
  },
} as const;

export default function ProgressBar({ label, percent, variant, loading = false }: Props) {
  const s = VARIANT_STYLES[variant];
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-widest ${s.label}`}>
          {label}
        </span>
        <span className="text-sm font-bold tabular-nums text-slate-200">
          {loading ? '—' : `${clamped.toFixed(1)}%`}
        </span>
      </div>
      <div className={`h-3 w-full overflow-hidden rounded-full ${s.track}`}>
        {!loading && (
          <div
            className={`h-full rounded-full ${s.bar} ${s.glow}`}
            style={{ width: `${clamped}%` }}
          />
        )}
        {loading && (
          <div className="h-full w-1/3 rounded-full bg-slate-700 opacity-50" />
        )}
      </div>
    </div>
  );
}
