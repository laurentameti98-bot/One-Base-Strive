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
