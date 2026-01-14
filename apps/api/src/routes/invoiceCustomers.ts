import { FastifyInstance } from 'fastify';
import { requireUser } from '../middleware/auth.js';
import * as invoiceCustomerRepo from '../repos/invoiceCustomerRepo.js';
import {
  CreateInvoiceCustomerSchema,
  UpdateInvoiceCustomerSchema,
} from '@one-base/shared';

export async function invoiceCustomersRoutes(app: FastifyInstance) {
  // List invoice customers
  app.get('/invoice-customers', { preHandler: requireUser }, async (request) => {
    const { search } = request.query as { search?: string };
    const customers = invoiceCustomerRepo.listInvoiceCustomers(request.user!.orgId, search);

    return { data: customers };
  });

  // Get invoice customer by ID
  app.get('/invoice-customers/:id', { preHandler: requireUser }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const customer = invoiceCustomerRepo.getInvoiceCustomerById(request.user!.orgId, id);

    if (!customer) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Invoice customer not found',
        },
      });
    }

    return { data: customer };
  });

  // Create invoice customer
  app.post('/invoice-customers', { preHandler: requireUser }, async (request, reply) => {
    const result = CreateInvoiceCustomerSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.errors,
        },
      });
    }

    const customer = invoiceCustomerRepo.createInvoiceCustomer(
      request.user!.orgId,
      result.data
    );

    return reply.code(201).send({ data: customer });
  });

  // Update invoice customer
  app.patch('/invoice-customers/:id', { preHandler: requireUser }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = UpdateInvoiceCustomerSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.errors,
        },
      });
    }

    const customer = invoiceCustomerRepo.updateInvoiceCustomer(
      request.user!.orgId,
      id,
      result.data
    );

    if (!customer) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Invoice customer not found',
        },
      });
    }

    return { data: customer };
  });

  // Delete invoice customer
  app.delete('/invoice-customers/:id', { preHandler: requireUser }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = invoiceCustomerRepo.deleteInvoiceCustomer(request.user!.orgId, id);

    if (!deleted) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Invoice customer not found',
        },
      });
    }

    return reply.code(204).send();
  });
}
