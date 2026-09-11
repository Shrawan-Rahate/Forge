// API response and domain types for Forge client

export type MilestoneState = 'LOCKED' | 'ACTIVE' | 'COMPLETED' | 'LOST' | 'RECLAIMING' | 'RECLAIMED';
export type MissionStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface Milestone {
  id: string;
  order: number;
  title: string;
  description: string | null;
  state: MilestoneState;
  completedAt: string | null;
}

export interface Task {
  id: string;
  milestoneId: string;
  title: string;
  description: string | null;
  points: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: MissionStatus;
  milestones: Milestone[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiSuccess<T> {
  status: 'success';
  data: T;
}

export interface ApiError {
  status: 'fail' | 'error';
  message: string;
}
