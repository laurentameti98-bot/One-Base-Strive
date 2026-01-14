import { z } from 'zod';
import { ErrorCode } from '../constants.js';

// API Response Wrappers
export const SuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.nativeEnum(ErrorCode),
    message: z.string(),
    details: z.record(z.any()).optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Health Check
export const HealthResponseSchema = z.object({
  data: z.object({
    ok: z.boolean(),
    timestamp: z.string().datetime(),
  }),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
