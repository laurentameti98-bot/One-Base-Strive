import { z } from 'zod';

// Create Invoice Customer Schema
export const CreateInvoiceCustomerSchema = z.object({
  accountId: z.string().uuid('Invalid account ID').optional(),
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  vatId: z.string().optional(),
  billingAddressLine1: z.string().optional(),
  billingAddressLine2: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCity: z.string().optional(),
  billingCountry: z.string().optional(),
});

export type CreateInvoiceCustomerRequest = z.infer<typeof CreateInvoiceCustomerSchema>;

// Update Invoice Customer Schema
export const UpdateInvoiceCustomerSchema = CreateInvoiceCustomerSchema.partial();

export type UpdateInvoiceCustomerRequest = z.infer<typeof UpdateInvoiceCustomerSchema>;

// Invoice Customer Response Schema
export const InvoiceCustomerSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  accountId: z.string().uuid().nullable(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  vatId: z.string().nullable(),
  billingAddressLine1: z.string().nullable(),
  billingAddressLine2: z.string().nullable(),
  billingPostalCode: z.string().nullable(),
  billingCity: z.string().nullable(),
  billingCountry: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type InvoiceCustomer = z.infer<typeof InvoiceCustomerSchema>;

// API Response Schemas
export const InvoiceCustomerResponseSchema = z.object({
  data: InvoiceCustomerSchema,
});

export type InvoiceCustomerResponse = z.infer<typeof InvoiceCustomerResponseSchema>;

export const InvoiceCustomersResponseSchema = z.object({
  data: z.array(InvoiceCustomerSchema),
});

export type InvoiceCustomersResponse = z.infer<typeof InvoiceCustomersResponseSchema>;
