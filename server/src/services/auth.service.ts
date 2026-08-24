import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import prisma from '../config/prisma.js';
import { RegisterInput, LoginInput, AuthResponse, SafeUser, JwtPayload } from '../types/auth.types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'forge_default_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

export class UserAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message: string = 'Invalid email or password.') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export class UserNotFoundError extends Error {
  constructor(message: string = 'User not found.') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

/**
 * Strips sensitive fields like passwordHash from the User object
 */
export const toSafeUser = (user: User): SafeUser => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Generates a signed JWT token containing userId and email
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Registers a new user with hashed password and generates a JWT token
 */
export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1. Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new UserAlreadyExistsError(`A user with email '${normalizedEmail}' already exists.`);
  }

  // 2. Hash password with bcrypt
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  // 3. Save new user to database
  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: input.name?.trim() || null,
    },
  });

  // 4. Generate JWT
  const token = generateToken({
    userId: newUser.id,
    email: newUser.email,
  });

  return {
    user: toSafeUser(newUser),
    token,
  };
};

/**
 * Authenticates user credentials and returns safe user data with a JWT token
 */
export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  // 2. Verify password with bcrypt
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  // 3. Generate JWT
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user: toSafeUser(user),
    token,
  };
};

/**
 * Retrieves a user by their ID from PostgreSQL and returns safe user information
 */
export const getUserById = async (userId: string): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new UserNotFoundError(`User with ID '${userId}' was not found.`);
  }

  return toSafeUser(user);
};
