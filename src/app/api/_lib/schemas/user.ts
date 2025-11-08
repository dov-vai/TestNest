import { z } from 'zod';

export const userSchema = z.object({
  id: z.number().int(),
  email: z.email(),
  name: z.string().nullable(),
  role: z.enum(['user', 'admin']),
  isActive: z.boolean(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export const userListSchema = z.array(userSchema);

export const adminUserUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.email().optional(),
  role: z.enum(['user', 'admin']).optional(),
  isActive: z.boolean().optional(),
});

export type UserSchema = z.infer<typeof userSchema>;
export type AdminUserUpdateSchema = z.infer<typeof adminUserUpdateSchema>;
