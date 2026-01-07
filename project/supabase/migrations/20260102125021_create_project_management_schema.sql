/*
  # Project Management System Schema

  ## Overview
  Complete schema for engineering project management system with user roles,
  projects, stages, tasks, and time tracking.

  ## New Tables

  ### `profiles`
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text: 'user', 'supervisor', 'admin')
  - `avatar_url` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `projects`
  - `id` (uuid, PK)
  - `name` (text)
  - `description` (text)
  - `status` (text: 'active', 'completed', 'on_hold')
  - `supervisor_id` (uuid, FK to profiles)
  - `start_date` (date)
  - `due_date` (date)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `project_stages`
  - `id` (uuid, PK)
  - `project_id` (uuid, FK to projects)
  - `name` (text)
  - `description` (text)
  - `order` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `tasks`
  - `id` (uuid, PK)
  - `stage_id` (uuid, FK to project_stages)
  - `title` (text)
  - `description` (text)
  - `status` (text: 'novo', 'em_desenvolvimento', 'analise_tecnica', 'concluido', 'refaca')
  - `estimated_hours` (numeric)
  - `daily_hours` (numeric)
  - `priority` (text: 'low', 'medium', 'high')
  - `order` (integer)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `task_assignments`
  - `id` (uuid, PK)
  - `task_id` (uuid, FK to tasks)
  - `user_id` (uuid, FK to profiles)
  - `assigned_at` (timestamptz)

  ### `time_entries`
  - `id` (uuid, PK)
  - `task_id` (uuid, FK to tasks)
  - `user_id` (uuid, FK to profiles)
  - `hours` (numeric)
  - `date` (date)
  - `notes` (text)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can view their assigned projects and tasks
  - Supervisors can manage their projects
  - Admins have full access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'supervisor', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  supervisor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  start_date date,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_stages table
CREATE TABLE IF NOT EXISTS project_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES project_stages(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_desenvolvimento', 'analise_tecnica', 'concluido', 'refaca')),
  estimated_hours numeric DEFAULT 0,
  daily_hours numeric DEFAULT 0,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task_assignments table
CREATE TABLE IF NOT EXISTS task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hours numeric NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view assigned projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_assignments ta
      JOIN tasks t ON ta.task_id = t.id
      JOIN project_stages ps ON t.stage_id = ps.id
      WHERE ps.project_id = projects.id AND ta.user_id = auth.uid()
    )
    OR supervisor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
  );

CREATE POLICY "Supervisors and admins can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor')));

CREATE POLICY "Supervisors can update their projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    supervisor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    supervisor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Project stages policies
CREATE POLICY "Users can view stages of assigned projects"
  ON project_stages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM task_assignments ta
      JOIN tasks t ON ta.task_id = t.id
      WHERE t.stage_id = project_stages.id AND ta.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_stages.project_id
      AND (p.supervisor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor')))
    )
  );

CREATE POLICY "Supervisors and admins can manage stages"
  ON project_stages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN profiles prof ON prof.id = auth.uid()
      WHERE p.id = project_stages.project_id
      AND (p.supervisor_id = auth.uid() OR prof.role = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN profiles prof ON prof.id = auth.uid()
      WHERE p.id = project_stages.project_id
      AND (p.supervisor_id = auth.uid() OR prof.role = 'admin')
    )
  );

-- Tasks policies
CREATE POLICY "Users can view assigned tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM task_assignments WHERE task_id = tasks.id AND user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM project_stages ps
      JOIN projects p ON p.id = ps.project_id
      WHERE ps.id = tasks.stage_id
      AND (p.supervisor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor')))
    )
  );

CREATE POLICY "Supervisors and admins can manage tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_stages ps
      JOIN projects p ON p.id = ps.project_id
      JOIN profiles prof ON prof.id = auth.uid()
      WHERE ps.id = tasks.stage_id
      AND (p.supervisor_id = auth.uid() OR prof.role = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_stages ps
      JOIN projects p ON p.id = ps.project_id
      JOIN profiles prof ON prof.id = auth.uid()
      WHERE ps.id = tasks.stage_id
      AND (p.supervisor_id = auth.uid() OR prof.role = 'admin')
    )
  );

-- Task assignments policies
CREATE POLICY "Users can view task assignments"
  ON task_assignments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_stages ps ON t.stage_id = ps.id
      JOIN projects p ON p.id = ps.project_id
      WHERE t.id = task_assignments.task_id
      AND (p.supervisor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor')))
    )
  );

CREATE POLICY "Supervisors and admins can manage assignments"
  ON task_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_stages ps ON t.stage_id = ps.id
      JOIN projects p ON p.id = ps.project_id
      JOIN profiles prof ON prof.id = auth.uid()
      WHERE t.id = task_assignments.task_id
      AND (p.supervisor_id = auth.uid() OR prof.role = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_stages ps ON t.stage_id = ps.id
      JOIN projects p ON p.id = ps.project_id
      JOIN profiles prof ON prof.id = auth.uid()
      WHERE t.id = task_assignments.task_id
      AND (p.supervisor_id = auth.uid() OR prof.role = 'admin')
    )
  );

-- Time entries policies
CREATE POLICY "Users can view own time entries"
  ON time_entries FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_stages ps ON t.stage_id = ps.id
      JOIN projects p ON p.id = ps.project_id
      WHERE t.id = time_entries.task_id
      AND (p.supervisor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor')))
    )
  );

CREATE POLICY "Users can insert own time entries"
  ON time_entries FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM task_assignments WHERE task_id = time_entries.task_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own time entries"
  ON time_entries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own time entries"
  ON time_entries FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_supervisor ON projects(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_project_stages_project ON project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_stage ON tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_user ON task_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();