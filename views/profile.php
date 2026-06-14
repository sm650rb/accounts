<?php
use RbAcc\Phone;
use RbAcc\View;

/** @var array $member */
/** @var array $bikeColors */
/** @var array $bloodGroups */

$phoneLocal = Phone::localFromStored($member['phone']);
$emergencyLocal = Phone::localFromStored($member['emergency_contact_phone']);

ob_start();
?>
<div class="page-header">
  <h1>Your profile</h1>
  <p>Keep your ride and emergency contact details up to date.</p>
</div>

<div id="profile-message" class="alert alert-success" hidden></div>
<div id="profile-error" class="alert alert-error" hidden></div>

<form class="card form-grid" id="profile-form">
  <div class="section-title">Personal</div>
  <div class="form-grid two-col">
    <div>
      <label for="full_name">Full name</label>
      <input id="full_name" required value="<?= View::e($member['full_name']) ?>">
    </div>
    <div>
      <label for="email">Email</label>
      <input id="email" type="email" disabled value="<?= View::e($member['email']) ?>">
    </div>
  </div>
  <div class="form-grid two-col">
    <div>
      <label for="phone">Phone</label>
      <div class="phone-input-wrap">
        <span class="phone-input-prefix">+91</span>
        <input id="phone" inputmode="numeric" maxlength="10" value="<?= View::e($phoneLocal) ?>">
      </div>
    </div>
    <div>
      <label for="blood_group">Blood group</label>
      <select id="blood_group">
        <option value="">—</option>
        <?php foreach ($bloodGroups as $bg): ?>
          <option value="<?= View::e($bg) ?>" <?= ($member['blood_group'] ?? '') === $bg ? 'selected' : '' ?>><?= View::e($bg) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
  </div>

  <div class="section-title">Bike</div>
  <div class="form-grid two-col">
    <div>
      <label>Bike model</label>
      <input disabled value="<?= View::e($member['bike_model']) ?>">
    </div>
    <div>
      <label for="bike_color">Colour</label>
      <input type="hidden" id="bike_color" value="<?= View::e($member['bike_color'] ?? '') ?>">
      <button type="button" class="bike-color-trigger" id="bike-color-trigger">
        <span class="bike-color-trigger-text"><?= View::e($member['bike_color'] ?: 'Select colour…') ?></span>
        <span class="bike-color-trigger-chevron">▾</span>
      </button>
    </div>
  </div>
  <div>
    <label for="bike_registration">Registration no.</label>
    <input id="bike_registration" value="<?= View::e($member['bike_registration'] ?? '') ?>">
  </div>

  <div class="section-title">Emergency contact</div>
  <div class="form-grid two-col">
    <div>
      <label for="emergency_contact_name">Name</label>
      <input id="emergency_contact_name" value="<?= View::e($member['emergency_contact_name'] ?? '') ?>">
    </div>
    <div>
      <label for="emergency_contact_phone">Phone</label>
      <div class="phone-input-wrap">
        <span class="phone-input-prefix">+91</span>
        <input id="emergency_contact_phone" inputmode="numeric" maxlength="10" value="<?= View::e($emergencyLocal) ?>">
      </div>
    </div>
  </div>

  <div class="section-title">Change password</div>
  <div class="form-grid two-col">
    <div>
      <label for="current_password">Current password</label>
      <input id="current_password" type="password" autocomplete="current-password">
    </div>
    <div>
      <label for="password">New password</label>
      <input id="password" type="password" autocomplete="new-password" minlength="8">
    </div>
  </div>

  <div class="form-actions">
    <button class="btn btn-primary" type="submit">Save changes</button>
    <a class="btn btn-ghost" href="/">Cancel</a>
  </div>
</form>

<dialog class="bike-color-dialog" id="bike-color-dialog">
  <div class="bike-color-dialog-panel">
    <div class="bike-color-dialog-header">
      <h2>Select bike colour</h2>
      <button type="button" class="bike-color-dialog-close" id="bike-color-close" aria-label="Close">×</button>
    </div>
    <div class="bike-color-grid" id="bike-color-grid">
      <?php foreach ($bikeColors as $color): ?>
        <button type="button" class="bike-color-tile" data-name="<?= View::e($color['name']) ?>" data-swatch="<?= View::e($color['swatch']) ?>">
          <div class="bike-color-tile-image-wrap">
            <img src="<?= View::e($color['image']) ?>" alt="<?= View::e($color['name']) ?>">
            <span class="bike-color-tile-swatch" style="background:<?= View::e($color['swatch']) ?>"></span>
          </div>
          <span class="bike-color-tile-name"><?= View::e($color['name']) ?></span>
        </button>
      <?php endforeach; ?>
    </div>
  </div>
</dialog>

<script src="/js/profile.js"></script>
<script src="/js/bike-color.js"></script>
<?php
$content = ob_get_clean();
$title = 'Profile';
require __DIR__ . '/layout-app.php';
