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
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      <div className="border-b border-slate-800 px-6 py-6">
        <div className="h-6 w-2/3 rounded-lg bg-slate-800" />
        <div className="mt-2 h-4 w-1/2 rounded-lg bg-slate-800/60" />
      </div>
      <div className="grid grid-cols-2 gap-4 border-b border-slate-800 px-6 py-5">
        <div className="h-8 rounded-lg bg-slate-800" />
        <div className="h-8 rounded-lg bg-slate-800" />
      </div>
      <div className="flex justify-between gap-3 px-6 py-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-slate-800" />
            <div className="h-3 w-14 rounded bg-slate-800/60" />
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
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* ── HEADER ──────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-xs font-black text-slate-950">
              F
            </span>
            <span className="text-base font-bold tracking-tight text-slate-100">Forge</span>
          </div>

          {/* User + logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-300">
                  {user.name || 'Operative'}
                </span>
                <span className="text-[11px] text-slate-500">{user.email}</span>
              </div>
            )}
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-red-800 hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

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
            className="rounded-xl border border-red-800 bg-red-950/40 px-5 py-4 text-sm text-red-400"
          >
            <span className="font-semibold">Error: </span>{errorMsg}
          </div>
        )}

        {/* Ready */}
        {loadState === 'ready' && (
          <>
            {/* Welcome */}
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
                Welcome back
                {user?.name ? (
                  <span className="text-amber-500">, {user.name}</span>
                ) : null}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {missions.length > 0
                  ? `You have ${missions.length} active mission${missions.length > 1 ? 's' : ''}.`
                  : 'No missions yet. Create one to begin.'}
              </p>
            </div>

            {/* Mission list */}
            {missions.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-8 py-14 text-center">
                <p className="text-3xl">🛡</p>
                <p className="mt-3 text-sm font-semibold text-slate-400">No missions found</p>
                <p className="mt-1 text-xs text-slate-600">Create a mission to start tracking your goals.</p>
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
