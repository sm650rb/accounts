<?php

declare(strict_types=1);

namespace RbAcc;

final class Config
{
    private static ?array $env = null;

    public static function load(string $root): void
    {
        if (self::$env !== null) {
            return;
        }

        self::$env = [];
        foreach (['.env.local', '.env'] as $file) {
            self::loadFile($root . '/' . $file);
        }
    }

    private static function loadFile(string $path): void
    {
        if (!is_readable($path)) {
            return;
        }

        foreach (file($path, FILE_IGNORE_NEW_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }
            $eq = strpos($line, '=');
            if ($eq === false) {
                continue;
            }
            $key = trim(substr($line, 0, $eq));
            $value = trim(substr($line, $eq + 1));
            if (
                (str_starts_with($value, '"') && str_ends_with($value, '"'))
                || (str_starts_with($value, "'") && str_ends_with($value, "'"))
            ) {
                $value = substr($value, 1, -1);
            }
            $value = stripcslashes($value);
            if ($key !== '' && !array_key_exists($key, self::$env)) {
                self::$env[$key] = $value;
            }
        }
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $value = self::$env[$key] ?? getenv($key);
        if ($value === false || $value === null || $value === '') {
            return $default;
        }
        return (string) $value;
    }

    public static function require(string $key): string
    {
        $value = self::get($key);
        if ($value === null || $value === '') {
            throw new \RuntimeException("Missing required config: {$key}");
        }
        return $value;
    }

    public static function appUrl(): string
    {
        return rtrim(self::get('APP_URL', 'http://localhost') ?? 'http://localhost', '/');
    }

    public static function isDevOtpEnabled(): bool
    {
        return self::get('DEV_OTP') !== null || self::get('APP_ENV') === 'local';
    }
}
