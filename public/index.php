<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

use RbAcc\Api;
use RbAcc\Auth;
use RbAcc\BikeColors;
use RbAcc\BloodGroups;
use RbAcc\Config;
use RbAcc\EmailVerificationRepository;
use RbAcc\GoogleOAuth;
use RbAcc\Http;
use RbAcc\MemberRepository;
use RbAcc\Phone;
use RbAcc\View;

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$uri = rtrim($uri, '/') ?: '/';

// API routes
if (str_starts_with($uri, '/api/')) {
    try {
        match ("{$method} {$uri}") {
            'POST /api/auth/login' => Api::login(),
            'POST /api/auth/logout' => Api::logout(),
            'GET /api/auth/me' => Api::me(),
            'POST /api/auth/register/phone' => Api::registerPhone(),
            'POST /api/auth/register/verify-otp' => Api::registerVerifyOtp(),
            'POST /api/auth/register/complete' => Api::registerComplete(),
            'PUT /api/profile', 'POST /api/profile' => Api::profile(),
            'GET /api/auth/google' => Api::googleStart(),
            'GET /api/auth/google/callback' => Api::googleCallback(),
            default => Http::error('Not found', 404),
        };
    } catch (\Throwable $e) {
        error_log('[api] ' . $e->getMessage());
        Http::error('Internal server error', 500);
    }
}

// Page routes
match ($uri) {
    '/login' => (function () {
        if (Auth::currentMember() !== null) {
            Http::redirect('/');
        }
        View::render('login', [
            'googleEnabled' => GoogleOAuth::isConfigured(),
            'verified' => ($_GET['verified'] ?? '') === '1',
            'error' => $_GET['error'] ?? null,
        ]);
    })(),

    '/register' => (function () {
        if (Auth::currentMember() !== null) {
            Http::redirect('/');
        }
        View::render('register', [
            'bikeColors' => BikeColors::COLORS,
            'bloodGroups' => BloodGroups::GROUPS,
            'devOtp' => Config::get('DEV_OTP', '000000'),
        ]);
    })(),

    '/verify-email' => (function () {
        $token = trim((string) ($_GET['token'] ?? ''));
        if ($token === '') {
            View::render('verify-email', [
                'title' => 'Verification link incomplete',
                'message' => 'This link is missing a verification token. Use the full link from your email.',
                'variant' => 'error',
                'showLogin' => false,
            ]);
            exit;
        }

        if ($token === 'test-smtp-check') {
            View::render('verify-email', [
                'title' => 'Test email link',
                'message' => 'That was a manual SMTP test — register on the site to get a real verification link.',
                'variant' => 'info',
                'showLogin' => false,
            ]);
            exit;
        }

        $alreadyId = EmailVerificationRepository::findVerifiedMemberIdByToken($token);
        if ($alreadyId !== null) {
            MemberRepository::activateIfPending($alreadyId);
            View::render('verify-email', [
                'title' => 'Email already verified',
                'message' => 'This link was already used. You can sign in with your email and password.',
                'variant' => 'success',
                'showLogin' => true,
            ]);
            exit;
        }

        $memberId = EmailVerificationRepository::findMemberIdByToken($token);
        if ($memberId === null) {
            View::render('verify-email', [
                'title' => 'Verification link invalid',
                'message' => 'This link is not valid — register again to receive a new link.',
                'variant' => 'error',
                'showLogin' => false,
            ]);
            exit;
        }

        $member = MemberRepository::findById($memberId);
        if ($member === null) {
            View::render('verify-email', [
                'title' => 'Account not found',
                'message' => 'We could not find the member account for this link.',
                'variant' => 'error',
                'showLogin' => false,
            ]);
            exit;
        }

        EmailVerificationRepository::markVerified($memberId);
        MemberRepository::activateIfPending($memberId);
        View::render('verify-email', [
            'title' => 'Email verified',
            'message' => $member['email'] . ' is verified. You can sign in now.',
            'variant' => 'success',
            'showLogin' => true,
        ]);
    })(),

    '/', '/profile' => (function () use ($uri) {
        $member = Auth::requireMember();
        if ($uri === '/') {
            View::render('dashboard', ['member' => $member]);
        } else {
            View::render('profile', [
                'member' => $member,
                'bikeColors' => BikeColors::COLORS,
                'bloodGroups' => BloodGroups::GROUPS,
            ]);
        }
    })(),

    default => (function () {
        http_response_code(404);
        echo 'Not found';
    })(),
};
