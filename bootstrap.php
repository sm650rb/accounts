<?php

declare(strict_types=1);

$root = dirname(__DIR__);

$autoload = $root . '/vendor/autoload.php';
if (is_readable($autoload)) {
    require $autoload;
} else {
    // PHPMailer optional until `composer install` on server
    spl_autoload_register(static function (string $class): void {
        if (!str_starts_with($class, 'RbAcc\\')) {
            return;
        }
        $file = dirname(__DIR__) . '/src/' . substr($class, 6) . '.php';
        if (is_readable($file)) {
            require $file;
        }
    });
}

require $root . '/src/Config.php';
require $root . '/src/Database.php';
require $root . '/src/Http.php';
require $root . '/src/Phone.php';
require $root . '/src/Otp.php';
require $root . '/src/BikeColors.php';
require $root . '/src/BloodGroups.php';
require $root . '/src/MemberRepository.php';
require $root . '/src/EmailVerificationRepository.php';
require $root . '/src/RegistrationSessionRepository.php';
require $root . '/src/Auth.php';
require $root . '/src/EmailTemplates.php';
require $root . '/src/Mailer.php';
require $root . '/src/GoogleOAuth.php';
require $root . '/src/Api.php';
require $root . '/src/View.php';

use RbAcc\Config;

Config::load($root);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}
