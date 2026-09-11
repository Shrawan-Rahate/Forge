import { useCallback, useEffect, useState } from 'react';
import type { Mission, Milestone, MilestoneState } from '../types/api';
import { getMilestoneProgress, getMissionProgress } from '../services/progress.service';
import ArtifactTrack from './ArtifactTrack';
import ProgressBar from './ProgressBar';
import CurrentMilestone from './CurrentMilestone';

// Determine which milestone is "current" for display purposes:
// ACTIVE first, then RECLAIMING, then LOST, then COMPLETED (last one)
function findCurrentMilestone(milestones: Milestone[]): Milestone | null {
  const sorted = [...milestones].sort((a, b) => a.order - b.order);
  const priority: MilestoneState[] = ['ACTIVE', 'RECLAIMING', 'LOST'];
  for (const state of priority) {
    const found = sorted.find((m) => m.state === state);
    if (found) return found;
  }
  // Fallback: last completed
  const completed = sorted.filter((m) => m.state === 'COMPLETED');
  return completed.length > 0 ? completed[completed.length - 1] : sorted[0] ?? null;
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    'border-amber-700 bg-amber-950/50 text-amber-400',
  COMPLETED: 'border-emerald-700 bg-emerald-950/50 text-emerald-400',
  FAILED:    'border-red-800 bg-red-950/50 text-red-400',
};

interface Props {
  mission: Mission;
}

export default function MissionCard({ mission }: Props) {
  const [enemyProgress, setEnemyProgress] = useState<number | null>(null);
  const [userProgress, setUserProgress] = useState<number | null>(null);

  const currentMilestone = findCurrentMilestone(mission.milestones);

  // Fetch both progress values — also callable as a refresh callback
  const refreshProgress = useCallback(async () => {
    // Enemy (time) progress
    try {
      const ep = await getMissionProgress(mission.id);
      setEnemyProgress(ep.enemyProgress);
    } catch {
      setEnemyProgress(0);
    }

    // User milestone progress
    if (currentMilestone) {
      try {
        const mp = await getMilestoneProgress(currentMilestone.id);
        setUserProgress(mp.progressPercent);
      } catch {
        setUserProgress(0);
      }
    } else {
      setUserProgress(0);
    }
  }, [mission.id, currentMilestone?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  const startDate = new Date(mission.startDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const endDate = new Date(mission.endDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">

      {/* ── MISSION HEADER ──────────────────────────────── */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-xl font-bold tracking-tight text-slate-100">
              {mission.title}
            </h2>
            {mission.description && (
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {mission.description}
              </p>
            )}
          </div>
          <span
            className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${STATUS_BADGE[mission.status] ?? STATUS_BADGE['ACTIVE']}`}
          >
            {mission.status}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
          <span>
            <span className="font-semibold text-slate-400">Start</span>
            &nbsp;·&nbsp;{startDate}
          </span>
          <span>
            <span className="font-semibold text-slate-400">End</span>
            &nbsp;·&nbsp;{endDate}
          </span>
        </div>
      </div>

      {/* ── DUAL PROGRESS ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 border-b border-slate-800 bg-slate-950/40 px-6 py-5 sm:grid-cols-2">
        <ProgressBar
          label="Your Progress"
          percent={userProgress ?? 0}
          variant="user"
          loading={userProgress === null}
        />
        <ProgressBar
          label="Enemy Progress"
          percent={enemyProgress ?? 0}
          variant="enemy"
          loading={enemyProgress === null}
        />
      </div>

      {/* ── SIX ARTIFACTS ───────────────────────────────── */}
      <div className="border-b border-slate-800 px-6 py-6">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-600">
          Mission Path
        </p>
        <ArtifactTrack milestones={mission.milestones} />
      </div>

      {/* ── CURRENT MILESTONE ───────────────────────────── */}
      {currentMilestone && (
        <div className="px-6 py-5">
          <CurrentMilestone
            milestone={currentMilestone}
            userProgressPercent={userProgress}
            onProgressRefresh={refreshProgress}
          />
        </div>
      )}
    </article>
  );
}
