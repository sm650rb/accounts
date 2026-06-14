'use client';

import { sanitizeLocalPhoneInput } from '@/lib/phone';

interface PhoneInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
}

export function PhoneInput({
  id,
  value,
  onChange,
  required,
  autoComplete = 'tel-national',
}: PhoneInputProps) {
  return (
    <div className="phone-input-field">
      <div className="phone-input-wrap">
        <span className="phone-input-prefix" aria-hidden="true">
          +91
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete={autoComplete}
          required={required}
          placeholder="98765 43210"
          maxLength={10}
          value={value}
          onChange={(e) => onChange(sanitizeLocalPhoneInput(e.target.value))}
          aria-describedby={`${id}-hint`}
        />
      </div>
      <p id={`${id}-hint`} className="phone-input-hint">
        10-digit mobile number without country code
      </p>
    </div>
  );
}
