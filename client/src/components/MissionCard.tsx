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
  ACTIVE:    'border-forge-ember/40 bg-forge-ember/10 text-forge-ember shadow-[0_0_10px_rgba(245,158,11,0.15)]',
  COMPLETED: 'border-forge-triumph/40 bg-forge-triumph/10 text-forge-triumph shadow-[0_0_10px_rgba(16,185,129,0.15)]',
  FAILED:    'border-forge-ash/40 bg-forge-ash/10 text-forge-ash shadow-[0_0_10px_rgba(220,38,38,0.15)]',
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
    <article className="forge-surface-card overflow-hidden">

      {/* ── MISSION HEADER ──────────────────────────────── */}
      <div className="border-b border-forge-void-700/70 bg-gradient-to-b from-forge-void-850/70 to-transparent px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-xl sm:text-2xl font-extrabold tracking-tight text-forge-void-100">
              {mission.title}
            </h2>
            {mission.description && (
              <p className="mt-1.5 text-sm leading-relaxed text-forge-void-300">
                {mission.description}
              </p>
            )}
          </div>
          <span
            className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${
              STATUS_BADGE[mission.status] ?? STATUS_BADGE['ACTIVE']
            }`}
          >
            {mission.status}
          </span>
        </div>

        {/* Date Timeline */}
        <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs font-mono text-forge-void-400">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold uppercase tracking-wider text-forge-void-500">Start</span>
            <span className="text-forge-void-300">{startDate}</span>
          </span>
          <span className="text-forge-void-600">·</span>
          <span className="flex items-center gap-1.5">
            <span className="font-semibold uppercase tracking-wider text-forge-void-500">Deadline</span>
            <span className="text-forge-void-300">{endDate}</span>
          </span>
        </div>
      </div>

      {/* ── DUAL PROGRESS ───────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 border-b border-forge-void-700/70 bg-forge-void-950/60 px-6 py-5 sm:grid-cols-2">
        <ProgressBar
          label="Your Progress"
          percent={userProgress ?? 0}
          variant="user"
          loading={userProgress === null}
        />
        <ProgressBar
          label="Enemy Threat"
          percent={enemyProgress ?? 0}
          variant="enemy"
          loading={enemyProgress === null}
        />
      </div>

      {/* ── SIX ARTIFACTS ───────────────────────────────── */}
      <div className="border-b border-forge-void-700/70 bg-forge-void-900/40 px-6 py-6">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-forge-void-400">
          Mission Path · 6 Artifacts
        </p>
        <ArtifactTrack milestones={mission.milestones} />
      </div>

      {/* ── CURRENT MILESTONE ───────────────────────────── */}
      {currentMilestone && (
        <div className="bg-forge-void-900/60 px-6 py-6">
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
