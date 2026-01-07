// Supabase não é mais usado - migrado para API REST
// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'supervisor' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold';
  supervisor_id?: string;
  start_date?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
};

export type ProjectStage = {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  order: number;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  stage_id: string;
  title: string;
  description?: string;
  status: 'novo' | 'em_desenvolvimento' | 'analise_tecnica' | 'concluido' | 'refaca';
  estimated_hours: number;
  daily_hours: number;
  priority: 'low' | 'medium' | 'high';
  order: number;
  created_at: string;
  updated_at: string;
};

export type TaskAssignment = {
  id: string;
  task_id: string;
  user_id: string;
  assigned_at: string;
};

export type TimeEntry = {
  id: string;
  task_id: string;
  user_id: string;
  hours: number;
  date: string;
  notes?: string;
  created_at: string;
};
