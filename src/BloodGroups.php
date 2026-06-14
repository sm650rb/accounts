<?php

declare(strict_types=1);

namespace RbAcc;

final class BloodGroups
{
    public const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    public static function isValid(?string $value): bool
    {
        if ($value === null || trim($value) === '') {
            return true;
        }
        return in_array(strtoupper(trim($value)), self::GROUPS, true);
    }

    public static function normalize(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }
        $normalized = strtoupper(trim($value));
        return self::isValid($normalized) ? $normalized : null;
    }
}
