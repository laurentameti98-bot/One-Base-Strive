import { z } from 'zod';
import { DEFAULT_CURRENCY } from '../constants.js';

// Deal Stage Schema (for listing stages)
export const DealStageSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string(),
  sortOrder: z.number(),
  isClosed: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type DealStage = z.infer<typeof DealStageSchema>;

// Create Deal Schema
export const CreateDealSchema = z.object({
  accountId: z.string().uuid('Invalid account ID'),
  primaryContactId: z.string().uuid('Invalid contact ID').optional(),
  stageId: z.string().uuid('Invalid stage ID'),
  name: z.string().min(1, 'Deal name is required'),
  amountCents: z.number().int().min(0, 'Amount must be positive').default(0),
  currency: z.string().length(3, 'Currency must be 3 letters').default(DEFAULT_CURRENCY),
  expectedCloseDate: z.string().optional(), // ISO date string
});

export type CreateDealRequest = z.infer<typeof CreateDealSchema>;

// Update Deal Schema
export const UpdateDealSchema = CreateDealSchema.partial();

export type UpdateDealRequest = z.infer<typeof UpdateDealSchema>;

// Deal Response Schema
export const DealSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  accountId: z.string().uuid(),
  primaryContactId: z.string().uuid().nullable(),
  stageId: z.string().uuid(),
  name: z.string(),
  amountCents: z.number(),
  currency: z.string(),
  expectedCloseDate: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Deal = z.infer<typeof DealSchema>;

// API Response Schemas
export const DealResponseSchema = z.object({
  data: DealSchema,
});

export type DealResponse = z.infer<typeof DealResponseSchema>;

export const DealsResponseSchema = z.object({
  data: z.array(DealSchema),
});

export type DealsResponse = z.infer<typeof DealsResponseSchema>;

export const DealStageResponseSchema = z.object({
  data: DealStageSchema,
});

export type DealStageResponse = z.infer<typeof DealStageResponseSchema>;

export const DealStagesResponseSchema = z.object({
  data: z.array(DealStageSchema),
});

export type DealStagesResponse = z.infer<typeof DealStagesResponseSchema>;
