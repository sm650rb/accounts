import bcrypt from 'bcryptjs';
import { isMemberEmailVerified } from '@/lib/email-verification';
import { errorResponse, isValidEmail, jsonResponse, readJson } from '@/lib/http';
import { findMemberByEmail, memberPublic, sanitizeEmail } from '@/lib/members';
import { SignInError, signInMember } from '@/lib/sign-in-member';

export async function POST(request: Request) {
  const data = await readJson<{ email?: string; password?: string }>(request);
  const email = sanitizeEmail(data.email ?? '');
  const password = data.password ?? '';

  if (!isValidEmail(email)) {
    return errorResponse('Valid email is required', 422);
  }
  if (password === '') {
    return errorResponse('Password is required', 422);
  }

  const member = await findMemberByEmail(email);
  if (!member || !bcrypt.compareSync(password, member.password_hash)) {
    return errorResponse('Invalid email or password', 401);
  }

  if (!(await isMemberEmailVerified(member.id))) {
    return errorResponse(
      'Please verify your email before signing in. Check your inbox for the verification link.',
      403,
    );
  }

  try {
    const current = await signInMember(member.id);
    return jsonResponse({
      member: memberPublic(current),
      message: 'Signed in',
    });
  } catch (err) {
    if (err instanceof SignInError) {
      return errorResponse(err.message, err.code === 'suspended' ? 403 : 401);
    }
    throw err;
  }
}
