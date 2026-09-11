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
    return <p className="mt-4 text-xs text-slate-500">Loading tasks…</p>;
  }

  if (error) {
    return (
      <p role="alert" className="mt-4 text-xs text-red-400">
        {error}
      </p>
    );
  }

  return (
    <div className="mt-4">
      {/* Point summary */}
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold uppercase tracking-widest">Tasks</span>
        <span className="tabular-nums">
          <span className="text-slate-300">{completedPoints}</span>
          {' / '}
          {totalPoints} pts
        </span>
      </div>

      {/* Task rows */}
      {tasks.length === 0 && !showForm && (
        <p className="text-xs text-slate-600">
          No tasks yet for this milestone.
        </p>
      )}

      {tasks.length > 0 && (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => {
            const isToggling = toggling.has(task.id);
            return (
              <li
                key={task.id}
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
                  task.isCompleted
                    ? 'border-emerald-900/60 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(task)}
                  disabled={isToggling}
                  aria-label={task.isCompleted ? `Uncomplete ${task.title}` : `Complete ${task.title}`}
                  className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border ${
                    task.isCompleted
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-600 bg-transparent hover:border-amber-500'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {task.isCompleted && (
                    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="currentColor">
                      <path d="M8.5 2.5 4 7 1.5 4.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-snug ${
                      task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="mt-0.5 text-xs text-slate-600">{task.description}</p>
                  )}
                </div>

                {/* Points badge */}
                <span
                  className={`flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-bold tabular-nums ${
                    task.isCompleted
                      ? 'bg-emerald-900/40 text-emerald-500'
                      : 'bg-slate-800 text-slate-400'
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
          className="mt-3 w-full rounded-lg border border-dashed border-slate-700 py-2 text-xs font-medium text-slate-500 hover:border-amber-700 hover:text-amber-400"
        >
          + Add Task
        </button>
      ) : (
        <form
          onSubmit={handleCreateTask}
          className="mt-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3"
        >
          {/* Title */}
          <input
            type="text"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={creating}
            className="w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-600 focus:outline-none disabled:opacity-50"
          />

          {/* Description */}
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            disabled={creating}
            className="mt-2 w-full rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-600 focus:outline-none disabled:opacity-50"
          />

          {/* Points + buttons row */}
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Pts"
              value={newPoints}
              onChange={(e) => setNewPoints(e.target.value)}
              disabled={creating}
              className="w-20 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:border-amber-600 focus:outline-none disabled:opacity-50"
            />
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
              className="rounded px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="rounded bg-amber-600 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? 'Adding…' : 'Add'}
            </button>
          </div>

          {/* Form error */}
          {formError && (
            <p role="alert" className="mt-2 text-xs text-red-400">
              {formError}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

