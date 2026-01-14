-- Migration 003: ERP Invoicing Tables
-- Sprint 2: Minimal invoicing module

-- Invoice Customers
CREATE TABLE IF NOT EXISTS invoice_customers (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  account_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  vat_id TEXT,
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_postal_code TEXT,
  billing_city TEXT,
  billing_country TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_invoice_customers_org_name ON invoice_customers(org_id, name);
CREATE INDEX IF NOT EXISTS idx_invoice_customers_org_account ON invoice_customers(org_id, account_id);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  currency TEXT NOT NULL DEFAULT 'EUR',
  issue_date TEXT NOT NULL,
  due_date TEXT,
  notes TEXT,
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES invoice_customers(id) ON DELETE CASCADE,
  UNIQUE(org_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_org_issue_date ON invoices(org_id, issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_org_status ON invoices(org_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_org_customer ON invoices(org_id, customer_id);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  invoice_id TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL DEFAULT 0,
  tax_rate_bps INTEGER NOT NULL DEFAULT 0,
  line_total_cents INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_org_invoice ON invoice_items(org_id, invoice_id);
