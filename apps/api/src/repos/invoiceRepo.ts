import { randomUUID } from 'crypto';
import { getDb } from '../db/connection.js';
import type { InvoiceRow } from '../types/database.js';

interface CreateInvoiceData {
  customerId: string;
  invoiceNumber: string;
  status: string;
  currency: string;
  issueDate: string;
  dueDate?: string;
  notes?: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

interface UpdateInvoiceData {
  customerId?: string;
  invoiceNumber?: string;
  status?: string;
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  subtotalCents?: number;
  taxCents?: number;
  totalCents?: number;
}

function rowToInvoice(row: InvoiceRow) {
  return {
    id: row.id,
    orgId: row.org_id,
    customerId: row.customer_id,
    invoiceNumber: row.invoice_number,
    status: row.status,
    currency: row.currency,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    notes: row.notes,
    subtotalCents: row.subtotal_cents,
    taxCents: row.tax_cents,
    totalCents: row.total_cents,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listInvoices(
  orgId: string,
  filters?: {
    search?: string;
    status?: string;
    customerId?: string;
  }
) {
  const db = getDb();
  let query = `
    SELECT 
      i.*,
      ic.name as customer_name,
      ic.email as customer_email
    FROM invoices i
    LEFT JOIN invoice_customers ic ON i.customer_id = ic.id AND ic.org_id = i.org_id
    WHERE i.org_id = ?
  `;
  const params: unknown[] = [orgId];

  if (filters?.status) {
    query += ' AND i.status = ?';
    params.push(filters.status);
  }

  if (filters?.customerId) {
    query += ' AND i.customer_id = ?';
    params.push(filters.customerId);
  }

  if (filters?.search) {
    query += ' AND (i.invoice_number LIKE ? OR i.notes LIKE ? OR ic.name LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY i.issue_date DESC, i.invoice_number DESC';

  type InvoiceWithCustomer = InvoiceRow & { customer_name?: string; customer_email?: string };
  const rows = db.prepare(query).all(...params) as InvoiceWithCustomer[];
  return rows.map((row) => ({
    ...rowToInvoice(row),
    customerName: row.customer_name || null,
    customerEmail: row.customer_email || null,
  }));
}

export function getInvoiceById(orgId: string, id: string) {
  const db = getDb();
  const row = db
    .prepare(`
      SELECT 
        i.*,
        ic.name as customer_name,
        ic.email as customer_email
      FROM invoices i
      LEFT JOIN invoice_customers ic ON i.customer_id = ic.id AND ic.org_id = i.org_id
      WHERE i.org_id = ? AND i.id = ?
    `)
    .get(orgId, id) as (InvoiceRow & { customer_name?: string; customer_email?: string }) | undefined;

  if (!row) return null;

  return {
    ...rowToInvoice(row as InvoiceRow),
    customerName: row.customer_name || null,
    customerEmail: row.customer_email || null,
  };
}

export function getInvoiceByNumber(orgId: string, invoiceNumber: string) {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM invoices WHERE org_id = ? AND invoice_number = ?')
    .get(orgId, invoiceNumber) as InvoiceRow | undefined;

  return row ? rowToInvoice(row) : null;
}

export function createInvoice(orgId: string, data: CreateInvoiceData) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO invoices (
      id, org_id, customer_id, invoice_number, status, currency,
      issue_date, due_date, notes, subtotal_cents, tax_cents, total_cents,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    data.customerId,
    data.invoiceNumber,
    data.status,
    data.currency,
    data.issueDate,
    data.dueDate || null,
    data.notes || null,
    data.subtotalCents,
    data.taxCents,
    data.totalCents,
    now,
    now
  );

  return getInvoiceById(orgId, id)!;
}

export function updateInvoice(orgId: string, id: string, data: UpdateInvoiceData) {
  const db = getDb();
  const now = new Date().toISOString();

  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.customerId !== undefined) {
    updates.push('customer_id = ?');
    values.push(data.customerId);
  }
  if (data.invoiceNumber !== undefined) {
    updates.push('invoice_number = ?');
    values.push(data.invoiceNumber);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (data.currency !== undefined) {
    updates.push('currency = ?');
    values.push(data.currency);
  }
  if (data.issueDate !== undefined) {
    updates.push('issue_date = ?');
    values.push(data.issueDate);
  }
  if (data.dueDate !== undefined) {
    updates.push('due_date = ?');
    values.push(data.dueDate || null);
  }
  if (data.notes !== undefined) {
    updates.push('notes = ?');
    values.push(data.notes || null);
  }
  if (data.subtotalCents !== undefined) {
    updates.push('subtotal_cents = ?');
    values.push(data.subtotalCents);
  }
  if (data.taxCents !== undefined) {
    updates.push('tax_cents = ?');
    values.push(data.taxCents);
  }
  if (data.totalCents !== undefined) {
    updates.push('total_cents = ?');
    values.push(data.totalCents);
  }

  if (updates.length === 0) {
    return getInvoiceById(orgId, id);
  }

  updates.push('updated_at = ?');
  values.push(now, orgId, id);

  db.prepare(`UPDATE invoices SET ${updates.join(', ')} WHERE org_id = ? AND id = ?`).run(
    ...values
  );

  return getInvoiceById(orgId, id);
}

export function deleteInvoice(orgId: string, id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM invoices WHERE org_id = ? AND id = ?').run(orgId, id);
  return result.changes > 0;
}

// Helper: Generate next invoice number for the org
export function generateInvoiceNumber(orgId: string): string {
  const db = getDb();
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  // Find the highest number for this year
  const lastInvoice = db
    .prepare(
      `SELECT invoice_number FROM invoices
       WHERE org_id = ? AND invoice_number LIKE ?
       ORDER BY invoice_number DESC LIMIT 1`
    )
    .get(orgId, `${prefix}%`) as { invoice_number: string } | undefined;

  if (!lastInvoice) {
    return `${prefix}0001`;
  }

  // Extract number and increment
  const match = lastInvoice.invoice_number.match(/(\d+)$/);
  const lastNumber = match ? parseInt(match[1], 10) : 0;
  const nextNumber = lastNumber + 1;

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}
