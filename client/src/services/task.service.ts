import { apiFetch } from './api';
import type { ApiSuccess, Task } from '../types/api';

export interface CreateTaskInput {
  title: string;
  description?: string;
  points: number;
}

export async function createTask(milestoneId: string, input: CreateTaskInput): Promise<Task> {
  const res = await apiFetch<ApiSuccess<{ task: Task }>>(
    `/milestones/${milestoneId}/tasks`,
    { method: 'POST', body: JSON.stringify(input) }
  );
  return res.data.task;
}

export async function getTasks(milestoneId: string): Promise<Task[]> {
  const res = await apiFetch<ApiSuccess<{ tasks: Task[] }>>(
    `/milestones/${milestoneId}/tasks`
  );
  return res.data.tasks;
}

export async function completeTask(taskId: string): Promise<Task> {
  const res = await apiFetch<ApiSuccess<{ task: Task }>>(
    `/tasks/${taskId}/complete`,
    { method: 'PATCH' }
  );
  return res.data.task;
}

export async function uncompleteTask(taskId: string): Promise<Task> {
  const res = await apiFetch<ApiSuccess<{ task: Task }>>(
    `/tasks/${taskId}/uncomplete`,
    { method: 'PATCH' }
  );
  return res.data.task;
}
