export const INDIA_COUNTRY_CODE = '+91';

const LOCAL_PHONE_PATTERN = /^[6-9]\d{9}$/;

/** Strip to digits and return a 10-digit local Indian mobile, or null if empty. */
export function parseLocalIndianPhone(input: string | null | undefined): string | null {
  if (!input || input.trim() === '') return null;

  let digits = input.replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  return digits || null;
}

export function isValidLocalIndianPhone(digits: string | null | undefined): boolean {
  if (!digits) return false;
  return LOCAL_PHONE_PATTERN.test(digits);
}

/** Store as E.164-style +91XXXXXXXXXX. Returns null when input is empty. */
export function normalizeIndianPhone(input: string | null | undefined): string | null {
  const local = parseLocalIndianPhone(input);
  if (!local) return null;
  if (!isValidLocalIndianPhone(local)) {
    throw new Error('Enter a valid 10-digit Indian mobile number');
  }
  return `${INDIA_COUNTRY_CODE}${local}`;
}

/** Convert stored phone to local digits for form inputs. */
export function localPhoneFromStored(stored: string | null | undefined): string {
  if (!stored) return '';
  const local = parseLocalIndianPhone(stored);
  return local && isValidLocalIndianPhone(local) ? local : '';
}

/** Format stored phone for display. */
export function formatIndianPhone(stored: string | null | undefined): string {
  if (!stored) return '—';
  const local = parseLocalIndianPhone(stored);
  if (!local || !isValidLocalIndianPhone(local)) return stored;
  return `${INDIA_COUNTRY_CODE} ${local.slice(0, 5)} ${local.slice(5)}`;
}

export function sanitizeLocalPhoneInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

export function normalizeOptionalIndianPhone(
  input: string | null | undefined,
): { phone: string | null; error?: string } {
  if (!input || input.trim() === '') {
    return { phone: null };
  }

  const local = parseLocalIndianPhone(input);
  if (!local || !isValidLocalIndianPhone(local)) {
    return {
      phone: null,
      error: 'Enter a valid 10-digit Indian mobile number',
    };
  }

  return { phone: `${INDIA_COUNTRY_CODE}${local}` };
}
