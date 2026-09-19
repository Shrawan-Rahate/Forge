interface Props {
  label: string;
  percent: number;          // 0–100
  variant: 'user' | 'enemy';
  loading?: boolean;
}

export default function ProgressBar({ label, percent, variant, loading = false }: Props) {
  const clamped = Math.min(100, Math.max(0, percent));
  const isUser = variant === 'user';

  return (
    <div className="flex flex-col gap-2">
      {/* Header: Label + Percent */}
      <div className="flex items-center justify-between">
        <span
          className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${
            isUser ? 'text-forge-ember' : 'text-forge-ash-threat'
          }`}
        >
          {/* Subtle indicator dot */}
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isUser
                ? 'bg-forge-ember shadow-[0_0_6px_#f59e0b]'
                : 'bg-forge-ash-threat shadow-[0_0_6px_#ef4444]'
            }`}
          />
          {label}
        </span>
        <span
          className={`font-mono text-sm font-bold tabular-nums ${
            isUser ? 'text-forge-void-100' : 'text-forge-ash-threat'
          }`}
        >
          {loading ? '—' : `${clamped.toFixed(1)}%`}
        </span>
      </div>

      {/* Progress Track & Bar */}
      <div className={isUser ? 'forge-progress-track' : 'forge-threat-track'}>
        {!loading && (
          <div
            className={isUser ? 'forge-progress-user' : 'forge-progress-enemy'}
            style={{ width: `${clamped}%` }}
          />
        )}
        {loading && (
          <div className="h-full w-1/3 rounded-full bg-forge-void-700/60 animate-pulse" />
        )}
      </div>
    </div>
  );
}
