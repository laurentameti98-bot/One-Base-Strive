import { z } from 'zod';
import { InvoiceStatus, DEFAULT_CURRENCY } from '../constants.js';
import { CreateInvoiceItemSchema, InvoiceItemSchema } from './invoiceItems.js';

// Create Invoice Schema
export const CreateInvoiceSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  invoiceNumber: z.string().optional(), // Auto-generated if not provided
  status: z.nativeEnum(InvoiceStatus).default(InvoiceStatus.DRAFT),
  currency: z.string().length(3, 'Currency must be 3 letters').default(DEFAULT_CURRENCY),
  issueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid issue date'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid due date').optional(),
  notes: z.string().optional(),
  items: z.array(CreateInvoiceItemSchema).min(1, 'At least one item is required'),
});

export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceSchema>;

// Update Invoice Schema
export const UpdateInvoiceSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  invoiceNumber: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  currency: z.string().length(3, 'Currency must be 3 letters').optional(),
  issueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid issue date').optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid due date').optional(),
  notes: z.string().optional(),
  items: z.array(CreateInvoiceItemSchema).optional(),
});

export type UpdateInvoiceRequest = z.infer<typeof UpdateInvoiceSchema>;

// Invoice Response Schema (without items for list view)
export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  customerId: z.string().uuid(),
  invoiceNumber: z.string(),
  status: z.nativeEnum(InvoiceStatus),
  currency: z.string(),
  issueDate: z.string(),
  dueDate: z.string().nullable(),
  notes: z.string().nullable(),
  subtotalCents: z.number(),
  taxCents: z.number(),
  totalCents: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Additional fields for list view (from JOIN with invoice_customers)
  customerName: z.string().nullable(),
  customerEmail: z.string().nullable(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

// Invoice with items (for detail view)
export const InvoiceWithItemsSchema = InvoiceSchema.extend({
  items: z.array(InvoiceItemSchema),
});

export type InvoiceWithItems = z.infer<typeof InvoiceWithItemsSchema>;

// API Response Schemas
export const InvoiceResponseSchema = z.object({
  data: InvoiceWithItemsSchema,
});

export type InvoiceResponse = z.infer<typeof InvoiceResponseSchema>;

export const InvoicesResponseSchema = z.object({
  data: z.array(InvoiceSchema),
});

export type InvoicesResponse = z.infer<typeof InvoicesResponseSchema>;
