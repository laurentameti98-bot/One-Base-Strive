import { FastifyRequest, FastifyReply } from 'fastify';
import { User, ErrorCode } from '@one-base/shared';
import * as authService from '../services/authService.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

export async function requireUser(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies.session_token;

  if (!token) {
    return reply.status(401).send({
      error: {
        code: ErrorCode.AUTH_REQUIRED,
        message: 'Authentication required',
      },
    });
  }

  const user = authService.getUserBySessionToken(token);

  if (!user) {
    return reply.status(401).send({
      error: {
        code: ErrorCode.AUTH_REQUIRED,
        message: 'Invalid or expired session',
      },
    });
  }

  request.user = user;
}
