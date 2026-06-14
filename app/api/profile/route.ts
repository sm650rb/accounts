import bcrypt from 'bcryptjs';
import { getCurrentMember } from '@/lib/auth';
import { isValidBikeColor } from '@/lib/bike-colors';
import { isValidBloodGroup, normalizeBloodGroup } from '@/lib/blood-groups';
import { errorResponse, jsonResponse, readJson } from '@/lib/http';
import { normalizeOptionalIndianPhone } from '@/lib/phone';
import { findMemberById, memberPublic, trimOrNull, updateMember } from '@/lib/members';

export async function PUT(request: Request) {
  const current = await getCurrentMember();
  if (!current) {
    return errorResponse('Not authenticated', 401);
  }

  const row = await findMemberById(current.id);
  if (!row) {
    return errorResponse('Not authenticated', 401);
  }

  const data = await readJson<{
    full_name?: string;
    phone?: string | null;
    blood_group?: string | null;
    bike_color?: string | null;
    bike_registration?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    password?: string;
    current_password?: string;
  }>(request);

  const fullName = (data.full_name ?? row.full_name).trim();
  if (fullName === '') {
    return errorResponse('Full name is required', 422);
  }

  const bikeColor = trimOrNull(data.bike_color);
  if (!isValidBikeColor(bikeColor)) {
    return errorResponse('Please select a valid SM650 colour', 422);
  }

  const bloodGroup =
    data.blood_group === undefined
      ? row.blood_group
      : normalizeBloodGroup(data.blood_group);
  if (!isValidBloodGroup(bloodGroup)) {
    return errorResponse('Please select a valid blood group', 422);
  }

  let passwordHash = row.password_hash;
  const newPassword = data.password ?? '';
  const currentPassword = data.current_password ?? '';

  if (newPassword !== '') {
    if (newPassword.length < 8) {
      return errorResponse('New password must be at least 8 characters', 422);
    }
    if (currentPassword === '' || !bcrypt.compareSync(currentPassword, row.password_hash)) {
      return errorResponse('Current password is incorrect', 401);
    }
    passwordHash = bcrypt.hashSync(newPassword, 10);
  }

  const phoneResult = normalizeOptionalIndianPhone(
    data.phone === undefined ? row.phone : data.phone,
  );
  if (phoneResult.error) {
    return errorResponse(phoneResult.error, 422);
  }

  const emergencyPhoneResult = normalizeOptionalIndianPhone(data.emergency_contact_phone);
  if (emergencyPhoneResult.error) {
    return errorResponse(emergencyPhoneResult.error, 422);
  }

  const updated = await updateMember(row.id, {
    fullName,
    phone: phoneResult.phone,
    bloodGroup,
    bikeColor,
    bikeRegistration: trimOrNull(data.bike_registration),
    emergencyContactName: trimOrNull(data.emergency_contact_name),
    emergencyContactPhone: emergencyPhoneResult.phone,
    passwordHash,
  });

  return jsonResponse({
    member: memberPublic(updated),
    message: 'Profile updated',
  });
}
