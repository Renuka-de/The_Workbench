import type { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, loginUser, getUserById } from '../services/authService.js';
import { registerSchema, loginSchema } from '../validators/auth.js';
import { successResponse, errorResponse } from '../utils/response.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(errorResponse(parsed.error.issues[0]?.message ?? 'Invalid registration data'));
    }

    const result = await registerUser(parsed.data);
    return res.status(201).json(successResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    const statusCode = message.includes('already exists') ? 409 : 500;
    return res.status(statusCode).json(errorResponse(message));
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(errorResponse(parsed.error.issues[0]?.message ?? 'Invalid login data'));
    }

    const result = await loginUser(parsed.data);
    return res.status(200).json(successResponse(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return res.status(400).json(errorResponse(message));
  }
};

export const me = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse('Authentication required'));
    }

    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    return res.status(200).json(successResponse({ user }));
  } catch (error) {
    return res.status(500).json(errorResponse('Failed to load current user'));
  }
};
