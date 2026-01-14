import { z } from 'zod';
import { ActivityType } from '../constants.js';

// Create Activity Schema
export const CreateActivitySchema = z.object({
  type: z.enum([ActivityType.NOTE, ActivityType.CALL, ActivityType.MEETING]),
  subject: z.string().optional(),
  body: z.string().optional(),
  occurredAt: z.string().datetime().optional(), // ISO datetime string
  accountId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
});

export type CreateActivityRequest = z.infer<typeof CreateActivitySchema>;

// Update Activity Schema
export const UpdateActivitySchema = CreateActivitySchema.partial();

export type UpdateActivityRequest = z.infer<typeof UpdateActivitySchema>;

// Activity Response Schema
export const ActivitySchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  type: z.string(),
  subject: z.string().nullable(),
  body: z.string().nullable(),
  occurredAt: z.string().nullable(),
  accountId: z.string().uuid().nullable(),
  contactId: z.string().uuid().nullable(),
  dealId: z.string().uuid().nullable(),
  createdByUserId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Activity = z.infer<typeof ActivitySchema>;
