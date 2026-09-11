import type { Milestone, MilestoneState } from '../types/api';
import TaskList from './TaskList';

const STATE_CONFIG: Record<MilestoneState, { label: string; accent: string; bg: string; border: string }> = {
  LOCKED:     { label: 'Locked',     accent: 'text-slate-500',  bg: 'bg-slate-900',       border: 'border-slate-800' },
  ACTIVE:     { label: 'Active',     accent: 'text-amber-400',  bg: 'bg-amber-950/20',    border: 'border-amber-800' },
  COMPLETED:  { label: 'Conquered',  accent: 'text-emerald-400',bg: 'bg-emerald-950/20',  border: 'border-emerald-800' },
  LOST:       { label: 'Lost',       accent: 'text-red-400',    bg: 'bg-red-950/20',      border: 'border-red-800' },
  RECLAIMING: { label: 'Reclaiming', accent: 'text-orange-400', bg: 'bg-orange-950/20',   border: 'border-orange-800' },
  RECLAIMED:  { label: 'Restored',   accent: 'text-sky-400',    bg: 'bg-sky-950/20',      border: 'border-sky-800' },
};

interface Props {
  milestone: Milestone;
  userProgressPercent: number | null; // null = loading
  /** Called by TaskList after a completion toggle so MissionCard refreshes progress bars */
  onProgressRefresh: () => void;
}

export default function CurrentMilestone({ milestone, userProgressPercent, onProgressRefresh }: Props) {
  const cfg = STATE_CONFIG[milestone.state];
  const loading = userProgressPercent === null;

  return (
    <div className={`rounded-xl border p-5 ${cfg.bg} ${cfg.border}`}>
      {/* Header row */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Current Milestone
          </p>
          <h3 className={`text-base font-bold ${cfg.accent}`}>{milestone.title}</h3>
          {milestone.description && (
            <p className="mt-1 text-sm text-slate-400">{milestone.description}</p>
          )}
        </div>
        <span
          className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.border} ${cfg.accent}`}
        >
          {cfg.label}
        </span>
      </div>

      {/* Milestone progress bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Milestone Progress</span>
          <span className="text-sm font-bold tabular-nums text-slate-200">
            {loading ? '—' : `${(userProgressPercent ?? 0).toFixed(1)}%`}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          {!loading && (
            <div
              className="h-full rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              style={{ width: `${Math.min(100, userProgressPercent ?? 0)}%` }}
            />
          )}
        </div>
      </div>

      {/* Task list — only for interactive states */}
      {(milestone.state === 'ACTIVE' || milestone.state === 'RECLAIMING') && (
        <TaskList
          milestoneId={milestone.id}
          onProgressRefresh={onProgressRefresh}
        />
      )}
    </div>
  );
}
