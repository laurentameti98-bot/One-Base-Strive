import { FastifyInstance } from 'fastify';
import {
  CreateAccountSchema,
  UpdateAccountSchema,
  ErrorCode,
} from '@one-base/shared';
import * as accountsRepo from '../repos/accountsRepo.js';
import { requireUser } from '../middleware/auth.js';

export async function accountsRoutes(fastify: FastifyInstance) {
  // List accounts
  fastify.get('/accounts', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { search, limit, offset } = request.query as {
        search?: string;
        limit?: string;
        offset?: string;
      };

      const accounts = accountsRepo.listAccounts(request.user!.orgId, {
        search,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return reply.send({
        data: accounts.map(accountsRepo.accountRowToAccount),
      });
    } catch (error) {
      console.error('List accounts error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to list accounts',
        },
      });
    }
  });

  // Get account by ID
  fastify.get('/accounts/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const account = accountsRepo.getAccountById(request.user!.orgId, id);

      if (!account) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Account not found',
          },
        });
      }

      return reply.send({
        data: accountsRepo.accountRowToAccount(account),
      });
    } catch (error) {
      console.error('Get account error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to get account',
        },
      });
    }
  });

  // Create account
  fastify.post('/accounts', { preHandler: requireUser }, async (request, reply) => {
    try {
      const data = CreateAccountSchema.parse(request.body);
      const account = accountsRepo.createAccount(request.user!.orgId, data);

      return reply.status(201).send({
        data: accountsRepo.accountRowToAccount(account),
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

      console.error('Create account error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to create account',
        },
      });
    }
  });

  // Update account
  fastify.patch('/accounts/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = UpdateAccountSchema.parse(request.body);
      
      const account = accountsRepo.updateAccount(request.user!.orgId, id, data);

      if (!account) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Account not found',
          },
        });
      }

      return reply.send({
        data: accountsRepo.accountRowToAccount(account),
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

      console.error('Update account error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to update account',
        },
      });
    }
  });

  // Delete account
  fastify.delete('/accounts/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = accountsRepo.deleteAccount(request.user!.orgId, id);

      if (!deleted) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Account not found',
          },
        });
      }

      return reply.status(204).send();
    } catch (error) {
      console.error('Delete account error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to delete account',
        },
      });
    }
  });
}
