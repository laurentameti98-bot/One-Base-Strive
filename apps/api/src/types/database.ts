// Database row types (internal to backend)
export interface OrgRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  org_id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'member';
  is_active: number; // SQLite boolean (0 or 1)
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface DealStageRow {
  id: string;
  org_id: string;
  name: string;
  sort_order: number;
  is_closed: number; // SQLite boolean (0 or 1)
  created_at: string;
  updated_at: string;
}

export interface AccountRow {
  id: string;
  org_id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactRow {
  id: string;
  org_id: string;
  account_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface DealRow {
  id: string;
  org_id: string;
  account_id: string;
  primary_contact_id: string | null;
  stage_id: string;
  name: string;
  amount_cents: number;
  currency: string;
  expected_close_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityRow {
  id: string;
  org_id: string;
  type: string;
  subject: string | null;
  body: string | null;
  occurred_at: string | null;
  account_id: string | null;
  contact_id: string | null;
  deal_id: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

// ERP: Invoice Customers
export interface InvoiceCustomerRow {
  id: string;
  org_id: string;
  account_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  vat_id: string | null;
  billing_address_line1: string | null;
  billing_address_line2: string | null;
  billing_postal_code: string | null;
  billing_city: string | null;
  billing_country: string | null;
  created_at: string;
  updated_at: string;
}

// ERP: Invoices
export interface InvoiceRow {
  id: string;
  org_id: string;
  customer_id: string;
  invoice_number: string;
  status: string;
  currency: string;
  issue_date: string;
  due_date: string | null;
  notes: string | null;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  created_at: string;
  updated_at: string;
}

// ERP: Invoice Items
export interface InvoiceItemRow {
  id: string;
  org_id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  tax_rate_bps: number;
  line_total_cents: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
