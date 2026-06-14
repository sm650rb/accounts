import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getCurrentMember } from '@/lib/auth';
import { LoginForm } from '@/components/LoginForm';
import { isGoogleOAuthConfigured } from '@/lib/google-oauth-config';

export default async function LoginPage() {
  const member = await getCurrentMember();
  if (member) {
    redirect('/');
  }

  return (
    <Suspense fallback={<div className="auth-layout" />}>
      <LoginForm googleSignInEnabled={isGoogleOAuthConfigured()} />
    </Suspense>
  );
}
