<?php
use RbAcc\Phone;
use RbAcc\View;

/** @var array $member */

$joined = date('j F Y', strtotime($member['created_at']));
$firstName = explode(' ', $member['full_name'])[0];

ob_start();
?>
<div class="page-header">
  <h1>Hello, <?= View::e($firstName) ?></h1>
  <p>Manage your Road Burners membership and ride profile.</p>
</div>

<?php if ($member['membership_status'] === 'suspended'): ?>
  <div class="alert alert-error">Your account is suspended. Contact <a href="mailto:contact@sm650.com">contact@sm650.com</a> for help.</div>
<?php endif; ?>

<div class="card">
  <div class="stat-row">
    <div class="stat-box">
      <div class="label">Membership</div>
      <div class="value"><?= View::statusBadge($member['membership_status']) ?></div>
    </div>
    <div class="stat-box">
      <div class="label">Member since</div>
      <div class="value"><?= View::e($joined) ?></div>
    </div>
    <div class="stat-box">
      <div class="label">Bike</div>
      <div class="value"><?= View::e($member['bike_model']) ?><?= $member['bike_color'] ? ' · ' . View::e($member['bike_color']) : '' ?></div>
    </div>
  </div>
  <div class="section-title">Quick links</div>
  <div class="form-actions">
    <a class="btn btn-primary" href="/profile">Edit profile</a>
    <a class="btn btn-ghost" href="https://sm650.com/#rides-calendar" target="_blank" rel="noopener">Rides calendar</a>
    <a class="btn btn-ghost" href="https://sm650.com/discipline.html" target="_blank" rel="noopener">Discipline code</a>
  </div>
</div>

<div class="card">
  <div class="section-title">Contact details on file</div>
  <div class="stat-row">
    <div class="stat-box"><div class="label">Email</div><div class="value"><?= View::e($member['email']) ?></div></div>
    <div class="stat-box"><div class="label">Phone</div><div class="value"><?= View::e(Phone::format($member['phone'])) ?></div></div>
    <div class="stat-box"><div class="label">Blood group</div><div class="value"><?= View::e($member['blood_group'] ?? '—') ?></div></div>
    <div class="stat-box">
      <div class="label">Emergency contact</div>
      <div class="value">
        <?php if ($member['emergency_contact_name']): ?>
          <?= View::e($member['emergency_contact_name']) ?> (<?= View::e(Phone::format($member['emergency_contact_phone'])) ?>)
        <?php else: ?>—<?php endif; ?>
      </div>
    </div>
  </div>
</div>
<?php
$content = ob_get_clean();
$title = 'Dashboard';
require __DIR__ . '/layout-app.php';
