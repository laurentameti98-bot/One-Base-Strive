-- Migration: 002_crm_tables
-- CRM Foundation Tables: accounts, contacts, deals, activities

-- Accounts (Companies)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  phone TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_accounts_org_name ON accounts(org_id, name);

-- Contacts (People)
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  account_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  title TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_org_last ON contacts(org_id, last_name);
CREATE INDEX IF NOT EXISTS idx_contacts_org_account ON contacts(org_id, account_id);

-- Deals (Pipeline Opportunities)
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  primary_contact_id TEXT,
  stage_id TEXT NOT NULL,
  name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  expected_close_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (primary_contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (stage_id) REFERENCES deal_stages(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_deals_org_stage ON deals(org_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_org_account ON deals(org_id, account_id);

-- Activities (Notes, Calls, Meetings)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('note', 'call', 'meeting')),
  subject TEXT,
  body TEXT,
  occurred_at TEXT,
  account_id TEXT,
  contact_id TEXT,
  deal_id TEXT,
  created_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (org_id) REFERENCES orgs(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activities_org_occurred ON activities(org_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_activities_org_account ON activities(org_id, account_id);
CREATE INDEX IF NOT EXISTS idx_activities_org_contact ON activities(org_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_org_deal ON activities(org_id, deal_id);
