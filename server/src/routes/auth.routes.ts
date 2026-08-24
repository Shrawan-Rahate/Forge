import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const authRouter = Router();

// POST /api/v1/auth/register - Register a new user
authRouter.post('/register', register);

// POST /api/v1/auth/login - Login user and receive JWT
authRouter.post('/login', login);

// GET /api/v1/auth/me - Get currently authenticated user profile
authRouter.get('/me', authenticate, getMe);

export default authRouter;
