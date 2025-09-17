// ENUMs matching the PostgreSQL types
export type UserRole = "officer" | "cvo" | "legal_board" | "admin" | "owner";
export type AccountStatus =
  | "pending_verification"
  | "active"
  | "inactive"
  | "suspended";

// Represents the `users` table (for authentication)
export interface User {
  id: string; // UUID
  email: string;
  password_hash: string;
  role: UserRole;
  account_status: AccountStatus;
  mfa_enabled: boolean;
  mfa_secret?: string;
  created_at: Date;
  updated_at: Date;
}

// Represents the `user_profiles` table
export interface UserProfile {
  user_id: string; // UUID
  first_name: string;
  last_name: string;
  employee_id?: string;
  cadre_service?: string;
  designation_rank?: string;
  profile_photo_url?: string;
  head_office_address?: string;
  branch_office_address?: string;
  country?: string;
  state?: string;
  district?: string;
  city?: string;
  preferred_language: string;
  updated_at: Date;
}

// A combined type that is useful for service layers
export type UserWithProfile = User & UserProfile;
