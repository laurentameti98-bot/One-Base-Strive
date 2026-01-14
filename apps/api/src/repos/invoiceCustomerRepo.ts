import { randomUUID } from 'crypto';
import { getDb } from '../db/connection.js';
import type { InvoiceCustomerRow } from '../types/database.js';

interface CreateInvoiceCustomerData {
  accountId?: string;
  name: string;
  email?: string;
  phone?: string;
  vatId?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingPostalCode?: string;
  billingCity?: string;
  billingCountry?: string;
}

interface UpdateInvoiceCustomerData {
  accountId?: string;
  name?: string;
  email?: string;
  phone?: string;
  vatId?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingPostalCode?: string;
  billingCity?: string;
  billingCountry?: string;
}

function rowToCustomer(row: InvoiceCustomerRow) {
  return {
    id: row.id,
    orgId: row.org_id,
    accountId: row.account_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    vatId: row.vat_id,
    billingAddressLine1: row.billing_address_line1,
    billingAddressLine2: row.billing_address_line2,
    billingPostalCode: row.billing_postal_code,
    billingCity: row.billing_city,
    billingCountry: row.billing_country,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listInvoiceCustomers(orgId: string, search?: string) {
  const db = getDb();
  let query = 'SELECT * FROM invoice_customers WHERE org_id = ?';
  const params: unknown[] = [orgId];

  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY name ASC';

  const rows = db.prepare(query).all(...params) as InvoiceCustomerRow[];
  return rows.map(rowToCustomer);
}

export function getInvoiceCustomerById(orgId: string, id: string) {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM invoice_customers WHERE org_id = ? AND id = ?')
    .get(orgId, id) as InvoiceCustomerRow | undefined;

  return row ? rowToCustomer(row) : null;
}

export function createInvoiceCustomer(orgId: string, data: CreateInvoiceCustomerData) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO invoice_customers (
      id, org_id, account_id, name, email, phone, vat_id,
      billing_address_line1, billing_address_line2, billing_postal_code,
      billing_city, billing_country, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    data.accountId || null,
    data.name,
    data.email || null,
    data.phone || null,
    data.vatId || null,
    data.billingAddressLine1 || null,
    data.billingAddressLine2 || null,
    data.billingPostalCode || null,
    data.billingCity || null,
    data.billingCountry || null,
    now,
    now
  );

  return getInvoiceCustomerById(orgId, id)!;
}

export function updateInvoiceCustomer(
  orgId: string,
  id: string,
  data: UpdateInvoiceCustomerData
) {
  const db = getDb();
  const now = new Date().toISOString();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.accountId !== undefined) {
    updates.push('account_id = ?');
    values.push(data.accountId || null);
  }
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.email !== undefined) {
    updates.push('email = ?');
    values.push(data.email || null);
  }
  if (data.phone !== undefined) {
    updates.push('phone = ?');
    values.push(data.phone || null);
  }
  if (data.vatId !== undefined) {
    updates.push('vat_id = ?');
    values.push(data.vatId || null);
  }
  if (data.billingAddressLine1 !== undefined) {
    updates.push('billing_address_line1 = ?');
    values.push(data.billingAddressLine1 || null);
  }
  if (data.billingAddressLine2 !== undefined) {
    updates.push('billing_address_line2 = ?');
    values.push(data.billingAddressLine2 || null);
  }
  if (data.billingPostalCode !== undefined) {
    updates.push('billing_postal_code = ?');
    values.push(data.billingPostalCode || null);
  }
  if (data.billingCity !== undefined) {
    updates.push('billing_city = ?');
    values.push(data.billingCity || null);
  }
  if (data.billingCountry !== undefined) {
    updates.push('billing_country = ?');
    values.push(data.billingCountry || null);
  }

  if (updates.length === 0) {
    return getInvoiceCustomerById(orgId, id);
  }

  updates.push('updated_at = ?');
  values.push(now, orgId, id);

  db.prepare(
    `UPDATE invoice_customers SET ${updates.join(', ')} WHERE org_id = ? AND id = ?`
  ).run(...values);

  return getInvoiceCustomerById(orgId, id);
}

export function deleteInvoiceCustomer(orgId: string, id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM invoice_customers WHERE org_id = ? AND id = ?').run(orgId, id);
  return result.changes > 0;
}
