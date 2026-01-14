import 'dotenv/config';
import { getDb, closeDb } from '../db/connection.js';
import { createOrg } from '../repos/orgRepo.js';
import { createUser } from '../repos/userRepo.js';
import { createDealStage } from '../repos/dealStageRepo.js';
import { hashPassword } from '../services/authService.js';
import { UserRole } from '@one-base/shared';

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
    const stages = [
      { name: 'Lead', sortOrder: 1, isClosed: false },
      { name: 'Qualified', sortOrder: 2, isClosed: false },
      { name: 'Proposal', sortOrder: 3, isClosed: false },
      { name: 'Negotiation', sortOrder: 4, isClosed: false },
      { name: 'Won', sortOrder: 5, isClosed: true },
      { name: 'Lost', sortOrder: 6, isClosed: true },
    ];

    for (const stage of stages) {
      createDealStage({
        orgId: org.id,
        ...stage,
      });
      console.log(`  ✓ ${stage.name}`);
    }

    console.log('');
    console.log('✅ Seeding completed successfully!');
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
