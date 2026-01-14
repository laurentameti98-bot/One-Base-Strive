import { randomUUID } from 'crypto';
import { getDb } from '../db/connection.js';
import type { InvoiceItemRow } from '../types/database.js';

interface CreateInvoiceItemData {
  invoiceId: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  taxRateBps: number;
  lineTotalCents: number;
  sortOrder: number;
}

function rowToItem(row: InvoiceItemRow) {
  return {
    id: row.id,
    orgId: row.org_id,
    invoiceId: row.invoice_id,
    description: row.description,
    quantity: row.quantity,
    unitPriceCents: row.unit_price_cents,
    taxRateBps: row.tax_rate_bps,
    lineTotalCents: row.line_total_cents,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listInvoiceItems(orgId: string, invoiceId: string) {
  const db = getDb();
  const rows = db
    .prepare(
      'SELECT * FROM invoice_items WHERE org_id = ? AND invoice_id = ? ORDER BY sort_order ASC'
    )
    .all(orgId, invoiceId) as InvoiceItemRow[];

  return rows.map(rowToItem);
}

export function createInvoiceItem(orgId: string, data: CreateInvoiceItemData) {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO invoice_items (
      id, org_id, invoice_id, description, quantity, unit_price_cents,
      tax_rate_bps, line_total_cents, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    orgId,
    data.invoiceId,
    data.description,
    data.quantity,
    data.unitPriceCents,
    data.taxRateBps,
    data.lineTotalCents,
    data.sortOrder,
    now,
    now
  );

  return id;
}

export function deleteInvoiceItemsByInvoiceId(orgId: string, invoiceId: string) {
  const db = getDb();
  db.prepare('DELETE FROM invoice_items WHERE org_id = ? AND invoice_id = ?').run(
    orgId,
    invoiceId
  );
}
