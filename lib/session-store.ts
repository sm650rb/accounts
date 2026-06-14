import 'server-only';

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from './session';

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function loginMember(memberId: number): Promise<void> {
  const session = await getSession();
  session.memberId = memberId;
  delete session.googleOAuthState;
  await session.save();
}

export async function logoutMember(): Promise<void> {
  const session = await getSession();
  delete session.memberId;
  delete session.googleOAuthState;
  session.destroy();
}
