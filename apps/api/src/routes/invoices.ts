import { FastifyInstance } from 'fastify';
import { requireUser } from '../middleware/auth.js';
import * as invoiceRepo from '../repos/invoiceRepo.js';
import * as invoiceService from '../services/invoiceService.js';
import { CreateInvoiceSchema, UpdateInvoiceSchema } from '@one-base/shared';

export async function invoicesRoutes(app: FastifyInstance) {
  // List invoices
  app.get('/invoices', { preHandler: requireUser }, async (request) => {
    const { search, status, customer_id } = request.query as {
      search?: string;
      status?: string;
      customer_id?: string;
    };

    const invoices = invoiceRepo.listInvoices(request.user!.orgId, {
      search,
      status,
      customerId: customer_id,
    });

    return { data: invoices };
  });

  // Get invoice by ID (with items)
  app.get('/invoices/:id', { preHandler: requireUser }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const invoice = invoiceService.getInvoiceWithItems(request.user!.orgId, id);

    if (!invoice) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        },
      });
    }

    return { data: invoice };
  });

  // Create invoice (with items)
  app.post('/invoices', { preHandler: requireUser }, async (request, reply) => {
    const result = CreateInvoiceSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.errors,
        },
      });
    }

    try {
      const invoice = await invoiceService.createInvoiceWithItems(
        request.user!.orgId,
        result.data
      );

      return reply.code(201).send({ data: invoice });
    } catch (error: unknown) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  });

  // Update invoice (with items)
  app.patch('/invoices/:id', { preHandler: requireUser }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = UpdateInvoiceSchema.safeParse(request.body);

    if (!result.success) {
      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.errors,
        },
      });
    }

    try {
      const invoice = await invoiceService.updateInvoiceWithItems(
        request.user!.orgId,
        id,
        result.data
      );

      return { data: invoice };
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Invoice not found') {
        return reply.code(404).send({
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
      }

      return reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  });

  // Delete invoice
  app.delete('/invoices/:id', { preHandler: requireUser }, async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const deleted = invoiceService.deleteInvoiceWithItems(request.user!.orgId, id);

    if (!deleted) {
      return reply.code(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'Invoice not found',
        },
      });
    }

    return reply.code(204).send();
  });
}
