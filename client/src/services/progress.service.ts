import { apiFetch } from './api';
import type { ApiSuccess } from '../types/api';

// Server returns: { milestoneId, totalPoints, completedPoints, progress }
interface MilestoneProgressServerData {
  milestoneId: string;
  totalPoints: number;
  completedPoints: number;
  progress: number;
}

// Normalised shape used by MissionCard
export interface MilestoneProgressData {
  milestoneId: string;
  totalTaskPoints: number;
  completedTaskPoints: number;
  progressPercent: number;
}

export async function getMilestoneProgress(milestoneId: string): Promise<MilestoneProgressData> {
  const res = await apiFetch<ApiSuccess<MilestoneProgressServerData>>(
    `/milestones/${milestoneId}/progress`
  );
  const d = res.data;
  return {
    milestoneId: d.milestoneId,
    totalTaskPoints: d.totalPoints,
    completedTaskPoints: d.completedPoints,
    progressPercent: d.progress,
  };
}

interface MissionProgressData {
  missionId: string;
  enemyProgress: number;
  currentTime: string;
  milestones: {
    order: number;
    boundaryTime: string;
    enemyHasReachedBoundary: boolean;
  }[];
}

export async function getMissionProgress(missionId: string): Promise<MissionProgressData> {
  const res = await apiFetch<ApiSuccess<MissionProgressData>>(
    `/missions/${missionId}/progress`
  );
  return res.data;
}
