import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getPool(): mysql.Pool {
  if (!pool) {
    const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
    pool = mysql.createPool({
      host: requireEnv('DB_HOST'),
      port: Number.isFinite(port) ? port : 3306,
      database: requireEnv('DB_NAME'),
      user: requireEnv('DB_USER'),
      password: requireEnv('DB_PASSWORD'),
      waitForConnections: true,
      connectionLimit: process.env.VERCEL ? 2 : 10,
      charset: 'utf8mb4',
    });
  }
  return pool;
}
