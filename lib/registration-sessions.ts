import { randomUUID } from 'crypto';
import type { RowDataPacket } from 'mysql2';
import { getPool } from './db';
import { generateOtp } from './otp';

const SESSION_TTL_MINUTES = 15;

export interface RegistrationSession {
  id: string;
  phone: string;
  otp_code: string;
  otp_verified: boolean;
  expires_at: Date;
  created_at: Date;
}

function rowToSession(row: RowDataPacket): RegistrationSession {
  return {
    id: String(row.id),
    phone: String(row.phone),
    otp_code: String(row.otp_code),
    otp_verified: Boolean(row.otp_verified),
    expires_at: row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at),
    created_at: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
  };
}

export async function createRegistrationSession(phone: string): Promise<RegistrationSession> {
  const pool = getPool();
  const id = randomUUID();
  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);

  await pool.execute(
    `INSERT INTO rb_registration_sessions (id, phone, otp_code, expires_at)
     VALUES (?, ?, ?, ?)`,
    [id, phone, otpCode, expiresAt],
  );

  const session = await getRegistrationSession(id);
  if (!session) {
    throw new Error('Failed to create registration session');
  }

  return session;
}

export async function getRegistrationSession(id: string): Promise<RegistrationSession | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM rb_registration_sessions
     WHERE id = ? AND expires_at > NOW()
     LIMIT 1`,
    [id],
  );

  const row = rows[0];
  return row ? rowToSession(row) : null;
}

export async function markRegistrationSessionVerified(id: string): Promise<void> {
  const pool = getPool();
  await pool.execute(
    'UPDATE rb_registration_sessions SET otp_verified = 1 WHERE id = ?',
    [id],
  );
}

export async function deleteRegistrationSession(id: string): Promise<void> {
  const pool = getPool();
  await pool.execute('DELETE FROM rb_registration_sessions WHERE id = ?', [id]);
}

export function logOtpForDev(phone: string, otp: string): void {
  console.log(`[otp] ${phone}: ${otp} (dev — use ${process.env.DEV_OTP ?? '000000'} if overridden)`);
}
