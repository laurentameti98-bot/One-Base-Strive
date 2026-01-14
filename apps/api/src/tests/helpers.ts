import Fastify, { FastifyInstance } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import { healthRoutes } from '../routes/health.js';
import { authRoutes } from '../routes/auth.js';
import { accountsRoutes } from '../routes/accounts.js';
import { contactsRoutes } from '../routes/contacts.js';
import { dealsRoutes } from '../routes/deals.js';
import { activitiesRoutes } from '../routes/activities.js';
import { invoiceCustomersRoutes } from '../routes/invoiceCustomers.js';
import { invoicesRoutes } from '../routes/invoices.js';

export async function createTestApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false, // Disable logging for tests
  });

  // Register plugins
  await app.register(fastifyCookie, {
    secret: 'test-secret',
  });

  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  // Register routes
  await app.register(healthRoutes, { prefix: '/api/v1' });
  await app.register(authRoutes, { prefix: '/api/v1' });
  await app.register(accountsRoutes, { prefix: '/api/v1' });
  await app.register(contactsRoutes, { prefix: '/api/v1' });
  await app.register(dealsRoutes, { prefix: '/api/v1' });
  await app.register(activitiesRoutes, { prefix: '/api/v1' });
  await app.register(invoiceCustomersRoutes, { prefix: '/api/v1' });
  await app.register(invoicesRoutes, { prefix: '/api/v1' });

  return app;
}

export async function loginAsAdmin(
  app: FastifyInstance
): Promise<string> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: {
      email: 'admin@demo.com',
      password: 'admin123',
    },
  });

  // Extract cookie from Set-Cookie header
  const setCookie = response.headers['set-cookie'];
  if (!setCookie) {
    throw new Error('No cookie returned from login');
  }

  // Parse cookie - it can be a string or array
  const cookieString = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = cookieString.match(/session_token=([^;]+)/);
  if (!match) {
    throw new Error('Could not extract session token from cookie');
  }

  return `session_token=${match[1]}`;
}

export function extractSessionToken(setCookieHeader: string | string[]): string {
  const cookieString = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
  const match = cookieString.match(/session_token=([^;]+)/);
  if (!match) {
    throw new Error('Could not extract session token');
  }
  return `session_token=${match[1]}`;
}
