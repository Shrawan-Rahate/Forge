import { useEffect, useState } from 'react';
import { getMe } from '../services/auth.service';
import { getMissions } from '../services/mission.service';
import { removeToken } from '../services/api';
import MissionCard from '../components/MissionCard';
import type { User, Mission } from '../types/api';

interface Props {
  onLogout: () => void;
}

type LoadState = 'loading' | 'ready' | 'error';

// ── Skeleton loader ──────────────────────────────────────
function Skeleton() {
  return (
    <div className="forge-surface-card overflow-hidden animate-pulse">
      <div className="border-b border-forge-void-700/70 px-6 py-6">
        <div className="h-6 w-2/5 rounded-lg bg-forge-void-800" />
        <div className="mt-2.5 h-4 w-3/5 rounded-lg bg-forge-void-800/60" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-b border-forge-void-700/70 px-6 py-5">
        <div className="h-10 rounded-lg bg-forge-void-800" />
        <div className="h-10 rounded-lg bg-forge-void-800" />
      </div>
      <div className="flex justify-between gap-3 px-6 py-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2.5">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-forge-void-800" />
            <div className="h-3 w-12 rounded bg-forge-void-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage({ onLogout }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [fetchedUser, fetchedMissions] = await Promise.all([getMe(), getMissions()]);
        setUser(fetchedUser);
        setMissions(fetchedMissions);
        setLoadState('ready');
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load dashboard');
        setLoadState('error');
      }
    }
    load();
  }, []);

  function handleLogout() {
    removeToken();
    onLogout();
  }

  return (
    <div className="min-h-screen bg-forge-void-950 text-forge-void-100">

      {/* ── HEADER ──────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-forge-void-700/80 bg-forge-void-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-forge-ember via-forge-ember-smolder to-forge-ember-deep text-forge-void-950 shadow-[0_0_16px_rgba(245,158,11,0.45)]">
              {/* Geometric Anvil / Forge Glyph */}
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M10 2L3 6v3h2v7h10V9h2V6L10 2zm0 2.5L14.5 7H5.5L10 4.5zM7 14V9h6v5H7z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold tracking-tight text-forge-void-100">
                Forge
              </span>
              <span className="hidden sm:inline-block rounded border border-forge-void-700 bg-forge-void-900/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-forge-void-400">
                Mission Control
              </span>
            </div>
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3.5">
            {user && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-forge-void-200">
                  {user.name || 'Operative'}
                </span>
                <span className="font-mono text-[11px] text-forge-void-500">{user.email}</span>
              </div>
            )}
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="rounded-lg border border-forge-void-700 bg-forge-void-900/80 px-3.5 py-1.5 text-xs font-semibold text-forge-void-400 hover:border-forge-ash hover:bg-forge-ash/10 hover:text-forge-ash transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* Loading */}
        {loadState === 'loading' && (
          <div className="flex flex-col gap-6">
            <Skeleton />
          </div>
        )}

        {/* Error */}
        {loadState === 'error' && (
          <div
            role="alert"
            className="rounded-xl border border-forge-ash/50 bg-forge-ash/10 px-5 py-4 text-sm text-forge-ash"
          >
            <span className="font-bold">Error: </span>{errorMsg}
          </div>
        )}

        {/* Ready */}
        {loadState === 'ready' && (
          <>
            {/* Welcome Banner */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-forge-void-100">
                Welcome back
                {user?.name ? (
                  <span className="text-forge-ember">, {user.name}</span>
                ) : null}
              </h1>
              <p className="mt-1.5 text-sm text-forge-void-400">
                {missions.length > 0
                  ? `You have ${missions.length} active mission${missions.length > 1 ? 's' : ''} in the Forge.`
                  : 'No missions active. Create a mission to begin your forge.'}
              </p>
            </div>

            {/* Mission list */}
            {missions.length === 0 ? (
              <div className="forge-surface-card px-8 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-forge-void-700 bg-forge-void-800 text-forge-void-400 mb-3">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <p className="text-base font-bold text-forge-void-300">No missions found</p>
                <p className="mt-1 text-xs text-forge-void-500">Create a mission to start tracking your goals.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {missions.map((mission) => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
