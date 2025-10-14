import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserType = 'doctor' | 'patient';

export interface UserProfile {
  id?: string;
  firebase_uid: string;
  user_type: UserType;
  full_name: string;
  email?: string | null;
  phone_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  certificate_url: string;
  is_verified: boolean;
  google_id?: string | null;
  created_at: string;
  updated_at: string;
}
