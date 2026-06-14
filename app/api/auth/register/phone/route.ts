import { errorResponse, jsonResponse, readJson } from '@/lib/http';
import { findMemberByPhone } from '@/lib/members';
import { normalizeOptionalIndianPhone } from '@/lib/phone';
import {
  createRegistrationSession,
  logOtpForDev,
} from '@/lib/registration-sessions';

export async function POST(request: Request) {
  const data = await readJson<{ phone?: string }>(request);
  const phoneResult = normalizeOptionalIndianPhone(data.phone);

  if (phoneResult.error || !phoneResult.phone) {
    return errorResponse(phoneResult.error ?? 'Phone number is required', 422);
  }

  const existing = await findMemberByPhone(phoneResult.phone);
  if (existing) {
    return errorResponse('An account with this phone number already exists', 409);
  }

  const session = await createRegistrationSession(phoneResult.phone);
  logOtpForDev(session.phone, session.otp_code);

  return jsonResponse({
    session_id: session.id,
    message: 'OTP sent to your phone',
  });
}
