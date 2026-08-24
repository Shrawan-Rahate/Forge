import { MissionStatus, MilestoneState } from '@prisma/client';
import prisma from '../config/prisma.js';
import { CreateMissionInput } from '../validations/mission.validation.js';

export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotFoundError';
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
