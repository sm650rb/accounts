import type { SessionOptions } from 'iron-session';

export interface SessionData {
  memberId?: number;
  googleOAuthState?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? 'dev-only-change-me-in-production-32chars',
  cookieName: 'rb_acc_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  },
};
