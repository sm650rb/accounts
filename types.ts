export interface Member {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  blood_group: string | null;
  bike_model: string;
  bike_color: string | null;
  bike_registration: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  membership_status: 'pending' | 'active' | 'suspended';
  created_at: string;
}

export interface MemberRow extends Member {
  password_hash: string;
  updated_at: string;
}

export interface AuthResponse {
  member: Member;
  message?: string;
}

export interface ApiError {
  error: string;
}
