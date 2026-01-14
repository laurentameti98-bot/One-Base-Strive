import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDb, runMigrations, closeDb } from '../db/connection.js';
import * as orgRepo from '../repos/orgRepo.js';
import * as userRepo from '../repos/userRepo.js';
import * as dealStageRepo from '../repos/dealStageRepo.js';
import * as accountsRepo from '../repos/accountsRepo.js';
import * as invoiceCustomerRepo from '../repos/invoiceCustomerRepo.js';
import * as invoiceRepo from '../repos/invoiceRepo.js';
import * as invoiceItemRepo from '../repos/invoiceItemRepo.js';
import bcrypt from 'bcrypt';
import { UserRole } from '@one-base/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set test database path
const testDbPath = path.join(__dirname, '../../data/test.db');
process.env.STRIVE_DB_PATH = testDbPath;

export async function setup() {
  console.log('🧪 Setting up test database...');

  // Ensure data directory exists
  const dataDir = path.dirname(testDbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Remove existing test database
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  // Run migrations
  runMigrations();

  // Seed minimal test data
  getDb();
  
  // Create org
  const org = orgRepo.createOrg('Demo Organization');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  userRepo.createUser({
    orgId: org.id,
    email: 'admin@demo.com',
    passwordHash: hashedPassword,
    role: UserRole.ADMIN,
  });

  // Create deal stages
  dealStageRepo.createDealStage({ orgId: org.id, name: 'Lead', sortOrder: 1 });
  dealStageRepo.createDealStage({ orgId: org.id, name: 'Qualified', sortOrder: 2 });
  dealStageRepo.createDealStage({ orgId: org.id, name: 'Proposal', sortOrder: 3 });
  dealStageRepo.createDealStage({ orgId: org.id, name: 'Closed Won', sortOrder: 4 });

  // Create some test accounts
  const account1 = accountsRepo.createAccount(org.id, {
    name: 'Acme Corp',
    industry: 'Technology',
    website: 'https://acme.example.com',
  });

  // Create test invoice customer
  const customer1 = invoiceCustomerRepo.createInvoiceCustomer(org.id, {
    name: 'Acme Corp Billing',
    email: 'billing@acme.example.com',
    accountId: account1.id,
  });

  // Create test invoice
  const invoice1 = invoiceRepo.createInvoice(org.id, {
    customerId: customer1.id,
    invoiceNumber: 'INV-2026-0001',
    status: 'paid',
    currency: 'EUR',
    issueDate: '2026-01-01',
    dueDate: '2026-01-31',
    subtotalCents: 10000,
    taxCents: 1900,
    totalCents: 11900,
  });

  // Create invoice items
  invoiceItemRepo.createInvoiceItem(org.id, {
    invoiceId: invoice1.id,
    description: 'Professional Services',
    quantity: 1,
    unitPriceCents: 10000,
    taxRateBps: 1900,
    lineTotalCents: 11900,
    sortOrder: 1,
  });

  console.log('✅ Test database ready!');
}

export async function teardown() {
  console.log('🧹 Cleaning up test database...');
  closeDb();
}
