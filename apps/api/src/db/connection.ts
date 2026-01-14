import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DATABASE_URL || './data/strive.db';
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function runMigrations(): void {
  const database = getDb();

  // Read and execute the schema
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  database.exec(schema);

  // Record migration
  const migrationName = '001_initial_schema';
  const existingMigration = database
    .prepare('SELECT name FROM migrations WHERE name = ?')
    .get(migrationName);

  if (!existingMigration) {
    database.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
    console.log(`✅ Migration applied: ${migrationName}`);
  } else {
    console.log(`⏭️  Migration already applied: ${migrationName}`);
  }
}
