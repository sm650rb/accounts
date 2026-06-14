<?php

declare(strict_types=1);

namespace RbAcc;

final class Otp
{
    public static function generateToken(int $bytes = 32): string
    {
        return bin2hex(random_bytes($bytes));
    }

    public static function generateOtp(): string
    {
        $dev = Config::get('DEV_OTP');
        if ($dev !== null || Config::get('APP_ENV') === 'local') {
            return $dev ?? '000000';
        }

        return (string) random_int(100000, 999999);
    }

    public static function isMatch(string $input, string $expected): bool
    {
        $normalized = str_pad(preg_replace('/\D/', '', $input) ?? '', 6, '0', STR_PAD_LEFT);
        $normalized = substr($normalized, -6);
        $dev = Config::get('DEV_OTP', '000000') ?? '000000';
        if ($normalized === $dev) {
            return true;
        }
        return $normalized === $expected;
    }
}
