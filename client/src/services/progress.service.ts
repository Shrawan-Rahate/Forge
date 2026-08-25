import { apiFetch } from './api';
import type { ApiSuccess } from '../types/api';

interface MilestoneProgressData {
  milestoneId: string;
  totalTaskPoints: number;
  completedTaskPoints: number;
  progressPercent: number;
}

interface MilestoneProgressResponse {
  progress: MilestoneProgressData;
}

export async function getMilestoneProgress(milestoneId: string): Promise<MilestoneProgressData> {
  const res = await apiFetch<ApiSuccess<MilestoneProgressResponse>>(
    `/milestones/${milestoneId}/progress`
  );
  return res.data.progress;
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
