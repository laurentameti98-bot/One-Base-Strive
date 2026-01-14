import { FastifyInstance } from 'fastify';
import { LoginRequestSchema, LoginResponse, MeResponse, ErrorCode } from '@one-base/shared';
import * as authService from '../services/authService.js';
import { requireUser } from '../middleware/auth.js';

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export async function authRoutes(fastify: FastifyInstance) {
  // POST /api/v1/auth/login
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const body = LoginRequestSchema.parse(request.body);
      const result = await authService.login(body.email, body.password);

      if (!result) {
        return reply.status(401).send({
          error: {
            code: ErrorCode.AUTH_INVALID,
            message: 'Invalid email or password',
          },
        });
      }

      // Set httpOnly cookie
      reply.setCookie('session_token', result.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
      });

      const response: LoginResponse = {
        data: {
          user: result.user,
        },
      };

      return reply.send(response);
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

      console.error('Login error:', error);
      return reply.status(500).send({
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Internal server error',
        },
      });
    }
  });

  // POST /api/v1/auth/logout
  fastify.post('/auth/logout', async (request, reply) => {
    const token = request.cookies.session_token;
    if (token) {
      authService.logout(token);
    }

    reply.clearCookie('session_token', { path: '/' });

    return reply.send({ data: { success: true } });
  });

  // GET /api/v1/auth/me
  fastify.get('/auth/me', { preHandler: requireUser }, async (request, reply) => {
    const response: MeResponse = {
      data: {
        user: request.user!,
      },
    };

    return reply.send(response);
  });
}
