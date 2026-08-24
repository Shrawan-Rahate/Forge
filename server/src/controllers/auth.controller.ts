import { Request, Response } from 'express';
import { validateRegisterInput, validateLoginInput } from '../validations/auth.validation.js';
import * as authService from '../services/auth.service.js';
import { UserAlreadyExistsError, InvalidCredentialsError, UserNotFoundError } from '../services/auth.service.js';
import { RegisterInput, LoginInput } from '../types/auth.types.js';

/**
 * Controller to handle POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate input
    const validation = validateRegisterInput(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    // 2. Delegate to auth service
    const result = await authService.register(req.body as RegisterInput);

    // 3. Return 201 Created with user info and JWT
    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof UserAlreadyExistsError) {
      res.status(409).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Auth Controller] Error during registration:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during user registration.',
    });
  }
};

/**
 * Controller to handle POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Validate input
    const validation = validateLoginInput(req.body);
    if (!validation.isValid) {
      res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    // 2. Delegate to auth service
    const result = await authService.login(req.body as LoginInput);

    // 3. Return 200 OK with user info and JWT
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error: unknown) {
    if (error instanceof InvalidCredentialsError) {
      res.status(401).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Auth Controller] Error during login:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred during login.',
    });
  }
};

/**
 * Controller to handle GET /api/v1/auth/me
 * Returns authenticated user profile using req.user.userId
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        status: 'fail',
        message: 'Authentication required. User not identified.',
      });
      return;
    }

    const user = await authService.getUserById(userId);

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error: unknown) {
    if (error instanceof UserNotFoundError) {
      res.status(404).json({
        status: 'fail',
        message: error.message,
      });
      return;
    }

    console.error('[Auth Controller] Error fetching current user:', error);
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while fetching user profile.',
    });
  }
};
