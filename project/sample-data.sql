-- Sample Data for Testing
-- This file contains sample data to help you test the system
-- You can run these queries after creating your first user account

-- Note: Replace the user IDs below with actual user IDs from your auth.users table
-- You can get user IDs by running: SELECT id, email FROM profiles;

-- Example: Create a supervisor profile (if not exists)
-- UPDATE profiles SET role = 'supervisor' WHERE email = 'supervisor@example.com';

-- Example: Create an admin profile (if not exists)
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- Sample Projects
-- Replace 'your-supervisor-id' with an actual supervisor user ID
/*
INSERT INTO projects (name, description, status, supervisor_id, start_date, due_date)
VALUES
  ('Sistema de Monitoramento', 'Desenvolvimento de sistema para monitoramento de equipamentos industriais', 'active', 'your-supervisor-id', '2024-01-01', '2024-06-30'),
  ('Automação de Processos', 'Implementação de automação em linha de produção', 'active', 'your-supervisor-id', '2024-02-01', '2024-05-31'),
  ('Análise Estrutural', 'Análise e reforço estrutural de edifício comercial', 'active', 'your-supervisor-id', '2024-01-15', '2024-04-30');

-- Sample Project Stages
-- You'll need to get the project IDs after inserting projects
-- SELECT id, name FROM projects;

INSERT INTO project_stages (project_id, name, description, "order")
VALUES
  ('project-id-1', 'Planejamento', 'Fase de planejamento e especificação', 1),
  ('project-id-1', 'Desenvolvimento', 'Implementação das funcionalidades', 2),
  ('project-id-1', 'Testes', 'Testes e validação', 3),
  ('project-id-1', 'Implantação', 'Deploy e treinamento', 4);

-- Sample Tasks
-- You'll need to get the stage IDs after inserting stages
-- SELECT id, name, project_id FROM project_stages;

INSERT INTO tasks (stage_id, title, description, status, estimated_hours, daily_hours, priority, "order")
VALUES
  ('stage-id-1', 'Levantamento de Requisitos', 'Reunir e documentar todos os requisitos do sistema', 'concluido', 40, 8, 'high', 1),
  ('stage-id-1', 'Desenho da Arquitetura', 'Criar diagrama e documentação da arquitetura', 'em_desenvolvimento', 30, 6, 'high', 2),
  ('stage-id-2', 'Implementar Backend', 'Desenvolver APIs e lógica de negócio', 'novo', 120, 8, 'high', 1),
  ('stage-id-2', 'Implementar Frontend', 'Desenvolver interface de usuário', 'novo', 100, 8, 'medium', 2),
  ('stage-id-3', 'Testes Unitários', 'Criar e executar testes unitários', 'refaca', 40, 4, 'medium', 1);

-- Sample Task Assignments
-- Replace 'user-id' with actual user IDs
-- SELECT id, full_name, email FROM profiles WHERE role = 'user';

INSERT INTO task_assignments (task_id, user_id)
VALUES
  ('task-id-1', 'user-id-1'),
  ('task-id-2', 'user-id-1'),
  ('task-id-3', 'user-id-2'),
  ('task-id-4', 'user-id-2'),
  ('task-id-5', 'user-id-1');

-- Sample Time Entries
INSERT INTO time_entries (task_id, user_id, hours, date, notes)
VALUES
  ('task-id-1', 'user-id-1', 8, '2024-01-05', 'Reunião com stakeholders'),
  ('task-id-1', 'user-id-1', 7.5, '2024-01-06', 'Documentação de requisitos'),
  ('task-id-2', 'user-id-1', 6, '2024-01-08', 'Pesquisa de tecnologias'),
  ('task-id-2', 'user-id-1', 5, '2024-01-09', 'Criação de diagramas');
*/

-- Quick Setup Instructions:
-- 1. Create at least 3 user accounts via the app interface
-- 2. Get their IDs: SELECT id, email, role FROM profiles;
-- 3. Update one user to supervisor: UPDATE profiles SET role = 'supervisor' WHERE email = 'supervisor@example.com';
-- 4. Update one user to admin: UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
-- 5. Use the supervisor ID to create projects
-- 6. Create stages for each project
-- 7. Create tasks for each stage
-- 8. Assign tasks to users
-- 9. Add time entries for completed work
