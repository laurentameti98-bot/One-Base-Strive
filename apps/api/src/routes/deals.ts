import { FastifyInstance } from 'fastify';
import {
  CreateDealSchema,
  UpdateDealSchema,
  ErrorCode,
} from '@one-base/shared';
import * as dealsRepo from '../repos/dealsRepo.js';
import * as dealStageRepo from '../repos/dealStageRepo.js';
import { requireUser } from '../middleware/auth.js';

export async function dealsRoutes(fastify: FastifyInstance) {
  // List deal stages
  fastify.get('/deal-stages', { preHandler: requireUser }, async (request, reply) => {
    try {
      const stages = dealStageRepo.getDealStagesByOrgId(request.user!.orgId);

      return reply.send({
        data: stages.map(dealStageRepo.dealStageRowToDealStage),
      });
    } catch (error) {
      console.error('List deal stages error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to list deal stages',
        },
      });
    }
  });

  // List deals
  fastify.get('/deals', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { search, stage_id, account_id, limit, offset } = request.query as {
        search?: string;
        stage_id?: string;
        account_id?: string;
        limit?: string;
        offset?: string;
      };

      const deals = dealsRepo.listDeals(request.user!.orgId, {
        search,
        stageId: stage_id,
        accountId: account_id,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return reply.send({
        data: deals.map(dealsRepo.dealRowToDeal),
      });
    } catch (error) {
      console.error('List deals error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to list deals',
        },
      });
    }
  });

  // Get deal by ID
  fastify.get('/deals/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const deal = dealsRepo.getDealById(request.user!.orgId, id);

      if (!deal) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Deal not found',
          },
        });
      }

      return reply.send({
        data: dealsRepo.dealRowToDeal(deal),
      });
    } catch (error) {
      console.error('Get deal error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to get deal',
        },
      });
    }
  });

  // Create deal
  fastify.post('/deals', { preHandler: requireUser }, async (request, reply) => {
    try {
      const data = CreateDealSchema.parse(request.body);
      const deal = dealsRepo.createDeal(request.user!.orgId, data);

      return reply.status(201).send({
        data: dealsRepo.dealRowToDeal(deal),
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

      console.error('Create deal error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to create deal',
        },
      });
    }
  });

  // Update deal
  fastify.patch('/deals/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = UpdateDealSchema.parse(request.body);
      
      const deal = dealsRepo.updateDeal(request.user!.orgId, id, data);

      if (!deal) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Deal not found',
          },
        });
      }

      return reply.send({
        data: dealsRepo.dealRowToDeal(deal),
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

      console.error('Update deal error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to update deal',
        },
      });
    }
  });

  // Delete deal
  fastify.delete('/deals/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = dealsRepo.deleteDeal(request.user!.orgId, id);

      if (!deleted) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Deal not found',
          },
        });
      }

      return reply.status(204).send();
    } catch (error) {
      console.error('Delete deal error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to delete deal',
        },
      });
    }
  });
}
