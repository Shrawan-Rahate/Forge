export interface RecoveryTask {
  id: string;
  title: string;
  description: string | null;
  points: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReclaimNotesPayload {
  target: number;
  recoveryTasks: RecoveryTask[];
}

export interface CreateRecoveryTaskInput {
  title: string;
  description?: string | null;
  points: number;
}
