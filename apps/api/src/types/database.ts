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
