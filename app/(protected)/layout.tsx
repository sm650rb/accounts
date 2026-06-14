import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';
import { StatusBadge } from '@/components/StatusBadge';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const member = await getCurrentMember();
  if (!member) {
    redirect('/login');
  }

  return <AppShell member={member}>{children}</AppShell>;
}
