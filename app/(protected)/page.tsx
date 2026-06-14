import Link from 'next/link';
import { getCurrentMember } from '@/lib/auth';
import { formatIndianPhone } from '@/lib/phone';
import { StatusBadge } from '@/components/StatusBadge';

export default async function DashboardPage() {
  const member = await getCurrentMember();
  if (!member) return null;

  const joined = new Date(member.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <div className="page-header">
        <h1>Hello, {member.full_name.split(' ')[0]}</h1>
        <p>Manage your Road Burners membership and ride profile.</p>
      </div>

      {member.membership_status === 'suspended' && (
        <div className="alert alert-error">
          Your account is suspended. Contact{' '}
          <a href="mailto:contact@sm650.com">contact@sm650.com</a> for help.
        </div>
      )}

      <div className="card">
        <div className="stat-row">
          <div className="stat-box">
            <div className="label">Membership</div>
            <div className="value">
              <StatusBadge status={member.membership_status} />
            </div>
          </div>
          <div className="stat-box">
            <div className="label">Member since</div>
            <div className="value">{joined}</div>
          </div>
          <div className="stat-box">
            <div className="label">Bike</div>
            <div className="value">
              {member.bike_model}
              {member.bike_color ? ` · ${member.bike_color}` : ''}
            </div>
          </div>
        </div>

        <div className="section-title">Quick links</div>
        <div className="form-actions">
          <Link className="btn btn-primary" href="/profile">
            Edit profile
          </Link>
          <a
            className="btn btn-ghost"
            href="https://sm650.com/#rides-calendar"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rides calendar
          </a>
          <a
            className="btn btn-ghost"
            href="https://sm650.com/discipline.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discipline code
          </a>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Contact details on file</div>
        <div className="stat-row">
          <div className="stat-box">
            <div className="label">Email</div>
            <div className="value">{member.email}</div>
          </div>
          <div className="stat-box">
            <div className="label">Phone</div>
            <div className="value">{formatIndianPhone(member.phone)}</div>
          </div>
          <div className="stat-box">
            <div className="label">Blood group</div>
            <div className="value">{member.blood_group ?? '—'}</div>
          </div>
          <div className="stat-box">
            <div className="label">Emergency contact</div>
            <div className="value">
              {member.emergency_contact_name
                ? `${member.emergency_contact_name} (${formatIndianPhone(member.emergency_contact_phone)})`
                : '—'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
