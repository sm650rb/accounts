import 'server-only';

import { findMemberById, memberPublic } from './members';
import { getSession, loginMember, logoutMember } from './session-store';
import type { Member } from '@/types';

export { getSession, loginMember, logoutMember };

export async function getCurrentMember(): Promise<Member | null> {
  const session = await getSession();
  if (!session.memberId) return null;

  const row = await findMemberById(session.memberId);
  return row ? memberPublic(row) : null;
}

export async function requireMember(): Promise<Member> {
  const member = await getCurrentMember();
  if (!member) {
    throw new Error('Not authenticated');
  }
  return member;
}
