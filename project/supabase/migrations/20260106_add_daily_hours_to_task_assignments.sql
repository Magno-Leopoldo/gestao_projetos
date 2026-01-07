/*
  # Migration: Add daily_hours to task_assignments

  ## Description
  Add per-user daily hours commitment to task_assignments table.

  This allows each user assigned to a task to specify their own daily hours
  commitment, independent of the task's suggested daily_hours.

  Each user has a max of 8h/day summing ALL their task assignments.

  ## Changes
  - Add `daily_hours` column to `task_assignments` (numeric, 0-8)
  - Migrate existing data from tasks.daily_hours (for backward compatibility)
  - Create index for performance optimization
*/

-- Add daily_hours column to task_assignments
ALTER TABLE task_assignments
ADD COLUMN daily_hours numeric DEFAULT 0
CHECK (daily_hours >= 0 AND daily_hours <= 8);

-- Migrate existing assignments: copy daily_hours from the task
UPDATE task_assignments ta
SET daily_hours = (
  SELECT t.daily_hours
  FROM tasks t
  WHERE t.id = ta.task_id
)
WHERE (daily_hours = 0 OR daily_hours IS NULL)
  AND EXISTS (SELECT 1 FROM tasks t WHERE t.id = ta.task_id);

-- Create index for faster validation queries
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_daily_hours
ON task_assignments(user_id, daily_hours);

-- Add column comment
COMMENT ON COLUMN task_assignments.daily_hours IS
'Número de horas diárias que este usuário se compromete a dedicar a esta tarefa (0-8). Máximo de 8h/dia é respeitado somando TODAS as tarefas do usuário.';
