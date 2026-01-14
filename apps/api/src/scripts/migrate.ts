import 'dotenv/config';
import { runMigrations, closeDb } from '../db/connection.js';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

console.log('🔄 Running database migrations...');

try {
  // Ensure data directory exists
  const dbPath = process.env.DATABASE_URL || './data/strive.db';
  const dbDir = dirname(dbPath);
  mkdirSync(dbDir, { recursive: true });

  runMigrations();
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  closeDb();
}
