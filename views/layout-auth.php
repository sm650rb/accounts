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
<?= $content ?? '' ?>
</body>
</html>
