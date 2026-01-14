import { FastifyInstance } from 'fastify';
import { HealthResponse } from '@one-base/shared';

export async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/health', async (_request, reply) => {
    const response: HealthResponse = {
      data: {
        ok: true,
        timestamp: new Date().toISOString(),
      },
    };
    return reply.send(response);
  });
}
