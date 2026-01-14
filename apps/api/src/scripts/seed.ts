import 'dotenv/config';
import { getDb, closeDb } from '../db/connection.js';
import { createOrg } from '../repos/orgRepo.js';
import { createUser } from '../repos/userRepo.js';
import { createDealStage } from '../repos/dealStageRepo.js';
import { createAccount } from '../repos/accountsRepo.js';
import { createContact } from '../repos/contactsRepo.js';
import { createDeal } from '../repos/dealsRepo.js';
import { createActivity } from '../repos/activitiesRepo.js';
import { createInvoiceCustomer } from '../repos/invoiceCustomerRepo.js';
import * as invoiceService from '../services/invoiceService.js';
import { hashPassword } from '../services/authService.js';
import { UserRole, InvoiceStatus, ActivityType } from '@one-base/shared';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    const db = getDb();

    // Check if already seeded
    const existingOrg = db.prepare('SELECT * FROM orgs LIMIT 1').get();
    if (existingOrg) {
      console.log('⚠️  Database already seeded. Skipping...');
      return;
    }

    // Create demo organization
    console.log('Creating demo organization...');
    const org = createOrg('Demo Org');

    // Create admin user
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@demo.com';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';

    console.log('Creating admin user...');
    const passwordHash = await hashPassword(adminPassword);
    const adminUser = createUser({
      orgId: org.id,
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
    });

    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create default deal stages
    console.log('Creating default deal stages...');
    const stageData = [
      { name: 'Lead', sortOrder: 1, isClosed: false },
      { name: 'Qualified', sortOrder: 2, isClosed: false },
      { name: 'Proposal', sortOrder: 3, isClosed: false },
      { name: 'Negotiation', sortOrder: 4, isClosed: false },
      { name: 'Won', sortOrder: 5, isClosed: true },
      { name: 'Lost', sortOrder: 6, isClosed: true },
    ];

    const createdStages = stageData.map((stage) => {
      const created = createDealStage({
        orgId: org.id,
        ...stage,
      });
      console.log(`  ✓ ${stage.name}`);
      return created;
    });

    // Create demo accounts
    console.log('Creating demo accounts...');
    const accounts = [
      { name: 'Acme Corp', industry: 'Technology', website: 'https://acme.example.com', phone: '+1-555-0101' },
      { name: 'TechStart Inc', industry: 'Software', website: 'https://techstart.example.com', phone: '+1-555-0102' },
      { name: 'Global Solutions', industry: 'Consulting', website: 'https://globalsol.example.com', phone: '+1-555-0103' },
      { name: 'InnovateCo', industry: 'Innovation', website: 'https://innovate.example.com', phone: '+1-555-0104' },
      { name: 'Enterprise Systems', industry: 'Enterprise Software', phone: '+1-555-0105' },
    ];

    const createdAccounts = accounts.map((acc) => {
      const created = createAccount(org.id, acc);
      console.log(`  ✓ ${acc.name}`);
      return created;
    });

    // Create demo contacts
    console.log('Creating demo contacts...');
    const contacts = [
      { firstName: 'John', lastName: 'Smith', email: 'john.smith@acme.example.com', title: 'CEO', accountId: createdAccounts[0].id },
      { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@acme.example.com', title: 'CTO', accountId: createdAccounts[0].id },
      { firstName: 'Mike', lastName: 'Williams', email: 'mike@techstart.example.com', title: 'Founder', accountId: createdAccounts[1].id },
      { firstName: 'Emily', lastName: 'Brown', email: 'emily.brown@techstart.example.com', title: 'VP Sales', accountId: createdAccounts[1].id },
      { firstName: 'David', lastName: 'Lee', email: 'david.lee@globalsol.example.com', title: 'Director', accountId: createdAccounts[2].id },
      { firstName: 'Lisa', lastName: 'Chen', email: 'lisa@innovate.example.com', title: 'Product Manager', accountId: createdAccounts[3].id },
      { firstName: 'Robert', lastName: 'Taylor', email: 'robert.t@enterprise.example.com', title: 'VP Engineering', accountId: createdAccounts[4].id },
      { firstName: 'Jennifer', lastName: 'Martinez', email: 'jennifer@acme.example.com', title: 'Marketing Director', accountId: createdAccounts[0].id },
      { firstName: 'Thomas', lastName: 'Anderson', email: 'thomas.a@techstart.example.com', title: 'Developer', accountId: createdAccounts[1].id },
      { firstName: 'Maria', lastName: 'Garcia', title: 'Consultant' },
    ];

    const createdContacts = contacts.map((contact) => {
      const created = createContact(org.id, contact);
      console.log(`  ✓ ${contact.firstName} ${contact.lastName}`);
      return created;
    });

    // Create demo deals
    console.log('Creating demo deals...');
    const deals = [
      { name: 'Acme Enterprise License', accountId: createdAccounts[0].id, primaryContactId: createdContacts[0].id, stageId: createdStages[2].id, amountCents: 5000000, currency: 'EUR', expectedCloseDate: '2026-03-15' },
      { name: 'TechStart Platform Migration', accountId: createdAccounts[1].id, primaryContactId: createdContacts[2].id, stageId: createdStages[1].id, amountCents: 2500000, currency: 'EUR', expectedCloseDate: '2026-02-28' },
      { name: 'Global Solutions Consulting', accountId: createdAccounts[2].id, primaryContactId: createdContacts[4].id, stageId: createdStages[0].id, amountCents: 7500000, currency: 'EUR' },
      { name: 'InnovateCo Product Suite', accountId: createdAccounts[3].id, primaryContactId: createdContacts[5].id, stageId: createdStages[3].id, amountCents: 3000000, currency: 'EUR', expectedCloseDate: '2026-04-01' },
      { name: 'Enterprise Integration', accountId: createdAccounts[4].id, primaryContactId: createdContacts[6].id, stageId: createdStages[1].id, amountCents: 4500000, currency: 'EUR' },
      { name: 'Acme Support Contract', accountId: createdAccounts[0].id, stageId: createdStages[4].id, amountCents: 1200000, currency: 'EUR', expectedCloseDate: '2026-01-31' },
      { name: 'TechStart Starter Plan', accountId: createdAccounts[1].id, stageId: createdStages[5].id, amountCents: 500000, currency: 'EUR' },
      { name: 'Global Expansion Project', accountId: createdAccounts[2].id, stageId: createdStages[2].id, amountCents: 10000000, currency: 'EUR', expectedCloseDate: '2026-06-30' },
    ];

    const createdDeals = deals.map((deal) => {
      const created = createDeal(org.id, deal);
      console.log(`  ✓ ${deal.name}`);
      return created;
    });

    // Create demo activities
    console.log('Creating demo activities...');
    const activities = [
      { type: ActivityType.NOTE, subject: 'Initial contact', body: 'Reached out to discuss enterprise needs', accountId: createdAccounts[0].id, contactId: createdContacts[0].id, occurredAt: '2026-01-10T10:00:00Z' },
      { type: ActivityType.CALL, subject: 'Discovery call', body: 'Discussed requirements and timeline', dealId: createdDeals[0].id, contactId: createdContacts[0].id, occurredAt: '2026-01-11T14:30:00Z' },
      { type: ActivityType.MEETING, subject: 'Product demo', body: 'Presented platform capabilities', accountId: createdAccounts[1].id, dealId: createdDeals[1].id, occurredAt: '2026-01-12T11:00:00Z' },
      { type: ActivityType.NOTE, subject: 'Follow-up required', body: 'Need to send proposal by end of week', dealId: createdDeals[2].id, occurredAt: '2026-01-13T09:00:00Z' },
      { type: ActivityType.CALL, subject: 'Technical discussion', body: 'Reviewed integration requirements', contactId: createdContacts[5].id, dealId: createdDeals[3].id, occurredAt: '2026-01-13T15:00:00Z' },
      { type: ActivityType.MEETING, subject: 'Contract negotiation', body: 'Discussed terms and pricing', dealId: createdDeals[3].id, contactId: createdContacts[5].id, occurredAt: '2026-01-14T10:00:00Z' },
      { type: ActivityType.NOTE, subject: 'Won deal!', body: 'Contract signed and executed', dealId: createdDeals[5].id, occurredAt: '2026-01-14T16:00:00Z' },
      { type: ActivityType.NOTE, subject: 'Lost to competitor', body: 'They went with alternative solution', dealId: createdDeals[6].id, occurredAt: '2026-01-13T17:00:00Z' },
      { type: ActivityType.CALL, subject: 'Check-in call', body: 'Quarterly business review scheduled', accountId: createdAccounts[0].id, contactId: createdContacts[1].id, occurredAt: '2026-01-12T13:00:00Z' },
      { type: ActivityType.NOTE, subject: 'Referral received', body: 'Contact mentioned interest in our services', accountId: createdAccounts[3].id, occurredAt: '2026-01-11T12:00:00Z' },
      { type: ActivityType.MEETING, subject: 'Stakeholder meeting', body: 'Met with decision makers', accountId: createdAccounts[2].id, contactId: createdContacts[4].id, dealId: createdDeals[7].id, occurredAt: '2026-01-10T14:00:00Z' },
      { type: ActivityType.CALL, subject: 'Budget discussion', body: 'Confirmed budget allocation for Q1', dealId: createdDeals[4].id, occurredAt: '2026-01-12T10:30:00Z' },
      { type: ActivityType.NOTE, subject: 'Decision postponed', body: 'Waiting for board approval next month', dealId: createdDeals[2].id, occurredAt: '2026-01-14T11:00:00Z' },
      { type: ActivityType.MEETING, subject: 'Implementation kickoff', body: 'Project kickoff meeting completed', dealId: createdDeals[5].id, occurredAt: '2026-01-15T09:00:00Z' },
      { type: ActivityType.CALL, subject: 'Support inquiry', body: 'Answered questions about features', accountId: createdAccounts[4].id, contactId: createdContacts[6].id, occurredAt: '2026-01-13T14:00:00Z' },
    ];

    for (const activity of activities) {
      createActivity(org.id, adminUser.id, activity);
      console.log(`  ✓ ${activity.type}: ${activity.subject}`);
    }

    console.log('');
    console.log('✅ CRM Seeding completed successfully!');
    console.log('');
    console.log('📊 Created:');
    console.log(`   ${createdAccounts.length} accounts`);
    console.log(`   ${createdContacts.length} contacts`);
    console.log(`   ${createdDeals.length} deals`);
    console.log(`   ${activities.length} activities`);

    // ============================================
    // ERP: Invoice Seeding (Idempotent)
    // ============================================
    console.log('');
    console.log('🧾 Seeding ERP data...');

    // Check if ERP already seeded
    const existingInvoice = db.prepare('SELECT * FROM invoices LIMIT 1').get();
    if (existingInvoice) {
      console.log('⚠️  ERP data already seeded. Skipping...');
    } else {
      // Create invoice customers
      console.log('Creating invoice customers...');
      const customer1 = createInvoiceCustomer(org.id, {
        accountId: createdAccounts[0].id, // Link to Acme Corp
        name: 'Acme Corp Billing',
        email: 'billing@acme.example.com',
        phone: '+1-555-0101',
        vatId: 'US123456789',
        billingAddressLine1: '123 Tech Street',
        billingCity: 'San Francisco',
        billingPostalCode: '94102',
        billingCountry: 'US',
      });
      console.log(`  ✓ ${customer1.name}`);

      const customer2 = createInvoiceCustomer(org.id, {
        accountId: createdAccounts[1].id, // Link to TechStart Inc
        name: 'TechStart Inc',
        email: 'accounts@techstart.example.com',
        phone: '+1-555-0102',
        billingAddressLine1: '456 Innovation Ave',
        billingCity: 'Austin',
        billingPostalCode: '78701',
        billingCountry: 'US',
      });
      console.log(`  ✓ ${customer2.name}`);

      const customer3 = createInvoiceCustomer(org.id, {
        name: 'Standalone Customer LLC',
        email: 'finance@standalone.example.com',
        phone: '+1-555-0199',
        vatId: 'US987654321',
        billingAddressLine1: '789 Business Blvd',
        billingCity: 'New York',
        billingPostalCode: '10001',
        billingCountry: 'US',
      });
      console.log(`  ✓ ${customer3.name}`);

      // Create invoices with items
      console.log('Creating invoices...');

      // Invoice 1: PAID
      const invoice1 = await invoiceService.createInvoiceWithItems(org.id, {
        customerId: customer1.id,
        status: InvoiceStatus.PAID,
        currency: 'EUR',
        issueDate: '2026-01-01',
        dueDate: '2026-01-31',
        notes: 'Q4 2025 consulting services',
        items: [
          {
            description: 'Strategy Consulting (20 hours)',
            quantity: 20,
            unitPriceCents: 15000, // €150/hour
            taxRateBps: 1900, // 19%
            sortOrder: 1,
          },
          {
            description: 'Technical Implementation',
            quantity: 1,
            unitPriceCents: 500000, // €5000
            taxRateBps: 1900,
            sortOrder: 2,
          },
          {
            description: 'Training & Documentation',
            quantity: 1,
            unitPriceCents: 200000, // €2000
            taxRateBps: 1900,
            sortOrder: 3,
          },
        ],
      });
      console.log(`  ✓ ${invoice1.invoiceNumber} (${invoice1.status})`);

      // Invoice 2: SENT (awaiting payment)
      const invoice2 = await invoiceService.createInvoiceWithItems(org.id, {
        customerId: customer2.id,
        status: InvoiceStatus.SENT,
        currency: 'EUR',
        issueDate: '2026-01-10',
        dueDate: '2026-02-10',
        notes: 'Monthly platform subscription',
        items: [
          {
            description: 'Platform License (Monthly)',
            quantity: 1,
            unitPriceCents: 99900, // €999
            taxRateBps: 1900,
            sortOrder: 1,
          },
          {
            description: 'Premium Support',
            quantity: 1,
            unitPriceCents: 29900, // €299
            taxRateBps: 1900,
            sortOrder: 2,
          },
        ],
      });
      console.log(`  ✓ ${invoice2.invoiceNumber} (${invoice2.status})`);

      // Invoice 3: DRAFT
      const invoice3 = await invoiceService.createInvoiceWithItems(org.id, {
        customerId: customer3.id,
        status: InvoiceStatus.DRAFT,
        currency: 'EUR',
        issueDate: '2026-01-14',
        dueDate: '2026-02-14',
        notes: 'Pending approval',
        items: [
          {
            description: 'Custom Development Work',
            quantity: 40,
            unitPriceCents: 12000, // €120/hour
            taxRateBps: 1900,
            sortOrder: 1,
          },
          {
            description: 'Project Management',
            quantity: 10,
            unitPriceCents: 10000, // €100/hour
            taxRateBps: 1900,
            sortOrder: 2,
          },
          {
            description: 'Testing & QA',
            quantity: 15,
            unitPriceCents: 8000, // €80/hour
            taxRateBps: 1900,
            sortOrder: 3,
          },
          {
            description: 'Deployment & Monitoring',
            quantity: 1,
            unitPriceCents: 150000, // €1500
            taxRateBps: 1900,
            sortOrder: 4,
          },
        ],
      });
      console.log(`  ✓ ${invoice3.invoiceNumber} (${invoice3.status})`);

      // Invoice 4: VOID (cancelled)
      const invoice4 = await invoiceService.createInvoiceWithItems(org.id, {
        customerId: customer1.id,
        status: InvoiceStatus.VOID,
        currency: 'EUR',
        issueDate: '2025-12-15',
        dueDate: '2026-01-15',
        notes: 'Cancelled - project scope changed',
        items: [
          {
            description: 'Initial Consultation (Cancelled)',
            quantity: 5,
            unitPriceCents: 20000, // €200/hour
            taxRateBps: 1900,
            sortOrder: 1,
          },
          {
            description: 'Preliminary Analysis (Cancelled)',
            quantity: 1,
            unitPriceCents: 100000, // €1000
            taxRateBps: 1900,
            sortOrder: 2,
          },
        ],
      });
      console.log(`  ✓ ${invoice4.invoiceNumber} (${invoice4.status})`);

      console.log('');
      console.log('✅ ERP Seeding completed!');
      console.log('');
      console.log('💰 Created:');
      console.log(`   3 invoice customers`);
      console.log(`   4 invoices (paid/sent/draft/void)`);
      console.log(`   ${invoice1.items.length + invoice2.items.length + invoice3.items.length + invoice4.items.length} invoice items`);
    }

    console.log('');
    console.log('🔐 Login credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    closeDb();
  }
}

seed();
