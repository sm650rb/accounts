document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('profile-message');
  const err = document.getElementById('profile-error');
  msg.hidden = true;
  err.hidden = true;

  const password = document.getElementById('password').value;
  const currentPassword = document.getElementById('current_password').value;
  if (password && password.length < 8) {
    err.textContent = 'New password must be at least 8 characters';
    err.hidden = false;
    return;
  }
  if (password && !currentPassword) {
    err.textContent = 'Enter your current password to set a new one';
    err.hidden = false;
    return;
  }

  const body = {
    full_name: document.getElementById('full_name').value.trim(),
    phone: document.getElementById('phone').value || null,
    blood_group: document.getElementById('blood_group').value || null,
    bike_color: document.getElementById('bike_color').value || null,
    bike_registration: document.getElementById('bike_registration').value.trim() || null,
    emergency_contact_name: document.getElementById('emergency_contact_name').value.trim() || null,
    emergency_contact_phone: document.getElementById('emergency_contact_phone').value || null,
  };
  if (password) {
    body.password = password;
    body.current_password = currentPassword;
  }

  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    msg.textContent = data.message || 'Profile updated';
    msg.hidden = false;
    document.getElementById('current_password').value = '';
    document.getElementById('password').value = '';
  } catch (error) {
    err.textContent = error.message || 'Update failed';
    err.hidden = false;
  }
});
