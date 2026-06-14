import { BLOOD_GROUPS } from '@/lib/blood-groups';

export function BloodGroupSelect({
  id,
  value,
  onChange,
  required,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select blood group</option>
      {BLOOD_GROUPS.map((group) => (
        <option key={group} value={group}>
          {group}
        </option>
      ))}
    </select>
  );
}
