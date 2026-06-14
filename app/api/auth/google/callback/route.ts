import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session-store';
import { appBaseUrl } from '@/lib/app-url';
import { ensureMemberEmailVerified } from '@/lib/email-verification';
import { verifyGoogleAuthCode } from '@/lib/google-oauth';
import { findMemberByEmail, sanitizeEmail } from '@/lib/members';
import { SignInError, signInMember } from '@/lib/sign-in-member';

function loginRedirect(error?: string): NextResponse {
  const base = `${appBaseUrl().replace(/\/$/, '')}/login`;
  const url = error ? `${base}?error=${encodeURIComponent(error)}` : base;
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    return loginRedirect(oauthError === 'access_denied' ? 'google_denied' : 'google_failed');
  }

  const session = await getSession();
  const expectedState = session.googleOAuthState;
  delete session.googleOAuthState;
  await session.save();

  if (!state || !expectedState || state !== expectedState) {
    return loginRedirect('google_state');
  }
  if (!code) {
    return loginRedirect('google_failed');
  }

  try {
    const googleUser = await verifyGoogleAuthCode(code);
    if (!googleUser.emailVerified) {
      return loginRedirect('google_email_unverified');
    }

    const email = sanitizeEmail(googleUser.email);
    const member = await findMemberByEmail(email);
    if (!member) {
      return loginRedirect('google_no_account');
    }

    // Google email must match the address stored at registration.
    if (sanitizeEmail(member.email) !== email) {
      return loginRedirect('google_email_mismatch');
    }

    await ensureMemberEmailVerified(member.id);
    await signInMember(member.id);

    return NextResponse.redirect(`${appBaseUrl().replace(/\/$/, '')}/`);
  } catch (err) {
    if (err instanceof SignInError && err.code === 'suspended') {
      return loginRedirect('suspended');
    }
    console.error('[google-oauth]', err);
    return loginRedirect('google_failed');
  }
}
