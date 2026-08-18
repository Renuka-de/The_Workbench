import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['VENDOR', 'CONTRACTOR', 'PROJECT_MANAGER'], {
    message: 'Role must be one of VENDOR, CONTRACTOR, or PROJECT_MANAGER',
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
