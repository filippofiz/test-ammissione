export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'STUDENT' | 'TUTOR' | 'ADMIN';
export type PlatformVersion = 'v1' | 'v2' | 'all';

export interface Profile {
  id: string;
  auth_uid: string | null;
  email: string;
  name: string;
  roles: UserRole[];
  tutor_id: string | null;
  tests: Json;
  esigenze_speciali: boolean;
  must_change_password: boolean;
  last_password_change: string | null;
  platform_version: PlatformVersion;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      '2V_profiles': {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
