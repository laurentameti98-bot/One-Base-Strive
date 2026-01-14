import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createTestApp, loginAsAdmin } from './helpers.js';

describe('ERP API', () => {
  let app: FastifyInstance;
  let cookie: string;

  beforeAll(async () => {
    app = await createTestApp();
    cookie = await loginAsAdmin(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/invoices returns data[] and every item has customerName', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/invoices',
      headers: {
        cookie,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    // Every invoice should have customerName property (nullable is ok)
    for (const invoice of body.data) {
      expect(invoice).toHaveProperty('customerName');
      expect(invoice).toHaveProperty('invoiceNumber');
      expect(invoice).toHaveProperty('status');
      expect(invoice).toHaveProperty('totalCents');
    }
  });

  it('GET /api/v1/invoices/:id returns invoice + items and includes customerName', async () => {
    // First get the list to find an invoice ID
    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/invoices',
      headers: {
        cookie,
      },
    });

    const listBody = JSON.parse(listResponse.body);
    expect(listBody.data.length).toBeGreaterThan(0);
    
    const firstInvoiceId = listBody.data[0].id;

    // Get single invoice
    const detailResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/invoices/${firstInvoiceId}`,
      headers: {
        cookie,
      },
    });

    expect(detailResponse.statusCode).toBe(200);
    const detailBody = JSON.parse(detailResponse.body);
    expect(detailBody).toHaveProperty('data');
    
    // Check invoice has required fields
    expect(detailBody.data).toHaveProperty('id');
    expect(detailBody.data).toHaveProperty('customerName');
    expect(detailBody.data).toHaveProperty('invoiceNumber');
    expect(detailBody.data).toHaveProperty('items');
    expect(Array.isArray(detailBody.data.items)).toBe(true);
  });
});
