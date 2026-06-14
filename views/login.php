<?php
/** @var bool $googleEnabled */
/** @var bool $verified */
/** @var string|null $error */

use RbAcc\View;

$googleErrors = [
    'google_denied' => 'Google sign-in was cancelled.',
    'google_state' => 'Google sign-in expired. Please try again.',
    'google_no_account' => 'No Road Burners account exists for that Google email. Register with the same address first.',
    'google_email_unverified' => 'Your Google email is not verified.',
    'google_email_mismatch' => 'That Google email does not match your registered account email.',
    'google_failed' => 'Google sign-in failed. Try again or use email and password.',
    'suspended' => 'Your account is suspended. Contact contact@sm650.com for help.',
];

ob_start();
?>
<div class="auth-layout">
  <div class="auth-card">
    <h1>Welcome back</h1>
    <p class="subtitle">Sign in with Google or the email and password from registration</p>

    <?php if ($verified): ?>
      <div class="alert alert-success">Email verified. You can sign in now.</div>
    <?php endif; ?>

    <?php if ($error && isset($googleErrors[$error])): ?>
      <div class="alert alert-error"><?= View::e($googleErrors[$error]) ?></div>
    <?php endif; ?>

    <div id="login-error" class="alert alert-error" hidden></div>

    <?php if ($googleEnabled): ?>
      <a class="btn btn-google btn-block" href="/api/auth/google">Continue with Google</a>
      <div class="auth-divider">or</div>
    <?php endif; ?>

    <form class="form-grid" id="login-form">
      <div>
        <label for="email">Email</label>
        <input id="email" type="email" autocomplete="email" required>
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" type="password" autocomplete="current-password" required>
      </div>
      <button class="btn btn-primary btn-block" type="submit">Sign in with password</button>
    </form>

    <p class="auth-footer">New to Road Burners? <a href="/register">Create an account</a></p>
    <p class="auth-footer"><a href="https://sm650.com">← Back to sm650.com</a></p>
  </div>
</div>
<script src="/js/login.js"></script>
<?php
$content = ob_get_clean();
$title = 'Sign in';
require __DIR__ . '/layout-auth.php';
