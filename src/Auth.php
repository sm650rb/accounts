<?php

declare(strict_types=1);

namespace RbAcc;

final class Auth
{
    public static function login(int $memberId): void
    {
        $_SESSION['member_id'] = $memberId;
    }

    public static function logout(): void
    {
        unset($_SESSION['member_id'], $_SESSION['google_oauth_state']);
    }

    public static function memberId(): ?int
    {
        $id = $_SESSION['member_id'] ?? null;
        return is_int($id) ? $id : (is_numeric($id) ? (int) $id : null);
    }

    public static function currentMember(): ?array
    {
        $id = self::memberId();
        if ($id === null) {
            return null;
        }
        $row = MemberRepository::findById($id);
        return $row ? MemberRepository::toPublic($row) : null;
    }

    public static function requireMember(): array
    {
        $member = self::currentMember();
        if ($member === null) {
            Http::redirect('/login');
        }
        return $member;
    }

    public static function signIn(int $memberId): array
    {
        $member = MemberRepository::findById($memberId);
        if ($member === null) {
            throw new SignInException('Account not found', 'not_found');
        }
        if ($member['membership_status'] === 'suspended') {
            throw new SignInException(
                'Your account is suspended. Contact contact@sm650.com for help.',
                'suspended'
            );
        }

        MemberRepository::activateIfPending($memberId);
        $current = MemberRepository::findById($memberId) ?? $member;
        self::login((int) $current['id']);
        return $current;
    }
}

final class SignInException extends \RuntimeException
{
    public function __construct(string $message, public readonly string $errorCode)
    {
        parent::__construct($message);
    }
}
