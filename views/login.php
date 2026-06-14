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
      <a class="btn btn-google btn-block" href="/api/auth/google">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.002 2.947-3.037 5.366-5.657 6.957l6.19 5.238C42.022 35.026 44 30.038 44 24c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>
        Continue with Google
      </a>
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
