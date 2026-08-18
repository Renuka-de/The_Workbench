import type { ApiResponse } from '../types/auth.js';

export const successResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

export const errorResponse = (message: string): ApiResponse => ({
  success: false,
  message,
});
