import { z } from 'zod';
import { UserRole } from '../constants.js';

// Request Schemas
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// User Schema (public fields only)
export const UserSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum([UserRole.ADMIN, UserRole.MEMBER]),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// Auth Response Schemas
export const LoginResponseSchema = z.object({
  data: z.object({
    user: UserSchema,
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const MeResponseSchema = z.object({
  data: z.object({
    user: UserSchema,
  }),
});

export type MeResponse = z.infer<typeof MeResponseSchema>;
