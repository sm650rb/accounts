<?php

declare(strict_types=1);

namespace RbAcc;

final class RegistrationSessionRepository
{
    private const TTL_MINUTES = 15;

    public static function create(string $phone): array
    {
        $id = self::uuid();
        $otp = Otp::generateOtp();
        $expires = (new \DateTimeImmutable('+' . self::TTL_MINUTES . ' minutes'))->format('Y-m-d H:i:s');

        $stmt = Database::pdo()->prepare(
            'INSERT INTO rb_registration_sessions (id, phone, otp_code, expires_at) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$id, $phone, $otp, $expires]);

        if (Config::isDevOtpEnabled()) {
            error_log("[otp] {$phone}: {$otp}");
        }

        $session = self::find($id);
        if ($session === null) {
            throw new \RuntimeException('Failed to create registration session');
        }
        return $session;
    }

    public static function find(string $id): ?array
    {
        $stmt = Database::pdo()->prepare(
            'SELECT * FROM rb_registration_sessions WHERE id = ? AND expires_at > NOW() LIMIT 1'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function markVerified(string $id): void
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE rb_registration_sessions SET otp_verified = 1 WHERE id = ?'
        );
        $stmt->execute([$id]);
    }

    public static function delete(string $id): void
    {
        $stmt = Database::pdo()->prepare('DELETE FROM rb_registration_sessions WHERE id = ?');
        $stmt->execute([$id]);
    }

    private static function uuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
