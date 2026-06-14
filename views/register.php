<?php
use RbAcc\View;

/** @var array $bikeColors */
/** @var array $bloodGroups */
/** @var string|null $devOtp */

ob_start();
?>
<div class="auth-layout">
  <div class="auth-card" style="width:min(520px,100%)">
    <h1>Join Road Burners</h1>
    <p class="subtitle">Register your member account. Exclusive for Bengaluru Super Meteor 650 owners.</p>
    <p class="auth-footer" id="step-label" style="margin-top:0;margin-bottom:1rem">Step 1 of 3</p>
    <div id="register-error" class="alert alert-error" hidden></div>

    <div id="step-phone">
      <form class="form-grid" id="phone-form">
        <div>
          <label for="phone">Mobile number</label>
          <div class="phone-input-wrap">
            <span class="phone-input-prefix">+91</span>
            <input id="phone" inputmode="numeric" maxlength="10" pattern="[6-9][0-9]{9}" required placeholder="9876543210">
          </div>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Send OTP</button>
      </form>
    </div>

    <div id="step-otp" hidden>
      <form class="form-grid" id="otp-form">
        <div class="alert alert-info">Enter the 6-digit code sent to your phone. Dev default: <strong><?= View::e($devOtp ?? '000000') ?></strong></div>
        <div>
          <label for="otp">OTP</label>
          <input id="otp" inputmode="numeric" maxlength="6" required placeholder="000000">
        </div>
        <button class="btn btn-primary btn-block" type="submit">Verify OTP</button>
        <button class="btn btn-ghost btn-block" type="button" id="change-phone">Change phone number</button>
      </form>
    </div>

    <div id="step-profile" hidden>
      <form class="form-grid" id="profile-form">
        <div>
          <label for="full_name">Full name</label>
          <input id="full_name" required>
        </div>
        <div>
          <label for="reg_email">Email</label>
          <input id="reg_email" type="email" autocomplete="email" required>
        </div>
        <div class="form-grid two-col">
          <div>
            <label for="blood_group">Blood group</label>
            <select id="blood_group" required>
              <option value="">Select…</option>
              <?php foreach ($bloodGroups as $bg): ?>
                <option value="<?= View::e($bg) ?>"><?= View::e($bg) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div>
            <label for="bike_color">Bike colour</label>
            <input type="hidden" id="bike_color" required>
            <button type="button" class="bike-color-trigger" id="bike-color-trigger">
              <span class="bike-color-trigger-text bike-color-placeholder">Select colour…</span>
              <span class="bike-color-trigger-chevron">▾</span>
            </button>
          </div>
        </div>
        <div>
          <label for="bike_registration">Registration no.</label>
          <input id="bike_registration">
        </div>
        <div class="section-title">Emergency contact</div>
        <div class="form-grid two-col">
          <div>
            <label for="emergency_contact_name">Name</label>
            <input id="emergency_contact_name">
          </div>
          <div>
            <label for="emergency_contact_phone">Phone</label>
            <div class="phone-input-wrap">
              <span class="phone-input-prefix">+91</span>
              <input id="emergency_contact_phone" inputmode="numeric" maxlength="10">
            </div>
          </div>
        </div>
        <div class="form-grid two-col">
          <div>
            <label for="reg_password">Password</label>
            <input id="reg_password" type="password" minlength="8" required>
          </div>
          <div>
            <label for="reg_confirm">Confirm password</label>
            <input id="reg_confirm" type="password" required>
          </div>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Create account</button>
      </form>
    </div>

    <div id="step-done" hidden>
      <div class="alert alert-success" id="done-message"></div>
      <a class="btn btn-primary btn-block" href="/login">Go to sign in</a>
    </div>

    <p class="auth-footer" id="register-footer">Already have an account? <a href="/login">Sign in</a></p>
  </div>
</div>

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

<script src="/js/register.js"></script>
<script src="/js/bike-color.js"></script>
<?php
$content = ob_get_clean();
$title = 'Register';
require __DIR__ . '/layout-auth.php';
