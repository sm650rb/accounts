import bcrypt from 'bcryptjs';
import { isValidBikeColor } from '@/lib/bike-colors';
import { isValidBloodGroup, normalizeBloodGroup } from '@/lib/blood-groups';
import { appBaseUrl, sendVerificationEmail } from '@/lib/email';
import { createEmailVerification } from '@/lib/email-verification';
import { errorResponse, isValidEmail, jsonResponse, readJson } from '@/lib/http';
import {
  createMember,
  findMemberByEmail,
  findMemberByPhone,
  sanitizeEmail,
  trimOrNull,
} from '@/lib/members';
import { normalizeOptionalIndianPhone } from '@/lib/phone';
import { generateToken } from '@/lib/otp';
import {
  deleteRegistrationSession,
  getRegistrationSession,
} from '@/lib/registration-sessions';

export async function POST(request: Request) {
  const data = await readJson<{
    session_id?: string;
    email?: string;
    password?: string;
    full_name?: string;
    blood_group?: string;
    bike_color?: string;
    bike_registration?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
  }>(request);

  const sessionId = (data.session_id ?? '').trim();
  if (!sessionId) {
    return errorResponse('Registration session is required', 422);
  }

  const session = await getRegistrationSession(sessionId);
  if (!session || !session.otp_verified) {
    return errorResponse('Phone verification required. Please complete OTP step.', 403);
  }

  const email = sanitizeEmail(data.email ?? '');
  const password = data.password ?? '';
  const fullName = (data.full_name ?? '').trim();

  if (fullName === '') {
    return errorResponse('Full name is required', 422);
  }
  if (!isValidEmail(email)) {
    return errorResponse('Valid email is required', 422);
  }
  if (password.length < 8) {
    return errorResponse('Password must be at least 8 characters', 422);
  }

  const bikeColor = trimOrNull(data.bike_color);
  if (!bikeColor) {
    return errorResponse('Bike colour is required', 422);
  }
  if (!isValidBikeColor(bikeColor)) {
    return errorResponse('Please select a valid SM650 colour', 422);
  }

  const bloodGroup = normalizeBloodGroup(data.blood_group);
  if (!bloodGroup) {
    return errorResponse('Blood group is required', 422);
  }
  if (!isValidBloodGroup(bloodGroup)) {
    return errorResponse('Please select a valid blood group', 422);
  }

  if (await findMemberByEmail(email)) {
    return errorResponse('An account with this email already exists', 409);
  }
  if (await findMemberByPhone(session.phone)) {
    return errorResponse('An account with this phone number already exists', 409);
  }

  const emergencyPhoneResult = normalizeOptionalIndianPhone(data.emergency_contact_phone);
  if (emergencyPhoneResult.error) {
    return errorResponse(emergencyPhoneResult.error, 422);
  }

  const verificationToken = generateToken();
  const passwordHash = bcrypt.hashSync(password, 10);

  const member = await createMember({
    email,
    passwordHash,
    fullName,
    phone: session.phone,
    bloodGroup,
    bikeColor,
    bikeRegistration: trimOrNull(data.bike_registration),
    emergencyContactName: trimOrNull(data.emergency_contact_name),
    emergencyContactPhone: emergencyPhoneResult.phone,
  });

  await createEmailVerification(member.id, verificationToken);
  await deleteRegistrationSession(sessionId);

  const verifyUrl = `${appBaseUrl()}/verify-email?token=${verificationToken}`;
  await sendVerificationEmail(email, verifyUrl, fullName);

  return jsonResponse(
    {
      message: 'Account created. Check your email to verify your address before signing in.',
      email,
    },
    201,
  );
}
