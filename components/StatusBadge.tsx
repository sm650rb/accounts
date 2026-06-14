import type { Member } from '@/types';

const labels: Record<Member['membership_status'], string> = {
  pending: 'Pending approval',
  active: 'Active member',
  suspended: 'Suspended',
};

export function StatusBadge({ status }: { status: Member['membership_status'] }) {
  return <span className={`status-badge status-${status}`}>{labels[status]}</span>;
}
