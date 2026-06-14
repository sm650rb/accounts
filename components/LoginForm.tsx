'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

const GOOGLE_ERROR_MESSAGES: Record<string, string> = {
  google_denied: 'Google sign-in was cancelled.',
  google_state: 'Google sign-in expired. Please try again.',
  google_no_account:
    'No Road Burners account exists for that Google email. Register with the same address first.',
  google_email_unverified: 'Your Google email is not verified. Use a verified Google account.',
  google_email_mismatch: 'That Google email does not match your registered account email.',
  google_failed: 'Google sign-in failed. Try again or use email and password.',
  suspended: 'Your account is suspended. Contact contact@sm650.com for help.',
};

export function LoginForm({ googleSignInEnabled = false }: { googleSignInEnabled?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const verified = searchParams.get('verified') === '1';
  const urlError = searchParams.get('error');
  const googleError = urlError ? GOOGLE_ERROR_MESSAGES[urlError] : undefined;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Login failed');
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="subtitle">
          Sign in with Google or the email and password from registration
        </p>

        {verified && (
          <div className="alert alert-success">
            Email verified. You can sign in now.
          </div>
        )}

        {urlError === 'invalid_token' && (
          <div className="alert alert-error">
            Email verification failed. Register again to receive a new link, or use the latest
            email after signing up.
          </div>
        )}

        {urlError === 'missing_token' && (
          <div className="alert alert-error">
            Verification link is incomplete. Open the full link from your email.
          </div>
        )}

        {googleError && <div className="alert alert-error">{googleError}</div>}

        {error && <div className="alert alert-error">{error}</div>}

        {googleSignInEnabled && (
          <>
            <a className="btn btn-google btn-block" href="/api/auth/google">
              <GoogleIcon />
              Continue with Google
            </a>
            <div className="auth-divider">or</div>
          </>
        )}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in with password'}
          </button>
        </form>

        <p className="auth-footer">
          New to Road Burners? <Link href="/register">Create an account</Link>
        </p>
        <p className="auth-footer">
          <a href="https://sm650.com">← Back to sm650.com</a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-1.002 2.947-3.037 5.366-5.657 6.957l6.19 5.238C42.022 35.026 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
