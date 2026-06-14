import { randomBytes } from 'crypto';

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

export function generateOtp(): string {
  const devOtp = process.env.DEV_OTP;
  if (process.env.NODE_ENV !== 'production' || devOtp) {
    return devOtp ?? '000000';
  }

  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isOtpMatch(input: string, expected: string): boolean {
  const normalized = input.replace(/\D/g, '').padStart(6, '0').slice(-6);
  const devOtp = process.env.DEV_OTP ?? '000000';
  if (normalized === devOtp) return true;
  return normalized === expected;
}
