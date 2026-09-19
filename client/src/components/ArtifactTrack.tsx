import type { Milestone, MilestoneState } from '../types/api';

// Visual config per state
const STATE_CONFIG: Record<
  MilestoneState,
  {
    label: string;
    classNames: string;
    textClass: string;
    connectorClass: string;
    badgeBg: string;
  }
> = {
  LOCKED: {
    label: 'Locked',
    classNames: 'forge-artifact-node forge-artifact-locked',
    textClass: 'text-forge-steel-dim',
    connectorClass: 'border-t border-dashed border-forge-void-700/60',
    badgeBg: 'text-forge-steel-dim',
  },
  ACTIVE: {
    label: 'Active',
    classNames: 'forge-artifact-node forge-artifact-active',
    textClass: 'text-forge-ember font-bold',
    connectorClass: 'bg-forge-void-700',
    badgeBg: 'text-forge-ember font-extrabold',
  },
  COMPLETED: {
    label: 'Conquered',
    classNames: 'forge-artifact-node forge-artifact-completed',
    textClass: 'text-forge-triumph font-medium',
    connectorClass: 'bg-forge-triumph/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]',
    badgeBg: 'text-forge-triumph font-bold',
  },
  LOST: {
    label: 'Lost',
    classNames: 'forge-artifact-node forge-artifact-lost',
    textClass: 'text-forge-ash font-medium',
    connectorClass: 'border-t border-dashed border-forge-ash/60',
    badgeBg: 'text-forge-ash font-bold',
  },
  RECLAIMING: {
    label: 'Reclaiming',
    classNames: 'forge-artifact-node forge-artifact-reclaiming',
    textClass: 'text-forge-reclaim-pulse font-medium',
    connectorClass: 'bg-gradient-to-r from-forge-ash to-forge-reclaim-pulse',
    badgeBg: 'text-forge-reclaim-pulse font-bold',
  },
  RECLAIMED: {
    label: 'Restored',
    classNames: 'forge-artifact-node forge-artifact-reclaimed',
    textClass: 'text-forge-reclaim-bright font-medium',
    connectorClass: 'bg-forge-reclaim/80 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
    badgeBg: 'text-forge-reclaim-bright font-bold',
  },
};

function StateIcon({ state }: { state: MilestoneState }) {
  if (state === 'COMPLETED') {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
      </svg>
    );
  }
  if (state === 'RECLAIMED') {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
        <path d="M8 0.5l1.8 4.6 4.9.4-3.7 3.3 1.1 4.8L8 11.2l-4.1 2.4 1.1-4.8L1.3 5.5l4.9-.4L8 0.5z" />
      </svg>
    );
  }
  if (state === 'LOST') {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
        <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
      </svg>
    );
  }
  if (state === 'LOCKED') {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
        <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1.5V4.5A3.5 3.5 0 0 0 8 1zm-2 3.5a2 2 0 1 1 4 0V6H6V4.5z" />
      </svg>
    );
  }
  return null;
}

interface ArtifactNodeProps {
  milestone: Milestone;
}

function ArtifactNode({ milestone }: ArtifactNodeProps) {
  const cfg = STATE_CONFIG[milestone.state];

  return (
    <div className="flex flex-1 flex-col items-center relative z-10">
      {/* Rune Stone Node */}
      <div
        className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl ${cfg.classNames}`}
        title={`${milestone.title} (${cfg.label})`}
      >
        {/* Number or state-specific rune/glyph */}
        <span className={`font-mono text-xs flex items-center justify-center ${cfg.badgeBg}`}>
          {milestone.state === 'COMPLETED' ||
          milestone.state === 'RECLAIMED' ||
          milestone.state === 'LOST' ? (
            <StateIcon state={milestone.state} />
          ) : milestone.state === 'LOCKED' ? (
            <StateIcon state="LOCKED" />
          ) : (
            milestone.order
          )}
        </span>

        {/* Small corner tag for active or reclaiming */}
        {milestone.state === 'ACTIVE' && (
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-forge-ember shadow-[0_0_6px_#f59e0b]">
            <span className="h-1.5 w-1.5 rounded-full bg-forge-void-950" />
          </span>
        )}
      </div>

      {/* Title and State Labels */}
      <div className="mt-2.5 max-w-[84px] text-center">
        <p className="truncate text-xs font-semibold leading-tight text-forge-void-200">
          {milestone.title}
        </p>
        <p className={`mt-0.5 text-[10px] uppercase tracking-wider ${cfg.textClass}`}>
          {cfg.label}
        </p>
      </div>
    </div>
  );
}

interface Props {
  milestones: Milestone[];
}

export default function ArtifactTrack({ milestones }: Props) {
  const sorted = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <div className="relative w-full">
      {/* Connecting Path Behind Nodes */}
      <div className="absolute left-6 right-6 top-6 sm:top-7 hidden sm:flex items-center -translate-y-1/2 z-0">
        {sorted.slice(0, -1).map((m, i) => {
          const cfg = STATE_CONFIG[m.state];
          return (
            <div key={`conn-${i}`} className="flex-1 h-0.5 relative mx-1">
              <div className={`w-full h-full transition-all duration-500 ease-out ${cfg.connectorClass}`} />
            </div>
          );
        })}
      </div>

      {/* Nodes Row */}
      <div className="relative flex items-start justify-between gap-1 sm:gap-2">
        {sorted.map((m) => (
          <ArtifactNode key={m.id} milestone={m} />
        ))}
      </div>
    </div>
  );
}
