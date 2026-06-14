import type { RowDataPacket } from 'mysql2/promise';
import { getPool } from './db';

export interface EmailVerification {
  member_id: number;
  token: string | null;
  sent_at: Date;
  verified_at: Date | null;
}

function rowToVerification(row: RowDataPacket): EmailVerification {
  return {
    member_id: Number(row.member_id),
    token: row.token ? String(row.token) : null,
    sent_at: row.sent_at instanceof Date ? row.sent_at : new Date(row.sent_at),
    verified_at: row.verified_at
      ? row.verified_at instanceof Date
        ? row.verified_at
        : new Date(row.verified_at)
      : null,
  };
}

export async function isMemberEmailVerified(memberId: number): Promise<boolean> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT verified_at FROM rb_email_verifications
     WHERE member_id = ? AND verified_at IS NOT NULL
     LIMIT 1`,
    [memberId],
  );
  return rows.length > 0;
}

export async function createEmailVerification(
  memberId: number,
  token: string,
): Promise<void> {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO rb_email_verifications (member_id, token, sent_at)
     VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE token = VALUES(token), sent_at = NOW(), verified_at = NULL`,
    [memberId, token],
  );
}

export async function findMemberIdByVerificationToken(
  token: string,
): Promise<number | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT member_id FROM rb_email_verifications
     WHERE token = ? AND verified_at IS NULL
     LIMIT 1`,
    [token],
  );
  return rows[0] ? Number(rows[0].member_id) : null;
}

export async function findVerifiedMemberIdByToken(
  token: string,
): Promise<number | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT member_id FROM rb_email_verifications
     WHERE token = ? AND verified_at IS NOT NULL
     LIMIT 1`,
    [token],
  );
  return rows[0] ? Number(rows[0].member_id) : null;
}

export async function markEmailVerified(memberId: number): Promise<void> {
  const pool = getPool();
  await pool.execute(
    `UPDATE rb_email_verifications
     SET verified_at = NOW()
     WHERE member_id = ?`,
    [memberId],
  );
}

/** Mark verified when Google (or another IdP) confirms email ownership. */
export async function ensureMemberEmailVerified(memberId: number): Promise<void> {
  if (await isMemberEmailVerified(memberId)) return;

  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT member_id FROM rb_email_verifications WHERE member_id = ? LIMIT 1',
    [memberId],
  );

  if (rows.length > 0) {
    await markEmailVerified(memberId);
    return;
  }

  await pool.execute(
    `INSERT INTO rb_email_verifications (member_id, token, sent_at, verified_at)
     VALUES (?, NULL, NOW(), NOW())`,
    [memberId],
  );
}

export async function getEmailVerification(
  memberId: number,
): Promise<EmailVerification | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM rb_email_verifications WHERE member_id = ? LIMIT 1',
    [memberId],
  );
  const row = rows[0];
  return row ? rowToVerification(row) : null;
}
