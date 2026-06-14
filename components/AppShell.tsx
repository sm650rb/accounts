'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Member } from '@/types';

export function AppShell({
  member,
  children,
}: {
  member: Member;
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="https://sm650.com">
            <span className="brand-mark">RB</span>
            <span className="brand-text">
              <strong>Road Burners</strong>
              <span>Member Account</span>
            </span>
          </a>
          <nav className="topbar-nav">
            <Link href="/">Dashboard</Link>
            <Link href="/profile">Profile</Link>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
              {member.full_name}
            </span>
            <button type="button" onClick={handleLogout}>
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
