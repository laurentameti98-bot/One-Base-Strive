import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Single source of truth for DB path
    const dbPath =
      process.env.STRIVE_DB_PATH ?? join(__dirname, '..', '..', 'data', 'strive.db');
    const resolvedPath = resolve(dbPath);

    // Ensure directory exists
    const dbDir = dirname(resolvedPath);
    mkdirSync(dbDir, { recursive: true });

    // Log DB path on first connection
    console.log(`📂 Using database: ${resolvedPath}`);

    db = new Database(resolvedPath);
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

  // Run initial schema first (creates migrations table)
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  database.exec(schema);

  // Record initial migration
  const initialMigration = '001_initial_schema';
  const existingInitial = database
    .prepare('SELECT name FROM migrations WHERE name = ?')
    .get(initialMigration);

  if (!existingInitial) {
    database.prepare('INSERT INTO migrations (name) VALUES (?)').run(initialMigration);
    console.log(`✅ Migration applied: ${initialMigration}`);
  } else {
    console.log(`⏭️  Migration already applied: ${initialMigration}`);
  }

  // Run additional migrations from migrations directory
  const migrationsDir = join(__dirname, 'migrations');
  const migrationFiles = ['002_crm_tables.sql', '003_erp_invoicing.sql']; // Add more as needed

  for (const file of migrationFiles) {
    const migrationPath = join(migrationsDir, file);
    const migrationName = file.replace('.sql', '');

    const existing = database
      .prepare('SELECT name FROM migrations WHERE name = ?')
      .get(migrationName);

    if (!existing) {
      const migrationSql = readFileSync(migrationPath, 'utf-8');
      database.exec(migrationSql);
      database.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
      console.log(`✅ Migration applied: ${migrationName}`);
    } else {
      console.log(`⏭️  Migration already applied: ${migrationName}`);
    }
  }
}
