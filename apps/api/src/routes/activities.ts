import { FastifyInstance } from 'fastify';
import {
  CreateActivitySchema,
  UpdateActivitySchema,
  ErrorCode,
} from '@one-base/shared';
import * as activitiesRepo from '../repos/activitiesRepo.js';
import { requireUser } from '../middleware/auth.js';

export async function activitiesRoutes(fastify: FastifyInstance) {
  // List activities
  fastify.get('/activities', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { account_id, contact_id, deal_id, limit, offset } = request.query as {
        account_id?: string;
        contact_id?: string;
        deal_id?: string;
        limit?: string;
        offset?: string;
      };

      const activities = activitiesRepo.listActivities(request.user!.orgId, {
        accountId: account_id,
        contactId: contact_id,
        dealId: deal_id,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      });

      return reply.send({
        data: activities.map(activitiesRepo.activityRowToActivity),
      });
    } catch (error) {
      console.error('List activities error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to list activities',
        },
      });
    }
  });

  // Get activity by ID
  fastify.get('/activities/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const activity = activitiesRepo.getActivityById(request.user!.orgId, id);

      if (!activity) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Activity not found',
          },
        });
      }

      return reply.send({
        data: activitiesRepo.activityRowToActivity(activity),
      });
    } catch (error) {
      console.error('Get activity error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to get activity',
        },
      });
    }
  });

  // Create activity
  fastify.post('/activities', { preHandler: requireUser }, async (request, reply) => {
    try {
      const data = CreateActivitySchema.parse(request.body);
      // created_by_user_id is set from current user, not from client
      const activity = activitiesRepo.createActivity(
        request.user!.orgId,
        request.user!.id,
        data
      );

      return reply.status(201).send({
        data: activitiesRepo.activityRowToActivity(activity),
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

      console.error('Create activity error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to create activity',
        },
      });
    }
  });

  // Update activity
  fastify.patch('/activities/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = UpdateActivitySchema.parse(request.body);
      
      const activity = activitiesRepo.updateActivity(request.user!.orgId, id, data);

      if (!activity) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Activity not found',
          },
        });
      }

      return reply.send({
        data: activitiesRepo.activityRowToActivity(activity),
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

      console.error('Update activity error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to update activity',
        },
      });
    }
  });

  // Delete activity
  fastify.delete('/activities/:id', { preHandler: requireUser }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const deleted = activitiesRepo.deleteActivity(request.user!.orgId, id);

      if (!deleted) {
        return reply.status(404).send({
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Activity not found',
          },
        });
      }

      return reply.status(204).send();
    } catch (error) {
      console.error('Delete activity error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to delete activity',
        },
      });
    }
  });
}
