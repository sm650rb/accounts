'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { BikeColorPicker } from '@/components/BikeColorPicker';
import { BloodGroupSelect } from '@/components/BloodGroupSelect';
import { PhoneInput } from '@/components/PhoneInput';
import {
  isValidLocalIndianPhone,
  localPhoneFromStored,
} from '@/lib/phone';
import type { Member } from '@/types';

export function ProfileForm({ member }: { member: Member }) {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: member.full_name,
    phone: localPhoneFromStored(member.phone),
    blood_group: member.blood_group ?? '',
    bike_color: member.bike_color ?? '',
    bike_registration: member.bike_registration ?? '',
    emergency_contact_name: member.emergency_contact_name ?? '',
    emergency_contact_phone: localPhoneFromStored(member.emergency_contact_phone),
    current_password: '',
    password: '',
    confirm: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (form.password && form.password.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    if (form.password && form.password !== form.confirm) {
      setError('New passwords do not match');
      return;
    }
    if (form.password && !form.current_password) {
      setError('Enter your current password to set a new one');
      return;
    }
    if (form.phone && !isValidLocalIndianPhone(form.phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }
    if (form.emergency_contact_phone && !isValidLocalIndianPhone(form.emergency_contact_phone)) {
      setError('Enter a valid 10-digit emergency contact number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          phone: form.phone || null,
          blood_group: form.blood_group || null,
          bike_color: form.bike_color.trim() || null,
          bike_registration: form.bike_registration.trim() || null,
          emergency_contact_name: form.emergency_contact_name.trim() || null,
          emergency_contact_phone: form.emergency_contact_phone || null,
          ...(form.password
            ? { password: form.password, current_password: form.current_password }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Update failed');
      }
      setMessage(data.message);
      setForm((prev) => ({
        ...prev,
        current_password: '',
        password: '',
        confirm: '',
      }));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Your profile</h1>
        <p>Keep your ride and emergency contact details up to date.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <form className="card form-grid" onSubmit={handleSubmit}>
        <div className="section-title">Personal</div>
        <div className="form-grid two-col">
          <div>
            <label htmlFor="full_name">Full name</label>
            <input
              id="full_name"
              required
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <PhoneInput
              id="phone"
              value={form.phone}
              onChange={(phone) => update('phone', phone)}
            />
          </div>
          <div>
            <label htmlFor="blood_group">Blood group</label>
            <BloodGroupSelect
              id="blood_group"
              value={form.blood_group}
              onChange={(blood_group) => update('blood_group', blood_group)}
            />
          </div>
        </div>
        <div>
          <label>Email</label>
          <input value={member.email} disabled />
        </div>

        <div className="section-title">Bike</div>
        <div className="form-grid two-col">
          <div>
            <label>Model</label>
            <input value={member.bike_model} disabled />
          </div>
          <div>
            <label htmlFor="bike_color">Colour</label>
            <BikeColorPicker
              id="bike_color"
              value={form.bike_color}
              onChange={(bike_color) => update('bike_color', bike_color)}
            />
          </div>
          <div>
            <label htmlFor="bike_registration">Registration no.</label>
            <input
              id="bike_registration"
              value={form.bike_registration}
              onChange={(e) => update('bike_registration', e.target.value)}
            />
          </div>
        </div>

        <div className="section-title">Emergency contact</div>
        <div className="form-grid two-col">
          <div>
            <label htmlFor="emergency_contact_name">Name</label>
            <input
              id="emergency_contact_name"
              value={form.emergency_contact_name}
              onChange={(e) => update('emergency_contact_name', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="emergency_contact_phone">Phone</label>
            <PhoneInput
              id="emergency_contact_phone"
              value={form.emergency_contact_phone}
              onChange={(emergency_contact_phone) =>
                update('emergency_contact_phone', emergency_contact_phone)
              }
            />
          </div>
        </div>

        <div className="section-title">Change password</div>
        <div className="form-grid two-col">
          <div>
            <label htmlFor="current_password">Current password</label>
            <input
              id="current_password"
              type="password"
              autoComplete="current-password"
              value={form.current_password}
              onChange={(e) => update('current_password', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm">Confirm new password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => update('confirm', e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </>
  );
}
