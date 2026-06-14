import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/auth';
import { RegisterForm } from '@/components/RegisterForm';

export default async function RegisterPage() {
  const member = await getCurrentMember();
  if (member) {
    redirect('/');
  }

  return <RegisterForm />;
}
