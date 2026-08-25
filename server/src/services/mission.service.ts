import { MissionStatus, MilestoneState } from '@prisma/client';
import prisma from '../config/prisma.js';
import { CreateMissionInput } from '../validations/mission.validation.js';

export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class MissionNotFoundError extends Error {
  constructor(message: string = 'Mission not found.') {
    super(message);
    this.name = 'MissionNotFoundError';
  }
}

/**
 * Creates a new mission with exactly 6 milestones inside an atomic Prisma transaction.
 * - Authenticated userId is passed in from req.user.userId
 * - Milestone 1 starts as ACTIVE
 * - Milestones 2-6 start as LOCKED
 * - Mission status starts as ACTIVE
 */
export const createMission = async (userId: string, input: CreateMissionInput) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify the authenticated user exists in PostgreSQL
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UserNotFoundError(`User with ID '${userId}' was not found.`);
    }

    // 2. Construct milestone records with required ordering and initial states
    const milestoneData = input.milestones.map((milestone, index) => ({
      order: index + 1,
      title: milestone.title.trim(),
      description: milestone.description?.trim() || null,
      state: index === 0 ? MilestoneState.ACTIVE : MilestoneState.LOCKED,
    }));

    // 3. Create mission and its 6 milestones atomically
    const newMission = await tx.mission.create({
      data: {
        userId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        status: MissionStatus.ACTIVE,
        milestones: {
          create: milestoneData,
        },
      },
      include: {
        milestones: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return newMission;
  });
};

/**
  * Calculates dynamic time-enemy progress and milestone boundaries for a mission
  */
export const getMissionProgress = async (userId: string, missionId: string) => {
  // 1. Verify mission ownership
  const mission = await prisma.mission.findFirst({
    where: {
      id: missionId,
      userId,
    },
    include: {
      milestones: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!mission) {
    throw new MissionNotFoundError(`Mission with ID '${missionId}' was not found.`);
  }

  // 2. Calculate time bounds and progress
  const now = new Date();
  const currentTime = now.toISOString();
  const currentMs = now.getTime();
  const startMs = mission.startDate.getTime();
  const endMs = mission.endDate.getTime();
  const totalMissionDuration = endMs - startMs;

  let rawEnemyProgress = 0;
  if (totalMissionDuration > 0) {
    rawEnemyProgress = ((currentMs - startMs) / totalMissionDuration) * 100;
  }
  const clampedProgress = Math.max(0, Math.min(100, rawEnemyProgress));
  const enemyProgress = Number(clampedProgress.toFixed(2));

  // 3. Calculate equal 1/6 mission milestone boundaries
  const milestoneBoundaries = mission.milestones.map((milestone) => {
    const sliceMs = totalMissionDuration > 0 ? (milestone.order / 6) * totalMissionDuration : 0;
    const milestoneBoundaryMs = startMs + sliceMs;
    const boundaryTime = new Date(milestoneBoundaryMs).toISOString();
    const enemyHasReachedBoundary = currentMs >= milestoneBoundaryMs;

    return {
      order: milestone.order,
      boundaryTime,
      enemyHasReachedBoundary,
    };
  });

  return {
    missionId: mission.id,
    enemyProgress,
    currentTime,
    milestones: milestoneBoundaries,
  };
};

/**
 * Evaluates state transitions (COMPLETED, LOST, LOCKED, ACTIVE) for a mission's milestones idempotently
 * and returns the current mission state overview.
 */
export const evaluateAndGetMissionState = async (userId: string, missionId: string) => {
  // 1. Fetch mission with milestones and task data
  const mission = await prisma.mission.findFirst({
    where: {
      id: missionId,
      userId,
    },
    include: {
      milestones: {
        orderBy: {
          order: 'asc',
        },
        include: {
          tasks: {
            select: {
              points: true,
              isCompleted: true,
            },
          },
        },
      },
    },
  });

  if (!mission) {
    throw new MissionNotFoundError(`Mission with ID '${missionId}' was not found.`);
  }

  // 2. Time calculations
  const now = new Date();
  const currentTime = now.toISOString();
  const currentMs = now.getTime();
  const startMs = mission.startDate.getTime();
  const endMs = mission.endDate.getTime();
  const totalMissionDuration = endMs - startMs;

  let rawEnemyProgress = 0;
  if (totalMissionDuration > 0) {
    rawEnemyProgress = ((currentMs - startMs) / totalMissionDuration) * 100;
  }
  const enemyProgress = Number(Math.max(0, Math.min(100, rawEnemyProgress)).toFixed(2));

  // 3. Evaluate milestone states sequentially
  const milestoneResults = [];

  for (let i = 0; i < mission.milestones.length; i++) {
    const milestone = mission.milestones[i];

    // Compute task progress
    let totalPoints = 0;
    let completedPoints = 0;
    for (const task of milestone.tasks) {
      totalPoints += task.points;
      if (task.isCompleted) {
        completedPoints += task.points;
      }
    }
    const rawUserProgress = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;
    const userProgress = Number(rawUserProgress.toFixed(2));

    // Compute boundary time
    const sliceMs = totalMissionDuration > 0 ? (milestone.order / 6) * totalMissionDuration : 0;
    const milestoneBoundaryMs = startMs + sliceMs;
    const boundaryTime = new Date(milestoneBoundaryMs).toISOString();
    const enemyHasReachedBoundary = currentMs >= milestoneBoundaryMs;

    let currentState = milestone.state;
    let currentCompletedAt = milestone.completedAt;

    // State Evaluation Logic for ACTIVE milestones:
    if (currentState === MilestoneState.ACTIVE) {
      if (userProgress >= 100 && totalPoints > 0) {
        // Milestone COMPLETED
        currentState = MilestoneState.COMPLETED;
        currentCompletedAt = now;

        await prisma.milestone.update({
          where: { id: milestone.id },
          data: {
            state: MilestoneState.COMPLETED,
            completedAt: now,
          },
        });

        // Unlock next milestone if locked
        if (i + 1 < mission.milestones.length) {
          const nextMilestone = mission.milestones[i + 1];
          if (nextMilestone.state === MilestoneState.LOCKED) {
            nextMilestone.state = MilestoneState.ACTIVE;
            await prisma.milestone.update({
              where: { id: nextMilestone.id },
              data: { state: MilestoneState.ACTIVE },
            });
          }
        }
      } else if (enemyHasReachedBoundary && userProgress < 100) {
        // Milestone LOST (time boundary reached and user task progress < 100%)
        currentState = MilestoneState.LOST;

        await prisma.milestone.update({
          where: { id: milestone.id },
          data: {
            state: MilestoneState.LOST,
          },
        });
        // Next milestone remains LOCKED. No automatic activation.
      }
    }

    milestoneResults.push({
      id: milestone.id,
      order: milestone.order,
      title: milestone.title,
      state: currentState,
      completedAt: currentCompletedAt,
      userProgress,
      boundaryTime,
      enemyHasReachedBoundary,
    });
  }

  return {
    missionId: mission.id,
    status: mission.status,
    enemyProgress,
    currentTime,
    milestones: milestoneResults,
  };
};

/**
 * Retrieves all missions owned by the authenticated user, ordered by createdAt descending,
 * including each mission's 6 milestones ordered by order ascending.
 */
export const getUserMissions = async (userId: string) => {
  const missions = await prisma.mission.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      milestones: {
        orderBy: {
          order: 'asc',
        },
        select: {
          id: true,
          order: true,
          title: true,
          description: true,
          state: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return missions;
};
