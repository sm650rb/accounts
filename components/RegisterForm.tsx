'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { BikeColorPicker } from '@/components/BikeColorPicker';
import { BloodGroupSelect } from '@/components/BloodGroupSelect';
import { PhoneInput } from '@/components/PhoneInput';
import { isValidLocalIndianPhone } from '@/lib/phone';

type Step = 'phone' | 'otp' | 'profile' | 'done';

export function RegisterForm() {
  const [step, setStep] = useState<Step>('phone');
  const [sessionId, setSessionId] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    blood_group: '',
    bike_color: '',
    bike_registration: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateProfile(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePhoneSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!isValidLocalIndianPhone(phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to send OTP');

      setSessionId(data.session_id);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/register/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Invalid OTP');

      setStep('profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!form.blood_group) {
      setError('Please select your blood group');
      return;
    }
    if (!form.bike_color) {
      setError('Please select your bike colour');
      return;
    }
    if (
      form.emergency_contact_phone &&
      !isValidLocalIndianPhone(form.emergency_contact_phone)
    ) {
      setError('Enter a valid 10-digit emergency contact number');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          password: form.password,
          blood_group: form.blood_group,
          bike_color: form.bike_color,
          bike_registration: form.bike_registration.trim() || undefined,
          emergency_contact_name: form.emergency_contact_name.trim() || undefined,
          emergency_contact_phone: form.emergency_contact_phone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Registration failed');

      setRegisteredEmail(data.email ?? form.email.trim());
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card" style={{ width: 'min(520px, 100%)' }}>
        <h1>Join Road Burners</h1>
        <p className="subtitle">
          Register your member account. Exclusive for Bengaluru Super Meteor 650 owners.
        </p>

        {step !== 'done' && (
          <p className="auth-footer" style={{ marginTop: 0, marginBottom: '1rem' }}>
            Step {step === 'phone' ? 1 : step === 'otp' ? 2 : 3} of 3
          </p>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {step === 'phone' && (
          <form className="form-grid" onSubmit={handlePhoneSubmit}>
            <div>
              <label htmlFor="phone">Mobile number</label>
              <PhoneInput id="phone" value={phone} onChange={setPhone} required />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form className="form-grid" onSubmit={handleOtpSubmit}>
            <div className="alert alert-info">
              Enter the 6-digit code sent to {phone}. Dev default: <strong>000000</strong>
            </div>
            <div>
              <label htmlFor="otp">OTP</label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Verifying…' : 'Verify OTP'}
            </button>
            <button
              className="btn btn-ghost btn-block"
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setError('');
              }}
            >
              Change phone number
            </button>
          </form>
        )}

        {step === 'profile' && (
          <form className="form-grid" onSubmit={handleProfileSubmit}>
            <div>
              <label htmlFor="full_name">Full name</label>
              <input
                id="full_name"
                required
                value={form.full_name}
                onChange={(e) => updateProfile('full_name', e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => updateProfile('email', e.target.value)}
              />
            </div>
            <div className="form-grid two-col">
              <div>
                <label htmlFor="blood_group">Blood group</label>
                <BloodGroupSelect
                  id="blood_group"
                  value={form.blood_group}
                  onChange={(blood_group) => updateProfile('blood_group', blood_group)}
                  required
                />
              </div>
              <div>
                <label htmlFor="bike_color">Bike colour</label>
                <BikeColorPicker
                  id="bike_color"
                  value={form.bike_color}
                  onChange={(bike_color) => updateProfile('bike_color', bike_color)}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="bike_registration">Registration no.</label>
              <input
                id="bike_registration"
                value={form.bike_registration}
                onChange={(e) => updateProfile('bike_registration', e.target.value)}
              />
            </div>
            <div className="section-title">Emergency contact</div>
            <div className="form-grid two-col">
              <div>
                <label htmlFor="emergency_contact_name">Name</label>
                <input
                  id="emergency_contact_name"
                  value={form.emergency_contact_name}
                  onChange={(e) => updateProfile('emergency_contact_name', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="emergency_contact_phone">Phone</label>
                <PhoneInput
                  id="emergency_contact_phone"
                  value={form.emergency_contact_phone}
                  onChange={(emergency_contact_phone) =>
                    updateProfile('emergency_contact_phone', emergency_contact_phone)
                  }
                />
              </div>
            </div>
            <div className="form-grid two-col">
              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => updateProfile('password', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={(e) => updateProfile('confirm', e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}

        {step === 'done' && (
          <div className="form-grid">
            <div className="alert alert-success">
              Account created for <strong>{registeredEmail}</strong>. We sent a verification
              link — please verify your email before signing in.
            </div>
            <Link className="btn btn-primary btn-block" href="/login">
              Go to sign in
            </Link>
          </div>
        )}

        {step !== 'done' && (
          <p className="auth-footer">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
