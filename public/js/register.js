let sessionId = '';
let step = 'phone';

const steps = { phone: 1, otp: 2, profile: 3 };

function showStep(name) {
  step = name;
  ['phone', 'otp', 'profile', 'done'].forEach((s) => {
    const el = document.getElementById(`step-${s}`);
    if (el) el.hidden = s !== name;
  });
  const label = document.getElementById('step-label');
  if (label && steps[name]) label.textContent = `Step ${steps[name]} of 3`;
  document.getElementById('register-footer').hidden = name === 'done';
}

function showError(msg) {
  const el = document.getElementById('register-error');
  el.textContent = msg;
  el.hidden = !msg;
}

document.getElementById('phone-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');
  const phone = document.getElementById('phone').value.replace(/\D/g, '');
  try {
    const res = await fetch('/api/auth/register/phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    sessionId = data.session_id;
    showStep('otp');
  } catch (err) {
    showError(err.message);
  }
});

document.getElementById('otp-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');
  const otp = document.getElementById('otp').value.trim();
  try {
    const res = await fetch('/api/auth/register/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid OTP');
    showStep('profile');
  } catch (err) {
    showError(err.message);
  }
});

document.getElementById('change-phone')?.addEventListener('click', () => {
  showStep('phone');
  document.getElementById('otp').value = '';
  showError('');
});

document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showError('');
  const password = document.getElementById('reg_password').value;
  const confirm = document.getElementById('reg_confirm').value;
  if (password.length < 8) return showError('Password must be at least 8 characters');
  if (password !== confirm) return showError('Passwords do not match');
  if (!document.getElementById('bike_color').value) return showError('Please select your bike colour');

  try {
    const res = await fetch('/api/auth/register/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        full_name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('reg_email').value.trim(),
        password,
        blood_group: document.getElementById('blood_group').value,
        bike_color: document.getElementById('bike_color').value,
        bike_registration: document.getElementById('bike_registration').value.trim() || undefined,
        emergency_contact_name: document.getElementById('emergency_contact_name').value.trim() || undefined,
        emergency_contact_phone: document.getElementById('emergency_contact_phone').value || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    document.getElementById('done-message').innerHTML =
      `Account created for <strong>${data.email}</strong>. We sent a verification link — verify your email before signing in.`;
    showStep('done');
  } catch (err) {
    showError(err.message);
  }
});
