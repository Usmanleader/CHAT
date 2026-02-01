
export type MessageType = 'text' | 'image' | 'file';

export interface Message {
  id: string;
  created_at: string;
  content: string;
  sender_id: string;
  receiver_id?: string;
  is_ai?: boolean;
  message_type?: MessageType;
  file_name?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  status?: 'online' | 'offline';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export enum AppStatus {
  SETUP = 'SETUP',
  AUTH = 'AUTH',
  CHATTING = 'CHATTING'
}
