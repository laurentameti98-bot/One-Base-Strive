import { FastifyInstance } from 'fastify';
import {
  CreateContactSchema,
  UpdateContactSchema,
  ErrorCode,
} from '@one-base/shared';
import * as contactsRepo from '../repos/contactsRepo.js';
import { requireUser } from '../middleware/auth.js';

export async function contactsRoutes(fastify: FastifyInstance) {
  // List contacts
  fastify.get('/contacts', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { search, account_id, limit, offset } = request.query as {
        search?: string;
        account_id?: string;
        limit?: string;
        offset?: string;
      };

      const contacts = contactsRepo.listContacts(request.user!.orgId, {
        search,
        accountId: account_id,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return reply.send({
        data: contacts.map(contactsRepo.contactRowToContact),
      });
    } catch (error) {
      console.error('List contacts error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to list contacts',
        },
      });
    }
  });

  // Get contact by ID
  fastify.get('/contacts/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const contact = contactsRepo.getContactById(request.user!.orgId, id);

      if (!contact) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Contact not found',
          },
        });
      }

      return reply.send({
        data: contactsRepo.contactRowToContact(contact),
      });
    } catch (error) {
      console.error('Get contact error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to get contact',
        },
      });
    }
  });

  // Create contact
  fastify.post('/contacts', { preHandler: requireUser }, async (request, reply) => {
    try {
      const data = CreateContactSchema.parse(request.body);
      const contact = contactsRepo.createContact(request.user!.orgId, data);

      return reply.status(201).send({
        data: contactsRepo.contactRowToContact(contact),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Validation failed',
            details: error,
          },
        });
      }

      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(400).send({
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: error.message,
          },
        });
      }

      console.error('Create contact error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to create contact',
        },
      });
    }
  });

  // Update contact
  fastify.patch('/contacts/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = UpdateContactSchema.parse(request.body);
      
      const contact = contactsRepo.updateContact(request.user!.orgId, id, data);

      if (!contact) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Contact not found',
          },
        });
      }

      return reply.send({
        data: contactsRepo.contactRowToContact(contact),
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return reply.status(400).send({
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: 'Validation failed',
            details: error,
          },
        });
      }

      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(400).send({
          error: {
            code: ErrorCode.VALIDATION_ERROR,
            message: error.message,
          },
        });
      }

      console.error('Update contact error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to update contact',
        },
      });
    }
  });

  // Delete contact
  fastify.delete('/contacts/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = contactsRepo.deleteContact(request.user!.orgId, id);

      if (!deleted) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Contact not found',
          },
        });
      }

      return reply.status(204).send();
    } catch (error) {
      console.error('Delete contact error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to delete contact',
        },
      });
    }
  });
}
