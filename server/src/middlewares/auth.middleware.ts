import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'forge_default_jwt_secret_key_change_in_production';

/**
 * Middleware to authenticate requests using JWT Bearer token.
 * Reads Authorization header, verifies the token, and attaches user data to req.user.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // 1. Check if Authorization header is provided with Bearer prefix
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'fail',
      message: 'Access denied. No valid Bearer token provided in Authorization header.',
    });
    return;
  }

  // 2. Extract token
  const token = authHeader.split(' ')[1];

  if (!token || token.trim() === '') {
    res.status(401).json({
      status: 'fail',
      message: 'Access denied. Token is missing.',
    });
    return;
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 4. Attach decoded user info to the request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'fail',
        message: 'Token has expired. Please log in again.',
      });
      return;
    }

    res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Authentication failed.',
    });
  }
};
