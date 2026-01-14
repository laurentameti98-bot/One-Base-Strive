import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createTestApp, extractSessionToken } from './helpers.js';

describe('Auth API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/login returns 200 and sets cookie', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'admin@demo.com',
        password: 'admin123',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('user');
    expect(body.data.user.email).toBe('admin@demo.com');

    // Check cookie is set
    const setCookie = response.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('session_token=');
  });

  it('GET /api/v1/auth/me with cookie returns 200', async () => {
    // First login
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'admin@demo.com',
        password: 'admin123',
      },
    });

    const cookie = extractSessionToken(loginResponse.headers['set-cookie']!);

    // Then call /me
    const meResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        cookie,
      },
    });

    expect(meResponse.statusCode).toBe(200);
    const body = JSON.parse(meResponse.body);
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('user');
    expect(body.data.user.email).toBe('admin@demo.com');
  });

  it('POST /api/v1/auth/logout works and then /auth/me returns 401', async () => {
    // First login
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'admin@demo.com',
        password: 'admin123',
      },
    });

    const cookie = extractSessionToken(loginResponse.headers['set-cookie']!);

    // Logout
    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: {
        cookie,
      },
    });

    expect(logoutResponse.statusCode).toBe(200);

    // Try to access /me - should fail
    const meResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        cookie,
      },
    });

    expect(meResponse.statusCode).toBe(401);
  });
});
