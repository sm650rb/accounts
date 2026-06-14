import Link from 'next/link';
import {
  findMemberIdByVerificationToken,
  findVerifiedMemberIdByToken,
  markEmailVerified,
} from '@/lib/email-verification';
import { findMemberById, activateMemberIfPending } from '@/lib/members';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const trimmed = token?.trim();

  if (!trimmed) {
    return (
      <AuthMessage
        title="Verification link incomplete"
        message="This link is missing a verification token. Use the full link from your email."
        variant="error"
      />
    );
  }

  if (trimmed === 'test-smtp-check') {
    return (
      <AuthMessage
        title="Test email link"
        message="That was a manual SMTP test — it is not tied to an account. Register on the site to get a real verification link."
        variant="info"
      />
    );
  }

  const alreadyVerifiedId = await findVerifiedMemberIdByToken(trimmed);
  if (alreadyVerifiedId) {
    await activateMemberIfPending(alreadyVerifiedId);
    return (
      <AuthMessage
        title="Email already verified"
        message="This link was already used. You can sign in with your email and password."
        variant="success"
      />
    );
  }

  const memberId = await findMemberIdByVerificationToken(trimmed);
  if (!memberId) {
    return (
      <AuthMessage
        title="Verification link invalid"
        message="This link is not valid — it may have expired, or the account was never created. Register again to receive a new link."
        variant="error"
      />
    );
  }

  const member = await findMemberById(memberId);
  if (!member) {
    return (
      <AuthMessage
        title="Account not found"
        message="We could not find the member account for this link. Please register again."
        variant="error"
      />
    );
  }

  await markEmailVerified(memberId);
  await activateMemberIfPending(memberId);

  return (
    <AuthMessage
      title="Email verified"
      message={`${member.email} is verified. You can sign in now.`}
      variant="success"
      showLogin
    />
  );
}

function AuthMessage({
  title,
  message,
  variant,
  showLogin = variant === 'success',
}: {
  title: string;
  message: string;
  variant: 'success' | 'error' | 'info';
  showLogin?: boolean;
}) {
  const alertClass =
    variant === 'success'
      ? 'alert-success'
      : variant === 'info'
        ? 'alert-info'
        : 'alert-error';

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>{title}</h1>
        <div className={`alert ${alertClass}`}>{message}</div>
        {showLogin && (
          <Link className="btn btn-primary btn-block" href="/login">
            Sign in
          </Link>
        )}
        {!showLogin && variant === 'error' && (
          <Link className="btn btn-primary btn-block" href="/register">
            Register again
          </Link>
        )}
      </div>
    </div>
  );
}
