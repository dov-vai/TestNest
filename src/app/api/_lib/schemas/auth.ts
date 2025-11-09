import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export const userSchema = z.object({
  id: z.number(),
  email: z.email(),
  name: z.string().nullable(),
  role: z.enum(['user', 'admin']),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export const authResponseSchema = z.object({
  user: userSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const meResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    email: z.email(),
    name: z.string().nullable(),
    role: z.enum(['user', 'admin']),
    isActive: z.boolean(),
    createdAt: z.date(),
  }),
});
