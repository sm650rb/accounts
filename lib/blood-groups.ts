export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export function isValidBloodGroup(value: string | null | undefined): boolean {
  if (!value || value.trim() === '') return true;
  return BLOOD_GROUPS.includes(value.trim().toUpperCase() as BloodGroup);
}

export function normalizeBloodGroup(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null;
  const normalized = value.trim().toUpperCase();
  return isValidBloodGroup(normalized) ? normalized : null;
}
