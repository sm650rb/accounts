import { errorResponse, jsonResponse, readJson } from '@/lib/http';
import { isOtpMatch } from '@/lib/otp';
import {
  getRegistrationSession,
  markRegistrationSessionVerified,
} from '@/lib/registration-sessions';

export async function POST(request: Request) {
  const data = await readJson<{ session_id?: string; otp?: string }>(request);
  const sessionId = (data.session_id ?? '').trim();
  const otp = (data.otp ?? '').trim();

  if (!sessionId) {
    return errorResponse('Registration session is required', 422);
  }
  if (!otp) {
    return errorResponse('OTP is required', 422);
  }

  const session = await getRegistrationSession(sessionId);
  if (!session) {
    return errorResponse('Registration session expired. Please start again.', 410);
  }

  if (!isOtpMatch(otp, session.otp_code)) {
    return errorResponse('Invalid OTP', 401);
  }

  await markRegistrationSessionVerified(sessionId);

  return jsonResponse({
    session_id: sessionId,
    message: 'Phone verified',
  });
}
