<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= RbAcc\View::e($title ?? 'Road Burners Account') ?></title>
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Raleway:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/app.css">
  <style>:root { --font-inter: 'Inter', sans-serif; --font-raleway: 'Raleway', sans-serif; }</style>
</head>
<body>
<div class="app-shell">
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="https://sm650.com">
        <span class="brand-mark">RB</span>
        <span class="brand-text">
          <strong>Road Burners</strong>
          <span>Member Account</span>
        </span>
      </a>
      <nav class="topbar-nav">
        <a href="/">Dashboard</a>
        <a href="/profile">Profile</a>
        <span style="color:rgba(255,255,255,0.5);font-size:0.8rem;"><?= RbAcc\View::e($member['full_name'] ?? '') ?></span>
        <button type="button" id="logout-btn">Log out</button>
      </nav>
    </div>
  </header>
  <main class="main-content">
    <?= $content ?? '' ?>
  </main>
</div>
<script>
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  try { await fetch('/api/auth/logout', { method: 'POST' }); } finally { location.href = '/login'; }
});
</script>
</body>
</html>
