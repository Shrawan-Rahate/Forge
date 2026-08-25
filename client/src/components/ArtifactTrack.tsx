import type { Milestone, MilestoneState } from '../types/api';

// Visual config per state
const STATE_CONFIG: Record<
  MilestoneState,
  { label: string; ring: string; bg: string; text: string; numberBg: string; connector: string }
> = {
  LOCKED: {
    label: 'Locked',
    ring: 'ring-slate-700',
    bg: 'bg-slate-900',
    text: 'text-slate-600',
    numberBg: 'bg-slate-800 text-slate-600',
    connector: 'bg-slate-800',
  },
  ACTIVE: {
    label: 'Active',
    ring: 'ring-amber-500',
    bg: 'bg-amber-950/30',
    text: 'text-amber-300',
    numberBg: 'bg-amber-500 text-slate-950',
    connector: 'bg-amber-900/40',
  },
  COMPLETED: {
    label: 'Conquered',
    ring: 'ring-emerald-600',
    bg: 'bg-emerald-950/30',
    text: 'text-emerald-400',
    numberBg: 'bg-emerald-600 text-white',
    connector: 'bg-emerald-900/60',
  },
  LOST: {
    label: 'Lost',
    ring: 'ring-red-700',
    bg: 'bg-red-950/30',
    text: 'text-red-400',
    numberBg: 'bg-red-800 text-white',
    connector: 'bg-red-950/40',
  },
  RECLAIMING: {
    label: 'Reclaiming',
    ring: 'ring-orange-500',
    bg: 'bg-orange-950/30',
    text: 'text-orange-400',
    numberBg: 'bg-orange-600 text-white',
    connector: 'bg-orange-950/40',
  },
  RECLAIMED: {
    label: 'Restored',
    ring: 'ring-sky-500',
    bg: 'bg-sky-950/30',
    text: 'text-sky-400',
    numberBg: 'bg-sky-600 text-white',
    connector: 'bg-sky-950/40',
  },
};

// Icons per state (simple SVG glyphs, no external lib)
function StateIcon({ state }: { state: MilestoneState }) {
  if (state === 'COMPLETED') {
    return (
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 1 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
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
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
        <path d="M8 1a3.5 3.5 0 0 0-3.5 3.5V6H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1.5V4.5A3.5 3.5 0 0 0 8 1zm-2 3.5a2 2 0 1 1 4 0V6H6V4.5z" />
      </svg>
    );
  }
  return null;
}

interface ArtifactNodeProps {
  milestone: Milestone;
  isLast: boolean;
}

function ArtifactNode({ milestone, isLast }: ArtifactNodeProps) {
  const cfg = STATE_CONFIG[milestone.state];

  return (
    <div className="flex flex-1 flex-col items-center">
      {/* Node */}
      <div
        className={`relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ring-2 ${cfg.ring} ${cfg.bg}`}
        title={milestone.title}
      >
        {/* Number or icon */}
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${cfg.numberBg}`}>
          {milestone.state === 'COMPLETED' || milestone.state === 'LOST' ? (
            <StateIcon state={milestone.state} />
          ) : (
            milestone.order
          )}
        </span>
        {/* Locked overlay */}
        {milestone.state === 'LOCKED' && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-slate-500 ring-1 ring-slate-700">
            <StateIcon state="LOCKED" />
          </span>
        )}
        {/* Active pulse ring */}
        {milestone.state === 'ACTIVE' && (
          <span className="absolute inset-0 animate-ping rounded-full bg-amber-500 opacity-20" />
        )}
      </div>

      {/* Connector line (not after last) */}
      {!isLast && (
        <div className="hidden md:flex md:absolute md:top-6 md:translate-y-0" />
      )}

      {/* Label */}
      <div className="mt-2 max-w-[80px] text-center">
        <p className={`truncate text-[11px] font-semibold leading-tight ${cfg.text}`}>
          {milestone.title}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-600">{cfg.label}</p>
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
      {/* Connecting line behind nodes */}
      <div className="absolute left-0 right-0 top-6 hidden h-px bg-slate-800 md:block" />

      <div className="relative flex items-start justify-between gap-2">
        {sorted.map((m, i) => (
          <ArtifactNode key={m.id} milestone={m} isLast={i === sorted.length - 1} />
        ))}
      </div>
    </div>
  );
}
