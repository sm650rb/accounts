<?php

declare(strict_types=1);

namespace RbAcc;

final class GoogleOAuth
{
    public static function isConfigured(): bool
    {
        return Config::get('GOOGLE_CLIENT_ID') !== null && Config::get('GOOGLE_CLIENT_SECRET') !== null;
    }

    public static function redirectUri(): string
    {
        return Config::appUrl() . '/api/auth/google/callback';
    }

    public static function authUrl(string $state): string
    {
        $params = http_build_query([
            'client_id' => Config::require('GOOGLE_CLIENT_ID'),
            'redirect_uri' => self::redirectUri(),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'access_type' => 'online',
            'prompt' => 'select_account',
        ]);
        return 'https://accounts.google.com/o/oauth2/v2/auth?' . $params;
    }

    public static function createState(): string
    {
        return bin2hex(random_bytes(16));
    }

    /** @return array{email:string,email_verified:bool,name:string} */
    public static function verifyCode(string $code): array
    {
        $body = http_build_query([
            'code' => $code,
            'client_id' => Config::require('GOOGLE_CLIENT_ID'),
            'client_secret' => Config::require('GOOGLE_CLIENT_SECRET'),
            'redirect_uri' => self::redirectUri(),
            'grant_type' => 'authorization_code',
        ]);

        $response = self::post('https://oauth2.googleapis.com/token', $body);
        if (!isset($response['id_token'])) {
            throw new \RuntimeException('Missing Google ID token');
        }

        $info = self::get('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($response['id_token']));
        if (empty($info['email'])) {
            throw new \RuntimeException('Google account has no email');
        }

        return [
            'email' => (string) $info['email'],
            'email_verified' => ($info['email_verified'] ?? 'false') === 'true',
            'name' => (string) ($info['name'] ?? ''),
        ];
    }

    /** @return array<string, mixed> */
    private static function post(string $url, string $body): array
    {
        $ctx = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => $body,
                'ignore_errors' => true,
            ],
        ]);
        $raw = file_get_contents($url, false, $ctx);
        if ($raw === false) {
            throw new \RuntimeException('Google token request failed');
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            throw new \RuntimeException('Invalid Google token response');
        }
        if (isset($data['error'])) {
            throw new \RuntimeException('Google OAuth error: ' . ($data['error_description'] ?? $data['error']));
        }
        return $data;
    }

    /** @return array<string, mixed> */
    private static function get(string $url): array
    {
        $raw = file_get_contents($url);
        if ($raw === false) {
            throw new \RuntimeException('Google tokeninfo request failed');
        }
        $data = json_decode($raw, true);
        if (!is_array($data) || isset($data['error'])) {
            throw new \RuntimeException('Invalid Google ID token');
        }
        return $data;
    }
}
