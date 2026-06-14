import type { RowDataPacket } from 'mysql2';
import type { Member, MemberRow } from '@/types';
import { getPool } from './db';

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function memberPublic(row: MemberRow | RowDataPacket): Member {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone,
    blood_group: row.blood_group,
    bike_model: row.bike_model,
    bike_color: row.bike_color,
    bike_registration: row.bike_registration,
    emergency_contact_name: row.emergency_contact_name,
    emergency_contact_phone: row.emergency_contact_phone,
    membership_status: row.membership_status,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function findMemberByEmail(email: string): Promise<MemberRow | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM rb_members WHERE email = ? LIMIT 1',
    [email],
  );
  return (rows[0] as MemberRow | undefined) ?? null;
}

export async function findMemberByPhone(phone: string): Promise<MemberRow | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM rb_members WHERE phone = ? LIMIT 1',
    [phone],
  );
  return (rows[0] as MemberRow | undefined) ?? null;
}

export async function findMemberById(id: number): Promise<MemberRow | null> {
  const pool = getPool();
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM rb_members WHERE id = ? LIMIT 1',
    [id],
  );
  return (rows[0] as MemberRow | undefined) ?? null;
}

export async function createMember(input: {
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  bloodGroup: string | null;
  bikeColor: string | null;
  bikeRegistration: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
}): Promise<MemberRow> {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO rb_members (
      email, password_hash, full_name, phone, blood_group, bike_color, bike_registration,
      emergency_contact_name, emergency_contact_phone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.email,
      input.passwordHash,
      input.fullName,
      input.phone,
      input.bloodGroup,
      input.bikeColor,
      input.bikeRegistration,
      input.emergencyContactName,
      input.emergencyContactPhone,
    ],
  );

  const insertId = (result as { insertId: number }).insertId;
  const member = await findMemberById(insertId);
  if (!member) {
    throw new Error('Failed to load member after registration');
  }
  return member;
}

/** Verified sign-ups become active; `pending` is only pre-verification. */
export async function activateMemberIfPending(id: number): Promise<void> {
  const pool = getPool();
  await pool.execute(
    `UPDATE rb_members SET membership_status = 'active' WHERE id = ? AND membership_status = 'pending'`,
    [id],
  );
}

export async function updateMember(
  id: number,
  input: {
    fullName: string;
    phone: string | null;
    bloodGroup: string | null;
    bikeColor: string | null;
    bikeRegistration: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    passwordHash: string;
  },
): Promise<MemberRow> {
  const pool = getPool();
  await pool.execute(
    `UPDATE rb_members SET
      full_name = ?,
      phone = ?,
      blood_group = ?,
      bike_color = ?,
      bike_registration = ?,
      emergency_contact_name = ?,
      emergency_contact_phone = ?,
      password_hash = ?
     WHERE id = ?`,
    [
      input.fullName,
      input.phone,
      input.bloodGroup,
      input.bikeColor,
      input.bikeRegistration,
      input.emergencyContactName,
      input.emergencyContactPhone,
      input.passwordHash,
      id,
    ],
  );

  const member = await findMemberById(id);
  if (!member) {
    throw new Error('Failed to load member after update');
  }
  return member;
}

export function trimOrNull(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
