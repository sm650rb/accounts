#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACC_ROOT = path.join(__dirname, '..');

const BENIGN_MYSQL_ERRNO = new Set([
  1050, // ER_TABLE_EXISTS
  1054, // ER_BAD_FIELD_ERROR (optional column/data migrations)
  1060, // ER_DUP_FIELDNAME
  1061, // ER_DUP_KEYNAME
  1091, // ER_CANT_DROP_FIELD_OR_KEY (column already dropped)
]);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    value = value.replace(/\\(.)/g, '$1');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function findMigrationsDir() {
  const candidates = [
    path.join(ACC_ROOT, 'sql', 'migrations'),
    path.join(process.cwd(), 'sql', 'migrations'),
    path.join(process.cwd(), 'acc', 'sql', 'migrations'),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }

  throw new Error(`Migrations directory not found. Tried: ${candidates.join(', ')}`);
}

function listMigrationFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

function parseSqlFile(content) {
  const withoutComments = content
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  return withoutComments
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function ensureMigrationsTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      id VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getAppliedMigrations(pool) {
  const [rows] = await pool.query('SELECT id FROM _schema_migrations');
  return new Set(rows.map((row) => String(row.id)));
}

async function markApplied(pool, id) {
  await pool.execute('INSERT INTO _schema_migrations (id) VALUES (?)', [id]);
}

async function executeMigrationFile(pool, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = parseSqlFile(sql);

  for (const statement of statements) {
    try {
      await pool.query(statement);
    } catch (err) {
      if (err.errno !== undefined && BENIGN_MYSQL_ERRNO.has(err.errno)) {
        console.warn(`[db] Skipped benign MySQL error ${err.errno} in ${path.basename(filePath)}`);
        continue;
      }
      throw err;
    }
  }
}

async function main() {
  if (process.env.SKIP_DB_MIGRATE === '1') {
    return;
  }

  loadEnvFile(path.join(ACC_ROOT, '.env.local'));
  loadEnvFile(path.join(ACC_ROOT, '.env'));
  loadEnvFile(path.join(process.cwd(), '.env'));

  const pool = mysql.createPool({
    host: requireEnv('DB_HOST'),
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    database: requireEnv('DB_NAME'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 2,
  });

  try {
    await ensureMigrationsTable(pool);
    const applied = await getAppliedMigrations(pool);
    const migrationsDir = findMigrationsDir();
    const files = listMigrationFiles(migrationsDir);

    for (const file of files) {
      const id = file.replace(/\.sql$/, '');
      if (applied.has(id)) continue;

      const filePath = path.join(migrationsDir, file);
      await executeMigrationFile(pool, filePath);
      await markApplied(pool, id);
      console.log(`[db] Applied migration ${id}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[db] Migration failed:', err.message);
  process.exit(1);
});
