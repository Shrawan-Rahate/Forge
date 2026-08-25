import crypto from 'crypto';
import { MilestoneState, ReclaimStatus } from '@prisma/client';
import prisma from '../config/prisma.js';
import { MilestoneNotFoundError } from './task.service.js';
import { CreateRecoveryTaskInput, ReclaimNotesPayload, RecoveryTask } from '../types/reclaim.types.js';

export class InvalidReclaimStateError extends Error {
  constructor(message: string = 'Reclaim operation is not allowed in current milestone state.') {
    super(message);
    this.name = 'InvalidReclaimStateError';
  }
}

export class ReclaimLogNotFoundError extends Error {
  constructor(message: string = 'Reclaim log not found.') {
    super(message);
    this.name = 'ReclaimLogNotFoundError';
  }
}

export class RecoveryTaskNotFoundError extends Error {
  constructor(message: string = 'Recovery task not found.') {
    super(message);
    this.name = 'RecoveryTaskNotFoundError';
  }
}

/**
 * Starts a reclaim challenge for a LOST milestone:
 * - Calculates remaining uncompleted normal task points + 20 bonus
 * - Freezes target inside ReclaimLog notes JSON
 * - Sets milestone state to RECLAIMING
 */
export const startReclaim = async (userId: string, milestoneId: string) => {
  // 1. Verify milestone ownership
  const milestone = await prisma.milestone.findFirst({
    where: {
      id: milestoneId,
      mission: {
        userId,
      },
    },
    include: {
      tasks: true,
      reclaimLogs: {
        orderBy: { attemptNumber: 'desc' },
      },
    },
  });

  if (!milestone) {
    throw new MilestoneNotFoundError(`Milestone with ID '${milestoneId}' was not found.`);
  }

  // 2. Prevent duplicate active attempts if already RECLAIMING
  if (milestone.state === MilestoneState.RECLAIMING) {
    const activeLog = milestone.reclaimLogs.find((log) => log.status === ReclaimStatus.IN_PROGRESS);
    if (activeLog) {
      return formatReclaimStatusResponse(milestone.id, milestone.state, activeLog);
    }
  }

  // 3. Only LOST milestones can start reclaim
  if (milestone.state !== MilestoneState.LOST) {
    throw new InvalidReclaimStateError(
      `Cannot start reclaim. Milestone state is '${milestone.state}', expected 'LOST'.`
    );
  }

  // 4. Calculate frozen reclaim target: max(total - completed, 0) + 20
  let totalTaskPoints = 0;
  let completedTaskPoints = 0;
  for (const task of milestone.tasks) {
    totalTaskPoints += task.points;
    if (task.isCompleted) {
      completedTaskPoints += task.points;
    }
  }
  const remainingPoints = Math.max(totalTaskPoints - completedTaskPoints, 0);
  const reclaimBonus = 20;
  const reclaimTarget = Math.max(remainingPoints + reclaimBonus, 0);

  const attemptNumber = milestone.reclaimLogs.length + 1;
  const notesPayload: ReclaimNotesPayload = {
    target: reclaimTarget,
    recoveryTasks: [],
  };

  // 5. Create ReclaimLog and update Milestone state to RECLAIMING inside transaction
  const { reclaimLog } = await prisma.$transaction(async (tx) => {
    const newLog = await tx.reclaimLog.create({
      data: {
        milestoneId,
        attemptNumber,
        status: ReclaimStatus.IN_PROGRESS,
        startedAt: new Date(),
        notes: JSON.stringify(notesPayload),
      },
    });

    await tx.milestone.update({
      where: { id: milestoneId },
      data: { state: MilestoneState.RECLAIMING },
    });

    return { reclaimLog: newLog };
  });

  return formatReclaimStatusResponse(milestoneId, MilestoneState.RECLAIMING, reclaimLog);
};

/**
 * Returns current reclaim status, frozen target, completed points, and recovery tasks
 */
export const getReclaimStatus = async (userId: string, milestoneId: string) => {
  const milestone = await prisma.milestone.findFirst({
    where: {
      id: milestoneId,
      mission: {
        userId,
      },
    },
    include: {
      reclaimLogs: {
        orderBy: { attemptNumber: 'desc' },
      },
    },
  });

  if (!milestone) {
    throw new MilestoneNotFoundError(`Milestone with ID '${milestoneId}' was not found.`);
  }

  const latestLog = milestone.reclaimLogs[0];
  if (!latestLog) {
    throw new ReclaimLogNotFoundError(`No reclaim attempts found for milestone '${milestoneId}'.`);
  }

  return formatReclaimStatusResponse(milestone.id, milestone.state, latestLog);
};

/**
 * Creates a recovery task for an active reclaim attempt
 */
export const createRecoveryTask = async (userId: string, milestoneId: string, input: CreateRecoveryTaskInput) => {
  const milestone = await prisma.milestone.findFirst({
    where: {
      id: milestoneId,
      mission: {
        userId,
      },
    },
    include: {
      reclaimLogs: {
        where: { status: ReclaimStatus.IN_PROGRESS },
        orderBy: { attemptNumber: 'desc' },
      },
    },
  });

  if (!milestone) {
    throw new MilestoneNotFoundError(`Milestone with ID '${milestoneId}' was not found.`);
  }

  if (milestone.state !== MilestoneState.RECLAIMING) {
    throw new InvalidReclaimStateError(
      `Cannot add recovery task. Milestone state is '${milestone.state}', expected 'RECLAIMING'.`
    );
  }

  const activeLog = milestone.reclaimLogs[0];
  if (!activeLog) {
    throw new ReclaimLogNotFoundError(`No active reclaim attempt found for milestone '${milestoneId}'.`);
  }

  const notesData: ReclaimNotesPayload = parseNotes(activeLog.notes);
  const now = new Date().toISOString();

  const newRecoveryTask: RecoveryTask = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description?.trim() || null,
    points: input.points,
    isCompleted: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  notesData.recoveryTasks.push(newRecoveryTask);

  await prisma.reclaimLog.update({
    where: { id: activeLog.id },
    data: {
      notes: JSON.stringify(notesData),
    },
  });

  return newRecoveryTask;
};

