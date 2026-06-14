<?php

declare(strict_types=1);

namespace RbAcc;

final class Phone
{
    public const INDIA_CODE = '+91';

    public static function parseLocal(?string $input): ?string
    {
        if ($input === null || trim($input) === '') {
            return null;
        }

        $digits = preg_replace('/\D/', '', $input) ?? '';
        if (str_starts_with($digits, '91') && strlen($digits) > 10) {
            $digits = substr($digits, 2);
        } elseif (str_starts_with($digits, '0') && strlen($digits) === 11) {
            $digits = substr($digits, 1);
        }

        return $digits !== '' ? $digits : null;
    }

    public static function isValidLocal(?string $digits): bool
    {
        return $digits !== null && (bool) preg_match('/^[6-9]\d{9}$/', $digits);
    }

    public static function normalizeOptional(?string $input): array
    {
        if ($input === null || trim($input) === '') {
            return ['phone' => null];
        }

        $local = self::parseLocal($input);
        if (!self::isValidLocal($local)) {
            return ['phone' => null, 'error' => 'Enter a valid 10-digit Indian mobile number'];
        }

        return ['phone' => self::INDIA_CODE . $local];
    }

    public static function localFromStored(?string $stored): string
    {
        if ($stored === null || $stored === '') {
            return '';
        }
        $local = self::parseLocal($stored);
        return self::isValidLocal($local) ? $local : '';
    }

    public static function format(?string $stored): string
    {
        if ($stored === null || $stored === '') {
            return '—';
        }
        $local = self::parseLocal($stored);
        if (!self::isValidLocal($local)) {
            return $stored;
        }
        return self::INDIA_CODE . ' ' . substr($local, 0, 5) . ' ' . substr($local, 5);
    }
}
