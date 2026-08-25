import { Router } from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  completeTask,
  uncompleteTask,
  getMilestoneProgress,
} from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const taskRouter = Router();

// Milestone-scoped task routes (Protected by authenticate)
taskRouter.post('/milestones/:milestoneId/tasks', authenticate, createTask);
taskRouter.get('/milestones/:milestoneId/tasks', authenticate, getTasks);
taskRouter.get('/milestones/:milestoneId/progress', authenticate, getMilestoneProgress);

// Task-specific routes (Protected by authenticate)
taskRouter.patch('/tasks/:taskId', authenticate, updateTask);
taskRouter.delete('/tasks/:taskId', authenticate, deleteTask);
taskRouter.patch('/tasks/:taskId/complete', authenticate, completeTask);
taskRouter.patch('/tasks/:taskId/uncomplete', authenticate, uncompleteTask);

export default taskRouter;
