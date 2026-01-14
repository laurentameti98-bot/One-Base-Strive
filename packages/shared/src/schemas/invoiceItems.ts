import { z } from 'zod';

// Create Invoice Item Schema (used when creating/updating invoice)
export const CreateInvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  unitPriceCents: z.number().int().min(0, 'Unit price must be positive').default(0),
  taxRateBps: z.number().int().min(0).max(10000, 'Tax rate must be between 0-100%').default(0),
  sortOrder: z.number().int().min(0).default(1),
});

export type CreateInvoiceItemRequest = z.infer<typeof CreateInvoiceItemSchema>;

// Update Invoice Item Schema
export const UpdateInvoiceItemSchema = CreateInvoiceItemSchema.partial();

export type UpdateInvoiceItemRequest = z.infer<typeof UpdateInvoiceItemSchema>;

// Invoice Item Response Schema
export const InvoiceItemSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  description: z.string(),
  quantity: z.number(),
  unitPriceCents: z.number(),
  taxRateBps: z.number(),
  lineTotalCents: z.number(),
  sortOrder: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>;

// API Response Schemas
export const InvoiceItemResponseSchema = z.object({
  data: InvoiceItemSchema,
});

export type InvoiceItemResponse = z.infer<typeof InvoiceItemResponseSchema>;

export const InvoiceItemsResponseSchema = z.object({
  data: z.array(InvoiceItemSchema),
});

export type InvoiceItemsResponse = z.infer<typeof InvoiceItemsResponseSchema>;
