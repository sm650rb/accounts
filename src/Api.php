<?php

declare(strict_types=1);

namespace RbAcc;

final class Api
{
    public static function login(): void
    {
        $data = Http::readJson();
        $email = Http::sanitizeEmail((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');

        if (!Http::isValidEmail($email)) {
            Http::error('Valid email is required', 422);
        }
        if ($password === '') {
            Http::error('Password is required', 422);
        }

        $member = MemberRepository::findByEmail($email);
        if ($member === null || !password_verify($password, $member['password_hash'])) {
            Http::error('Invalid email or password', 401);
        }

        if (!EmailVerificationRepository::isVerified((int) $member['id'])) {
            Http::error(
                'Please verify your email before signing in. Check your inbox for the verification link.',
                403
            );
        }

        try {
            $current = Auth::signIn((int) $member['id']);
            Http::json([
                'member' => MemberRepository::toPublic($current),
                'message' => 'Signed in',
            ]);
        } catch (SignInException $e) {
            Http::error($e->getMessage(), $e->errorCode === 'suspended' ? 403 : 401);
        }
    }

    public static function logout(): void
    {
        Auth::logout();
        Http::json(['message' => 'Signed out']);
    }

    public static function me(): void
    {
        $member = Auth::currentMember();
        if ($member === null) {
            Http::error('Not authenticated', 401);
        }
        Http::json(['member' => $member]);
    }

    public static function registerPhone(): void
    {
        $data = Http::readJson();
        $phoneResult = Phone::normalizeOptional((string) ($data['phone'] ?? ''));
        if (isset($phoneResult['error']) || $phoneResult['phone'] === null) {
            Http::error($phoneResult['error'] ?? 'Phone number is required', 422);
        }

        if (MemberRepository::findByPhone($phoneResult['phone']) !== null) {
            Http::error('An account with this phone number already exists', 409);
        }

        $session = RegistrationSessionRepository::create($phoneResult['phone']);
        Http::json([
            'session_id' => $session['id'],
            'message' => 'OTP sent to your phone',
        ]);
    }

    public static function registerVerifyOtp(): void
    {
        $data = Http::readJson();
        $sessionId = trim((string) ($data['session_id'] ?? ''));
        $otp = trim((string) ($data['otp'] ?? ''));

        if ($sessionId === '') {
            Http::error('Registration session is required', 422);
        }
        if ($otp === '') {
            Http::error('OTP is required', 422);
        }

        $session = RegistrationSessionRepository::find($sessionId);
        if ($session === null) {
            Http::error('Registration session expired. Please start again.', 410);
        }
        if (!Otp::isMatch($otp, $session['otp_code'])) {
            Http::error('Invalid OTP', 401);
        }

        RegistrationSessionRepository::markVerified($sessionId);
        Http::json(['session_id' => $sessionId, 'message' => 'Phone verified']);
    }

    public static function registerComplete(): void
    {
        $data = Http::readJson();
        $sessionId = trim((string) ($data['session_id'] ?? ''));
        if ($sessionId === '') {
            Http::error('Registration session is required', 422);
        }

        $session = RegistrationSessionRepository::find($sessionId);
        if ($session === null || !(bool) $session['otp_verified']) {
            Http::error('Phone verification required. Please complete OTP step.', 403);
        }

        $email = Http::sanitizeEmail((string) ($data['email'] ?? ''));
        $password = (string) ($data['password'] ?? '');
        $fullName = trim((string) ($data['full_name'] ?? ''));

        if ($fullName === '') {
            Http::error('Full name is required', 422);
        }
        if (!Http::isValidEmail($email)) {
            Http::error('Valid email is required', 422);
        }
        if (strlen($password) < 8) {
            Http::error('Password must be at least 8 characters', 422);
        }

        $bikeColor = Http::trimOrNull($data['bike_color'] ?? null);
        if ($bikeColor === null) {
            Http::error('Bike colour is required', 422);
        }
        if (!BikeColors::isValid($bikeColor)) {
            Http::error('Please select a valid SM650 colour', 422);
        }

        $bloodGroup = BloodGroups::normalize((string) ($data['blood_group'] ?? ''));
        if ($bloodGroup === null) {
            Http::error('Blood group is required', 422);
        }
        if (!BloodGroups::isValid($bloodGroup)) {
            Http::error('Please select a valid blood group', 422);
        }

        if (MemberRepository::findByEmail($email) !== null) {
            Http::error('An account with this email already exists', 409);
        }
        if (MemberRepository::findByPhone($session['phone']) !== null) {
            Http::error('An account with this phone number already exists', 409);
        }

        $emergency = Phone::normalizeOptional((string) ($data['emergency_contact_phone'] ?? ''));
        if (isset($emergency['error'])) {
            Http::error($emergency['error'], 422);
        }

        $token = Otp::generateToken();
        $member = MemberRepository::create([
            'email' => $email,
            'password_hash' => password_hash($password, PASSWORD_BCRYPT),
            'full_name' => $fullName,
            'phone' => $session['phone'],
            'blood_group' => $bloodGroup,
            'bike_color' => $bikeColor,
            'bike_registration' => Http::trimOrNull($data['bike_registration'] ?? null),
            'emergency_contact_name' => Http::trimOrNull($data['emergency_contact_name'] ?? null),
            'emergency_contact_phone' => $emergency['phone'],
        ]);

        EmailVerificationRepository::create((int) $member['id'], $token);
        RegistrationSessionRepository::delete($sessionId);

        $verifyUrl = Config::appUrl() . '/verify-email?token=' . urlencode($token);
        Mailer::sendVerification($email, $verifyUrl, $fullName);

        Http::json([
            'message' => 'Account created. Check your email to verify your address before signing in.',
            'email' => $email,
        ], 201);
    }

    public static function profile(): void
    {
        $current = Auth::currentMember();
        if ($current === null) {
            Http::error('Not authenticated', 401);
        }

        $row = MemberRepository::findById((int) $current['id']);
        if ($row === null) {
            Http::error('Not authenticated', 401);
        }

        $data = Http::readJson();
        $fullName = trim((string) ($data['full_name'] ?? $row['full_name']));
        if ($fullName === '') {
            Http::error('Full name is required', 422);
        }

        $bikeColor = Http::trimOrNull($data['bike_color'] ?? $row['bike_color']);
        if (!BikeColors::isValid($bikeColor)) {
            Http::error('Please select a valid SM650 colour', 422);
        }

        $bloodGroup = array_key_exists('blood_group', $data)
            ? BloodGroups::normalize((string) $data['blood_group'])
            : $row['blood_group'];
        if (!BloodGroups::isValid($bloodGroup)) {
            Http::error('Please select a valid blood group', 422);
        }

        $passwordHash = $row['password_hash'];
        $newPassword = (string) ($data['password'] ?? '');
        $currentPassword = (string) ($data['current_password'] ?? '');
        if ($newPassword !== '') {
            if (strlen($newPassword) < 8) {
                Http::error('New password must be at least 8 characters', 422);
            }
            if ($currentPassword === '' || !password_verify($currentPassword, $row['password_hash'])) {
                Http::error('Current password is incorrect', 401);
            }
            $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);
        }

        $phoneInput = array_key_exists('phone', $data) ? $data['phone'] : $row['phone'];
        $phoneResult = Phone::normalizeOptional(is_string($phoneInput) ? $phoneInput : null);
        if (isset($phoneResult['error'])) {
            Http::error($phoneResult['error'], 422);
        }

        $emergency = Phone::normalizeOptional((string) ($data['emergency_contact_phone'] ?? ''));
        if (isset($emergency['error'])) {
            Http::error($emergency['error'], 422);
        }

        $updated = MemberRepository::update((int) $row['id'], [
            'full_name' => $fullName,
            'phone' => $phoneResult['phone'],
            'blood_group' => $bloodGroup,
            'bike_color' => $bikeColor,
            'bike_registration' => Http::trimOrNull($data['bike_registration'] ?? null),
            'emergency_contact_name' => Http::trimOrNull($data['emergency_contact_name'] ?? null),
            'emergency_contact_phone' => $emergency['phone'],
            'password_hash' => $passwordHash,
        ]);

        Http::json([
            'member' => MemberRepository::toPublic($updated),
            'message' => 'Profile updated',
        ]);
    }

    public static function googleStart(): void
    {
        if (!GoogleOAuth::isConfigured()) {
            Http::error('Google sign-in is not configured', 503);
        }
        $state = GoogleOAuth::createState();
        $_SESSION['google_oauth_state'] = $state;
        Http::redirect(GoogleOAuth::authUrl($state));
    }

    public static function googleCallback(): void
    {
        $base = Config::appUrl() . '/login';
        $error = $_GET['error'] ?? null;
        if ($error !== null) {
            $code = $error === 'access_denied' ? 'google_denied' : 'google_failed';
            Http::redirect($base . '?error=' . urlencode($code));
        }

        $state = $_GET['state'] ?? '';
        $expected = $_SESSION['google_oauth_state'] ?? '';
        unset($_SESSION['google_oauth_state']);

        if ($state === '' || $expected === '' || !hash_equals($expected, $state)) {
            Http::redirect($base . '?error=google_state');
        }

        $code = $_GET['code'] ?? '';
        if ($code === '') {
            Http::redirect($base . '?error=google_failed');
        }

        try {
            $googleUser = GoogleOAuth::verifyCode($code);
            if (!$googleUser['email_verified']) {
                Http::redirect($base . '?error=google_email_unverified');
            }

            $email = Http::sanitizeEmail($googleUser['email']);
            $member = MemberRepository::findByEmail($email);
            if ($member === null) {
                Http::redirect($base . '?error=google_no_account');
            }
            if (Http::sanitizeEmail($member['email']) !== $email) {
                Http::redirect($base . '?error=google_email_mismatch');
            }

            EmailVerificationRepository::ensureVerified((int) $member['id']);
            Auth::signIn((int) $member['id']);
            Http::redirect(Config::appUrl() . '/');
        } catch (SignInException $e) {
            Http::redirect($base . '?error=' . ($e->errorCode === 'suspended' ? 'suspended' : 'google_failed'));
        } catch (\Throwable $e) {
            error_log('[google-oauth] ' . $e->getMessage());
            Http::redirect($base . '?error=google_failed');
        }
    }
}
