import { loginMember } from '@/lib/session-store';
import { activateMemberIfPending, findMemberById } from './members';
import type { MemberRow } from '@/types';

export class SignInError extends Error {
  constructor(
    message: string,
    readonly code: 'not_found' | 'suspended' | 'email_unverified' | 'email_mismatch',
  ) {
    super(message);
    this.name = 'SignInError';
  }
}

export async function signInMember(memberId: number): Promise<MemberRow> {
  const member = await findMemberById(memberId);
  if (!member) {
    throw new SignInError('Account not found', 'not_found');
  }
  if (member.membership_status === 'suspended') {
    throw new SignInError(
      'Your account is suspended. Contact contact@sm650.com for help.',
      'suspended',
    );
  }

  await activateMemberIfPending(memberId);
  const current = (await findMemberById(memberId)) ?? member;
  await loginMember(current.id);
  return current;
}
