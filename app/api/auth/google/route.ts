import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session-store';
import {
  createGoogleAuthState,
  getGoogleAuthUrl,
  isGoogleOAuthConfigured,
} from '@/lib/google-oauth';

export async function GET() {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json({ error: 'Google sign-in is not configured' }, { status: 503 });
  }

  const state = createGoogleAuthState();
  const session = await getSession();
  session.googleOAuthState = state;
  await session.save();

  return NextResponse.redirect(getGoogleAuthUrl(state));
}
