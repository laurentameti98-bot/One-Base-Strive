import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createTestApp, loginAsAdmin } from './helpers.js';

describe('CRM API', () => {
  let app: FastifyInstance;
  let cookie: string;

  beforeAll(async () => {
    app = await createTestApp();
    cookie = await loginAsAdmin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create, list, and update an account', async () => {
    // Create account
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/accounts',
      headers: {
        cookie,
        'content-type': 'application/json',
      },
      payload: {
        name: 'Test Account',
        industry: 'Technology',
        website: 'https://test.example.com',
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const createBody = JSON.parse(createResponse.body);
    expect(createBody).toHaveProperty('data');
    expect(createBody.data).toHaveProperty('name');
    expect(createBody.data.name).toBe('Test Account');

    const accountId = createBody.data.id;

    // List accounts - should contain our new account
    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/accounts',
      headers: {
        cookie,
      },
    });

    expect(listResponse.statusCode).toBe(200);
    const listBody = JSON.parse(listResponse.body);
    expect(listBody).toHaveProperty('data');
    expect(Array.isArray(listBody.data)).toBe(true);
    
    const testAccount = listBody.data.find((acc: { id: string }) => acc.id === accountId);
    expect(testAccount).toBeDefined();
    expect(testAccount.name).toBe('Test Account');

    // Update account
    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/accounts/${accountId}`,
      headers: {
        cookie,
        'content-type': 'application/json',
      },
      payload: {
        name: 'Updated Test Account',
      },
    });

    expect(updateResponse.statusCode).toBe(200);
    const updateBody = JSON.parse(updateResponse.body);
    expect(updateBody.data.name).toBe('Updated Test Account');
  });
});
