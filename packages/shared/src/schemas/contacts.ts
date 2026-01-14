import { z } from 'zod';

// Create Contact Schema
export const CreateContactSchema = z.object({
  accountId: z.string().uuid().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  title: z.string().optional(),
});

export type CreateContactRequest = z.infer<typeof CreateContactSchema>;

// Update Contact Schema
export const UpdateContactSchema = CreateContactSchema.partial();

export type UpdateContactRequest = z.infer<typeof UpdateContactSchema>;

// Contact Response Schema
export const ContactSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  accountId: z.string().uuid().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  title: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Contact = z.infer<typeof ContactSchema>;
