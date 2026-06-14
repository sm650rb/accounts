<?php

declare(strict_types=1);

namespace RbAcc;

use PHPMailer\PHPMailer\PHPMailer;

final class Mailer
{
    public static function sendVerification(string $to, string $verifyUrl, ?string $name = null): void
    {
        $built = EmailTemplates::verification($verifyUrl, $name);
        self::send($to, $built['subject'], $built['text'], $built['html']);
    }

    private static function send(string $to, string $subject, string $text, string $html): void
    {
        $host = Config::get('SMTP_HOST');
        $user = Config::get('SMTP_USER');
        $pass = Config::get('SMTP_PASSWORD');

        if ($host === null || $user === null || $pass === null) {
            error_log("[email] To: {$to} | Subject: {$subject} | {$text}");
            return;
        }

        if (!class_exists(PHPMailer::class)) {
            error_log("[email] PHPMailer not installed — run composer install. To: {$to} | {$text}");
            return;
        }

        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->Port = (int) (Config::get('SMTP_PORT', '587') ?? '587');
        $mail->SMTPAuth = true;
        $mail->Username = $user;
        $mail->Password = $pass;
        $mail->SMTPSecure = $mail->Port === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;

        $from = Config::get('SMTP_FROM', 'Road Burners <sm650rb@gmail.com>') ?? 'Road Burners <sm650rb@gmail.com>';
        if (preg_match('/^(.+)<(.+)>$/', $from, $m)) {
            $mail->setFrom(trim($m[2]), trim($m[1]));
        } else {
            $mail->setFrom($from);
        }

        $mail->addAddress($to);
        $mail->Subject = $subject;
        $mail->Body = $html;
        $mail->AltBody = $text;
        $mail->isHTML(true);

        $logoPath = dirname(__DIR__) . '/public/email/logo.png';
        if (is_readable($logoPath)) {
            $mail->addEmbeddedImage($logoPath, EmailTemplates::logoCid(), 'logo.png');
        }

        $mail->send();
    }
}
