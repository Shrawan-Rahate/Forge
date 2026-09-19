import { useEffect, useState } from 'react';
import type { Task } from '../types/api';
import { getTasks, completeTask, uncompleteTask, createTask } from '../services/task.service';

interface Props {
  milestoneId: string;
  /** Called after any completion toggle so parent can refresh progress */
  onProgressRefresh: () => void;
}

export default function TaskList({ milestoneId, onProgressRefresh }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Track which task ids are currently being toggled
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  // ── Add-task form state ──────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPoints, setNewPoints] = useState('1');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getTasks(milestoneId)
      .then((data) => {
        if (!cancelled) setTasks(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load tasks');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [milestoneId]);

  async function handleToggle(task: Task) {
    if (toggling.has(task.id)) return;

    setToggling((prev) => new Set(prev).add(task.id));
    try {
      const updated = task.isCompleted
        ? await uncompleteTask(task.id)
        : await completeTask(task.id);

      // Update local task state optimistically confirmed by server response
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );

      // Notify parent to refresh milestone progress
      onProgressRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  }

  // ── Add-task handler ──────────────────────────────────────
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    // Client-side validation
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      setFormError('Title is required.');
      return;
    }

    const parsedPoints = Number(newPoints);
    if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
      setFormError('Points must be a positive integer.');
      return;
    }

    setCreating(true);
    try {
      const created = await createTask(milestoneId, {
        title: trimmedTitle,
        description: newDescription.trim() || undefined,
        points: parsedPoints,
      });

      setTasks((prev) => [...prev, created]);
      // Clear form
      setNewTitle('');
      setNewDescription('');
      setNewPoints('1');
      setShowForm(false);
      setFormError(null);

      // Refresh progress since adding a task changes total points
      onProgressRefresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setCreating(false);
    }
  }

  // Compute point summary from local task state
  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);
  const completedPoints = tasks
    .filter((t) => t.isCompleted)
    .reduce((sum, t) => sum + t.points, 0);

  if (loading) {
    return <p className="mt-4 text-xs font-mono text-forge-void-400">Loading tasks…</p>;
  }

  if (error) {
    return (
      <p role="alert" className="mt-4 text-xs font-medium text-forge-ash">
        {error}
      </p>
    );
  }

  return (
    <div className="mt-4">
      {/* Point summary */}
      <div className="mb-3 flex items-center justify-between text-xs text-forge-void-400">
        <span className="font-bold uppercase tracking-widest text-forge-void-400">
          Tasks
        </span>
        <span className="font-mono tabular-nums">
          <span className="font-bold text-forge-ember">{completedPoints}</span>
          {' / '}
          <span className="text-forge-void-300">{totalPoints}</span> pts
        </span>
      </div>

      {/* Task rows */}
      {tasks.length === 0 && !showForm && (
        <p className="text-xs text-forge-void-500 py-1">
          No tasks yet for this milestone. Add one below.
        </p>
      )}

      {tasks.length > 0 && (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => {
            const isToggling = toggling.has(task.id);
            return (
              <li
                key={task.id}
                className={`flex items-start gap-3 rounded-lg border px-3.5 py-2.5 transition-all duration-200 ease-out ${
                  task.isCompleted
                    ? 'border-forge-triumph/25 bg-forge-triumph/[0.04] opacity-80'
                    : 'border-forge-void-700/80 bg-forge-void-850/80 hover:border-forge-void-600'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(task)}
                  disabled={isToggling}
                  aria-label={task.isCompleted ? `Uncomplete ${task.title}` : `Complete ${task.title}`}
                  className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all duration-150 hover:scale-105 active:scale-90 ${
                    task.isCompleted
                      ? 'border-forge-triumph bg-forge-triumph text-forge-void-950 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                      : 'border-forge-void-500 bg-forge-void-900 hover:border-forge-ember hover:shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {task.isCompleted && (
                    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 forge-check-pop" fill="none" stroke="currentColor">
                      <path d="M8.5 2.5 4 7 1.5 4.5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-snug transition-all duration-200 ${
                      task.isCompleted ? 'text-forge-void-400 line-through' : 'text-forge-void-100'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-0.5 text-xs text-forge-void-400">{task.description}</p>
                  )}
                </div>

                {/* Points badge */}
                <span
                  className={`flex-shrink-0 rounded px-2 py-0.5 text-xs font-mono font-bold tabular-nums border transition-colors duration-150 ${
                    task.isCompleted
                      ? 'bg-forge-triumph/15 border-forge-triumph/30 text-forge-triumph'
                      : 'bg-forge-void-800 border-forge-void-700 text-forge-void-300'
                  }`}
                >
                  {task.points}pt
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Add Task toggle / form ─────────────────────────── */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 w-full rounded-lg border border-dashed border-forge-void-700/80 py-2.5 text-xs font-semibold text-forge-void-400 hover:border-forge-ember/60 hover:text-forge-ember hover:bg-forge-ember/[0.04] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
        >
          <span>+</span> Add Task
        </button>
      ) : (
        <form
          onSubmit={handleCreateTask}
          className="mt-3 rounded-xl border border-forge-void-700 bg-forge-void-900/90 p-4 shadow-lg space-y-3"
        >
          {/* Title */}
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-forge-void-400">
              Task Title
            </label>
            <input
              type="text"
              placeholder="What needs to be forged?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={creating}
              className="w-full rounded-lg border border-forge-void-700 bg-forge-void-800 px-3.5 py-2 text-sm text-forge-void-100 placeholder-forge-void-500 outline-none focus:border-forge-ember focus:ring-1 focus:ring-forge-ember/40 focus:bg-forge-void-850 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-forge-void-400">
              Description <span className="text-forge-void-500 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Add tactical details..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              disabled={creating}
              className="w-full rounded-lg border border-forge-void-700 bg-forge-void-800 px-3.5 py-2 text-sm text-forge-void-100 placeholder-forge-void-500 outline-none focus:border-forge-ember focus:ring-1 focus:ring-forge-ember/40 focus:bg-forge-void-850 transition-colors disabled:opacity-50"
            />
          </div>

          {/* Points + action buttons */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-forge-void-400">
                Points:
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Pts"
                value={newPoints}
                onChange={(e) => setNewPoints(e.target.value)}
                disabled={creating}
                className="w-16 rounded-lg border border-forge-void-700 bg-forge-void-800 px-2.5 py-1.5 text-sm font-mono text-forge-void-100 outline-none focus:border-forge-ember focus:ring-1 focus:ring-forge-ember/40 focus:bg-forge-void-850 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex-1" />

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormError(null);
                setNewTitle('');
                setNewDescription('');
                setNewPoints('1');
              }}
              disabled={creating}
              className="rounded-lg px-3.5 py-1.5 text-xs font-semibold text-forge-void-400 hover:text-forge-void-200 active:scale-95 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-forge-ember px-4 py-1.5 text-xs font-bold text-forge-void-950 hover:bg-forge-ember-flare active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.35)] transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? 'Adding…' : 'Add Task'}
            </button>
          </div>

          {/* Form error */}
          {formError && (
            <p role="alert" className="text-xs font-medium text-forge-ash pt-1">
              {formError}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
