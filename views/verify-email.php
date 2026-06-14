<?php
use RbAcc\View;

/** @var string $title */
/** @var string $message */
/** @var string $variant */
/** @var bool $showLogin */

$alertClass = match ($variant) {
    'success' => 'alert-success',
    'info' => 'alert-info',
    default => 'alert-error',
};

ob_start();
?>
<div class="auth-layout">
  <div class="auth-card">
    <h1><?= View::e($title) ?></h1>
    <div class="alert <?= $alertClass ?>"><?= View::e($message) ?></div>
    <?php if ($showLogin): ?>
      <a class="btn btn-primary btn-block" href="/login">Sign in</a>
    <?php elseif ($variant === 'error'): ?>
      <a class="btn btn-primary btn-block" href="/register">Register again</a>
    <?php endif; ?>
  </div>
</div>
<?php
$content = ob_get_clean();
require __DIR__ . '/layout-auth.php';
