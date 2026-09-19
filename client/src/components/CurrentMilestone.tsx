import type { Milestone, MilestoneState } from '../types/api';
import TaskList from './TaskList';

const STATE_CONFIG: Record<
  MilestoneState,
  { label: string; accent: string; badge: string; container: string }
> = {
  LOCKED: {
    label: 'Locked',
    accent: 'text-forge-steel',
    badge: 'border-forge-steel-dim/40 bg-forge-void-800 text-forge-steel',
    container: 'border-forge-void-700 bg-forge-void-900/60',
  },
  ACTIVE: {
    label: 'Active',
    accent: 'text-forge-ember',
    badge: 'border-forge-ember/40 bg-forge-ember/10 text-forge-ember shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    container: 'border-forge-ember/40 bg-gradient-to-b from-forge-ember/[0.04] to-forge-void-900/90 shadow-[0_0_24px_-4px_rgba(245,158,11,0.08)]',
  },
  COMPLETED: {
    label: 'Conquered',
    accent: 'text-forge-triumph',
    badge: 'border-forge-triumph/40 bg-forge-triumph/10 text-forge-triumph shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    container: 'border-forge-triumph/30 bg-gradient-to-b from-forge-triumph/[0.04] to-forge-void-900/90',
  },
  LOST: {
    label: 'Lost',
    accent: 'text-forge-ash',
    badge: 'border-forge-ash/40 bg-forge-ash/10 text-forge-ash shadow-[0_0_10px_rgba(220,38,38,0.15)]',
    container: 'border-forge-ash/40 bg-gradient-to-b from-forge-ash/[0.04] to-forge-void-900/90',
  },
  RECLAIMING: {
    label: 'Reclaiming',
    accent: 'text-forge-reclaim-pulse',
    badge: 'border-forge-reclaim-pulse/40 bg-forge-reclaim-pulse/10 text-forge-reclaim-pulse shadow-[0_0_10px_rgba(249,115,22,0.15)]',
    container: 'border-forge-reclaim-pulse/40 bg-gradient-to-b from-forge-reclaim-pulse/[0.04] to-forge-void-900/90 shadow-[0_0_24px_-4px_rgba(249,115,22,0.08)]',
  },
  RECLAIMED: {
    label: 'Restored',
    accent: 'text-forge-reclaim-bright',
    badge: 'border-forge-reclaim/40 bg-forge-reclaim/10 text-forge-reclaim-bright shadow-[0_0_10px_rgba(6,182,212,0.15)]',
    container: 'border-forge-reclaim/40 bg-gradient-to-b from-forge-reclaim/[0.04] to-forge-void-900/90 shadow-[0_0_24px_-4px_rgba(6,182,212,0.08)]',
  },
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
  const clampedProgress = Math.min(100, Math.max(0, userProgressPercent ?? 0));

  return (
    <section className={`rounded-xl border p-5 sm:p-6 transition-all ${cfg.container}`}>
      {/* Header Row */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-forge-void-400">
            Current Milestone · Artifact {milestone.order}
          </p>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-forge-void-100">
            {milestone.title}
          </h3>
          {milestone.description && (
            <p className="mt-1 text-sm leading-relaxed text-forge-void-300">
              {milestone.description}
            </p>
          )}
        </div>
        <span
          className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${cfg.badge}`}
        >
          {cfg.label}
        </span>
      </div>

      {/* Milestone Molten Progress Bar */}
      <div className="mt-4 pt-4 border-t border-forge-void-700/60">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-forge-void-400">
            Milestone Progress
          </span>
          <span className="font-mono text-sm font-bold tabular-nums text-forge-void-100">
            {loading ? '—' : `${clampedProgress.toFixed(1)}%`}
          </span>
        </div>
        <div className="forge-progress-track w-full">
          {!loading && (
            <div
              className="forge-progress-user"
              style={{ width: `${clampedProgress}%` }}
            />
          )}
          {loading && (
            <div className="h-full w-1/3 rounded-full bg-forge-void-700/60 animate-pulse" />
          )}
        </div>
      </div>

      {/* Task List — Active or Reclaiming */}
      {(milestone.state === 'ACTIVE' || milestone.state === 'RECLAIMING') && (
        <div className="mt-5 pt-5 border-t border-forge-void-700/60">
          <TaskList
            milestoneId={milestone.id}
            onProgressRefresh={onProgressRefresh}
          />
        </div>
      )}
    </section>
  );
}
