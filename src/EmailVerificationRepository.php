<?php

declare(strict_types=1);

namespace RbAcc;

final class EmailVerificationRepository
{
    public static function isVerified(int $memberId): bool
    {
        $stmt = Database::pdo()->prepare(
            'SELECT verified_at FROM rb_email_verifications
             WHERE member_id = ? AND verified_at IS NOT NULL LIMIT 1'
        );
        $stmt->execute([$memberId]);
        return (bool) $stmt->fetch();
    }

    public static function create(int $memberId, string $token): void
    {
        $stmt = Database::pdo()->prepare(
            'INSERT INTO rb_email_verifications (member_id, token, sent_at)
             VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE token = VALUES(token), sent_at = NOW(), verified_at = NULL'
        );
        $stmt->execute([$memberId, $token]);
    }

    public static function findMemberIdByToken(string $token): ?int
    {
        $stmt = Database::pdo()->prepare(
            'SELECT member_id FROM rb_email_verifications
             WHERE token = ? AND verified_at IS NULL LIMIT 1'
        );
        $stmt->execute([$token]);
        $row = $stmt->fetch();
        return $row ? (int) $row['member_id'] : null;
    }

    public static function findVerifiedMemberIdByToken(string $token): ?int
    {
        $stmt = Database::pdo()->prepare(
            'SELECT member_id FROM rb_email_verifications
             WHERE token = ? AND verified_at IS NOT NULL LIMIT 1'
        );
        $stmt->execute([$token]);
        $row = $stmt->fetch();
        return $row ? (int) $row['member_id'] : null;
    }

    public static function markVerified(int $memberId): void
    {
        $stmt = Database::pdo()->prepare(
            'UPDATE rb_email_verifications SET verified_at = NOW() WHERE member_id = ?'
        );
        $stmt->execute([$memberId]);
    }

    public static function ensureVerified(int $memberId): void
    {
        if (self::isVerified($memberId)) {
            return;
        }

        $stmt = Database::pdo()->prepare(
            'SELECT member_id FROM rb_email_verifications WHERE member_id = ? LIMIT 1'
        );
        $stmt->execute([$memberId]);
        if ($stmt->fetch()) {
            self::markVerified($memberId);
            return;
        }

        $insert = Database::pdo()->prepare(
            'INSERT INTO rb_email_verifications (member_id, token, sent_at, verified_at)
             VALUES (?, NULL, NOW(), NOW())'
        );
        $insert->execute([$memberId]);
    }
}
