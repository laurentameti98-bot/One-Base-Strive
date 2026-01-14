import 'dotenv/config';
import { runMigrations, closeDb } from '../db/connection.js';

console.log('🔄 Running database migrations...');

try {
  // getDb() called by runMigrations() ensures directory exists
  runMigrations();
  console.log('✅ Migrations completed successfully');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  closeDb();
}
