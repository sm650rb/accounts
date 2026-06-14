import { getCurrentMember } from '@/lib/auth';
import { ProfileForm } from '@/components/ProfileForm';

export default async function ProfilePage() {
  const member = await getCurrentMember();
  if (!member) return null;

  return <ProfileForm member={member} />;
}
