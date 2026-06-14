import 'server-only';

import { randomBytes } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { appBaseUrl } from './app-url';

export { isGoogleOAuthConfigured } from './google-oauth-config';

function googleRedirectUri(): string {
  return `${appBaseUrl()}/api/auth/google/callback`;
}

function createGoogleOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth is not configured');
  }
  return new OAuth2Client(clientId, clientSecret, googleRedirectUri());
}

export function createGoogleAuthState(): string {
  return randomBytes(32).toString('hex');
}

export function getGoogleAuthUrl(state: string): string {
  const client = createGoogleOAuthClient();
  return client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    state,
    prompt: 'select_account',
  });
}

export interface GoogleUserProfile {
  email: string;
  emailVerified: boolean;
  name: string;
}

export async function verifyGoogleAuthCode(code: string): Promise<GoogleUserProfile> {
  const client = createGoogleOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) {
    throw new Error('Missing Google ID token');
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new Error('Google account has no email');
  }

  return {
    email: payload.email,
    emailVerified: payload.email_verified === true,
    name: payload.name ?? '',
  };
}
