<?php

declare(strict_types=1);

namespace RbAcc;

final class EmailTemplates
{
    private const LOGO_CID = 'rb-logo@roadburners';

    /** @return array{subject:string,text:string,html:string} */
    public static function verification(string $verifyUrl, ?string $recipientName): array
    {
        $firstName = 'there';
        if ($recipientName !== null && trim($recipientName) !== '') {
            $parts = preg_split('/\s+/', trim($recipientName));
            $firstName = htmlspecialchars($parts[0] ?? 'there', ENT_QUOTES, 'UTF-8');
        }

        $safeUrl = htmlspecialchars($verifyUrl, ENT_QUOTES, 'UTF-8');
        $subject = 'Verify your Road Burners account';

        $text = implode("\n", [
            'Road Burners — Member Account',
            '',
            "Hi {$firstName},",
            '',
            'Welcome to the Road Burners member portal. Verify your email to activate your account:',
            '',
            $verifyUrl,
            '',
            'https://www.sm650.com',
        ]);

        $html = self::shell(
            self::header()
            . '<tr><td style="padding:32px 28px 8px;">'
            . '<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#cfaa1e;">Welcome aboard</p>'
            . '<h1 style="margin:0 0 12px;font-family:Raleway,sans-serif;font-size:24px;font-weight:800;color:#212529;">Verify your email</h1>'
            . "<p style=\"margin:0;font-size:15px;line-height:1.65;color:#6c757d;\">Hi {$firstName}, thanks for joining Road Burners. Tap the button below to confirm your email.</p>"
            . self::cta('Verify email address', $verifyUrl)
            . "<p style=\"margin:20px 0 0;font-size:13px;color:#6c757d;\">Button not working? Copy this link:</p>"
            . "<p style=\"margin:8px 0 0;font-size:12px;word-break:break-all;\"><a href=\"{$safeUrl}\">{$safeUrl}</a></p>"
            . '</td></tr>'
            . self::footer()
        );

        return compact('subject', 'text', 'html');
    }

    public static function logoCid(): string
    {
        return self::LOGO_CID;
    }

    private static function shell(string $content): string
    {
        return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Road Burners</title></head>'
            . '<body style="margin:0;background:#111;font-family:Inter,sans-serif;">'
            . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:40px 16px;">'
            . '<table role="presentation" width="100%" style="max-width:520px;background:#fff;border-radius:12px;">'
            . $content
            . '</table></td></tr></table></body></html>';
    }

    private static function header(): string
    {
        return '<tr><td style="background:#111;padding:22px 28px;">'
            . '<img src="cid:' . self::LOGO_CID . '" width="190" height="38" alt="Road Burners SM650">'
            . '<p style="margin:8px 0 0 5px;font-size:12px;color:rgba(255,255,255,0.65);">Member Account</p>'
            . '</td></tr>';
    }

    private static function footer(): string
    {
        return '<tr><td style="padding:20px 28px;border-top:1px solid #eee;background:#f4f5f7;text-align:center;">'
            . '<p style="margin:0;font-size:12px;color:#6c757d;"><a href="https://www.sm650.com" style="color:#cfaa1e;">sm650.com</a> · SM650 Community</p>'
            . '</td></tr>';
    }

    private static function cta(string $label, string $href): string
    {
        $safe = htmlspecialchars($href, ENT_QUOTES, 'UTF-8');
        return '<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;">'
            . '<tr><td style="border-radius:999px;background:#e8b923;">'
            . "<a href=\"{$safe}\" style=\"display:inline-block;padding:14px 32px;font-weight:700;color:#111;text-decoration:none;\">{$label}</a>"
            . '</td></tr></table>';
    }
}
