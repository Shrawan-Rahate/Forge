import prisma from '../config/prisma.js';
import { CreateTaskInput, UpdateTaskInput } from '../types/task.types.js';

export class MilestoneNotFoundError extends Error {
  constructor(message: string = 'Milestone not found.') {
    super(message);
    this.name = 'MilestoneNotFoundError';
  }
}

export class TaskNotFoundError extends Error {
  constructor(message: string = 'Task not found.') {
    super(message);
    this.name = 'TaskNotFoundError';
  }
}

/**
 * Creates a new task under a milestone belonging to the authenticated user's mission
 */
export const createTask = async (userId: string, milestoneId: string, input: CreateTaskInput) => {
  // 1. Verify milestone ownership through the relation chain (Milestone -> Mission -> User)
  const milestone = await prisma.milestone.findFirst({
    where: {
      id: milestoneId,
      mission: {
        userId,
      },
    },
  });

  if (!milestone) {
    throw new MilestoneNotFoundError(`Milestone with ID '${milestoneId}' was not found.`);
  }

  // 2. Create the task
  const task = await prisma.task.create({
    data: {
      milestoneId,
      title: input.title.trim(),
      description: input.description !== undefined && input.description !== null ? input.description.trim() : null,
      points: input.points !== undefined ? input.points : 1,
    },
  });

  return task;
};

/**
 * Retrieves all tasks for a milestone belonging to the authenticated user's mission
 */
export const getTasksByMilestone = async (userId: string, milestoneId: string) => {
  // 1. Verify milestone ownership
  const milestone = await prisma.milestone.findFirst({
    where: {
      id: milestoneId,
      mission: {
        userId,
      },
    },
  });

  if (!milestone) {
    throw new MilestoneNotFoundError(`Milestone with ID '${milestoneId}' was not found.`);
  }

  // 2. Fetch all tasks ordered by creation time
  const tasks = await prisma.task.findMany({
    where: {
      milestoneId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return tasks;
};

/**
 * Updates a task belonging to the authenticated user's mission
 */
export const updateTask = async (userId: string, taskId: string, input: UpdateTaskInput) => {
  // 1. Verify task ownership through the relation chain (Task -> Milestone -> Mission -> User)
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      milestone: {
        mission: {
          userId,
        },
      },
    },
  });

  if (!existingTask) {
    throw new TaskNotFoundError(`Task with ID '${taskId}' was not found.`);
  }

  // 2. Update task fields (milestoneId cannot be modified)
  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description !== null ? input.description.trim() : null }
        : {}),
      ...(input.points !== undefined ? { points: input.points } : {}),
    },
  });

  return updatedTask;
};

/**
 * Deletes a task belonging to the authenticated user's mission
 */
export const deleteTask = async (userId: string, taskId: string) => {
  // 1. Verify task ownership
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      milestone: {
        mission: {
          userId,
        },
      },
    },
  });

  if (!existingTask) {
    throw new TaskNotFoundError(`Task with ID '${taskId}' was not found.`);
  }

  // 2. Delete task
  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return { id: taskId };
};

/**
 * Marks a task complete (or optionally incomplete) idempotently
 */
export const completeTask = async (userId: string, taskId: string, isCompleted: boolean = true) => {
  // 1. Verify task ownership
  const existingTask = await prisma.task.findFirst({
    where: {
      id: taskId,
      milestone: {
        mission: {
          userId,
        },
      },
    },
  });

  if (!existingTask) {
    throw new TaskNotFoundError(`Task with ID '${taskId}' was not found.`);
  }

  // 2. Idempotent check: If task is already in the requested completion state, return without altering completedAt
  if (existingTask.isCompleted === isCompleted) {
    return existingTask;
  }

  // 3. Update completion status and timestamp
  const updatedTask = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  return updatedTask;
};
