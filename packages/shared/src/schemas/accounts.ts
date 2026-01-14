import { z } from 'zod';

// Create Account Schema
export const CreateAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  industry: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateAccountRequest = z.infer<typeof CreateAccountSchema>;

// Update Account Schema
export const UpdateAccountSchema = CreateAccountSchema.partial();

export type UpdateAccountRequest = z.infer<typeof UpdateAccountSchema>;

// Account Response Schema
export const AccountSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string(),
  industry: z.string().nullable(),
  website: z.string().nullable(),
  phone: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Account = z.infer<typeof AccountSchema>;
