export interface CreateTaskInput {
  title: string;
  description?: string | null;
  points?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  points?: number;
}

export interface CompleteTaskInput {
  isCompleted?: boolean;
}