/**
 * Completes a recovery task:
 * - Adds points to reclaim progress
 * - If target is reached: marks reclaim SUCCESS, milestone RECLAIMED, and unlocks next milestone if locked
 */
export const completeRecoveryTask = async (userId: string, taskId: string) => {
  // 1. Locate the ReclaimLog containing the recovery task belonging to user's mission
  const reclaimLogs = await prisma.reclaimLog.findMany({
    where: {
      status: ReclaimStatus.IN_PROGRESS,
      milestone: {
        mission: {
          userId,
        },
      },
    },
    include: {
      milestone: {
        include: {
          mission: {
            include: {
              milestones: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  let targetLog: (typeof reclaimLogs)[0] | null = null;
  let targetTask: RecoveryTask | null = null;
  let parsedNotes: ReclaimNotesPayload | null = null;

  for (const log of reclaimLogs) {
    const notes: ReclaimNotesPayload = parseNotes(log.notes);
    const foundTask = notes.recoveryTasks.find((t) => t.id === taskId);
    if (foundTask) {
      targetLog = log;
      targetTask = foundTask;
      parsedNotes = notes;
      break;
    }
  }

  if (!targetLog || !targetTask || !parsedNotes) {
    throw new RecoveryTaskNotFoundError(`Recovery task with ID '${taskId}' was not found.`);
  }

  // 2. Idempotent check: If already completed, return without altering state
  if (targetTask.isCompleted) {
    return {
      recoveryTask: targetTask,
      reclaimStatus: formatReclaimStatusResponse(targetLog.milestoneId, targetLog.milestone.state, targetLog),
    };
  }

  // 3. Mark task completed
  const nowStr = new Date().toISOString();
  targetTask.isCompleted = true;
  targetTask.completedAt = nowStr;
  targetTask.updatedAt = nowStr;

  const updatedNotesJson = JSON.stringify(parsedNotes);
  targetLog.notes = updatedNotesJson;

  // 4. Calculate total completed recovery points
  let completedPoints = 0;
  for (const task of parsedNotes.recoveryTasks) {
    if (task.isCompleted) {
      completedPoints += task.points;
    }
  }

  const target = parsedNotes.target;
  const isTargetReached = completedPoints >= target;

  if (isTargetReached) {
    const now = new Date();
    const milestone = targetLog.milestone;

    await prisma.$transaction(async (tx) => {
      // Mark ReclaimLog SUCCESS
      await tx.reclaimLog.update({
        where: { id: targetLog!.id },
        data: {
          status: ReclaimStatus.SUCCESS,
          resolvedAt: now,
          notes: updatedNotesJson,
        },
      });

      // Mark Milestone RECLAIMED
      await tx.milestone.update({
        where: { id: milestone.id },
        data: {
          state: MilestoneState.RECLAIMED,
        },
      });

      // Unlock next milestone if locked
      const allMilestones = milestone.mission.milestones;
      const currentIndex = allMilestones.findIndex((m) => m.id === milestone.id);
      if (currentIndex !== -1 && currentIndex + 1 < allMilestones.length) {
        const nextMilestone = allMilestones[currentIndex + 1];
        if (nextMilestone.state === MilestoneState.LOCKED) {
          await tx.milestone.update({
            where: { id: nextMilestone.id },
            data: { state: MilestoneState.ACTIVE },
          });
        }
      }
    });

    targetLog.status = ReclaimStatus.SUCCESS;
    targetLog.milestone.state = MilestoneState.RECLAIMED;
  } else {
    // Update notes with completed task
    await prisma.reclaimLog.update({
      where: { id: targetLog.id },
      data: {
        notes: updatedNotesJson,
      },
    });
  }

  return {
    recoveryTask: targetTask,
    reclaimStatus: formatReclaimStatusResponse(targetLog.milestoneId, targetLog.milestone.state, targetLog),
  };
};

/**
 * Helper to parse ReclaimLog notes JSON safely
 */
function parseNotes(notesStr: string | null): ReclaimNotesPayload {
  if (!notesStr) {
    return { target: 0, recoveryTasks: [] };
  }
  try {
    return JSON.parse(notesStr);
  } catch {
    return { target: 0, recoveryTasks: [] };
  }
}

/**
 * Helper to construct consistent reclaim status payload
 */
function formatReclaimStatusResponse(milestoneId: string, milestoneState: MilestoneState, reclaimLog: any) {
  const notesData: ReclaimNotesPayload = parseNotes(reclaimLog.notes);
  let completedPoints = 0;
  for (const task of notesData.recoveryTasks) {
    if (task.isCompleted) {
      completedPoints += task.points;
    }
  }
  const remainingPoints = Math.max(notesData.target - completedPoints, 0);

  return {
    milestoneId,
    milestoneState,
    attemptNumber: reclaimLog.attemptNumber,
    status: reclaimLog.status,
    startedAt: reclaimLog.startedAt,
    resolvedAt: reclaimLog.resolvedAt,
    target: notesData.target,
    completedPoints,
    remainingPoints,
    recoveryTasks: notesData.recoveryTasks,
  };
}
