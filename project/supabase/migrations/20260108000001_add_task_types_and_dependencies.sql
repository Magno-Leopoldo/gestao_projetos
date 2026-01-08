/*
  # Add Task Types and Dependencies System

  ## Overview
  This migration adds support for task types (paralela, não_paralela, fixa)
  and task dependencies to enable control over task execution order and time calculation.

  ## Changes
  1. Add `task_type` column to tasks table
  2. Create `task_dependencies` table for managing task relationships
  3. Create `v_task_dependencies_active` view for validating blocking dependencies
  4. Add RLS policies for new table
*/

-- =====================================================
-- STEP 1: Add task_type column to tasks table
-- =====================================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type text NOT NULL DEFAULT 'paralela'
  CHECK (task_type IN ('paralela', 'não_paralela', 'fixa'))
  COMMENT 'Task type: paralela (reduces time with users), não_paralela (blocks until dependencies complete), fixa (fixed time)';

-- Add index for task_type filtering
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(task_type);

-- =====================================================
-- STEP 2: Create task_dependencies table
-- =====================================================

CREATE TABLE IF NOT EXISTS task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),

  -- Prevent self-dependencies and duplicates
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id),
  UNIQUE(task_id, depends_on_task_id),

  -- Indexes for performance
  CONSTRAINT task_dependencies_pkey PRIMARY KEY (id)
);

-- Indexes for faster dependency queries
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_both ON task_dependencies(task_id, depends_on_task_id);

-- =====================================================
-- STEP 3: Create view for validating blocking dependencies
-- =====================================================
-- This view shows which tasks are blocked by incomplete dependencies

DROP VIEW IF EXISTS v_task_dependencies_active;

CREATE VIEW v_task_dependencies_active AS
SELECT
  td.id as dependency_id,
  td.task_id,
  td.depends_on_task_id,
  t.title as task_title,
  dep_task.title as dependency_title,
  dep_task.status as dependency_status,
  dep_task.status = 'concluido' as is_satisfied,
  CASE
    WHEN dep_task.status = 'concluido' THEN 'satisfied'
    ELSE 'blocking'
  END as dependency_state,
  t.created_at,
  t.updated_at
FROM task_dependencies td
LEFT JOIN tasks t ON td.task_id = t.id
LEFT JOIN tasks dep_task ON td.depends_on_task_id = dep_task.id
ORDER BY td.task_id, td.depends_on_task_id;

-- =====================================================
-- STEP 4: Enable RLS on new table
-- =====================================================

ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Task dependencies policies
CREATE POLICY "Users can view dependencies of assigned tasks"
  ON task_dependencies FOR SELECT
  TO authenticated
  USING (
    -- User is assigned to the blocking task
    EXISTS (
      SELECT 1 FROM task_assignments ta
      WHERE ta.task_id = task_dependencies.task_id AND ta.user_id = auth.uid()
    )
    -- OR user is assigned to the task being blocked
    OR EXISTS (
      SELECT 1 FROM task_assignments ta
      WHERE ta.task_id = task_dependencies.depends_on_task_id AND ta.user_id = auth.uid()
    )
    -- OR user is supervisor/admin
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Supervisors and admins can manage dependencies"
  ON task_dependencies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_stages ps ON t.stage_id = ps.id
      JOIN projects p ON ps.project_id = p.id
      WHERE t.id = task_dependencies.task_id
      AND (p.supervisor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN project_stages ps ON t.stage_id = ps.id
      JOIN projects p ON ps.project_id = p.id
      WHERE t.id = task_dependencies.task_id
      AND (p.supervisor_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
    )
  );

-- =====================================================
-- STEP 5: Helper function to detect circular dependencies
-- =====================================================

DROP FUNCTION IF EXISTS check_circular_dependency(uuid, uuid);

CREATE FUNCTION check_circular_dependency(task_id uuid, new_dependency_id uuid)
RETURNS BOOLEAN
LANGUAGE SQL
AS $$
  -- Check if adding this dependency would create a cycle
  -- A cycle exists if the new_dependency_id already depends on task_id
  SELECT EXISTS (
    WITH RECURSIVE dep_chain AS (
      -- Base case: direct dependencies of new_dependency_id
      SELECT depends_on_task_id as current_id, 1 as depth
      FROM task_dependencies
      WHERE task_id = new_dependency_id

      UNION ALL

      -- Recursive case: dependencies of dependencies
      SELECT td.depends_on_task_id, dc.depth + 1
      FROM task_dependencies td
      INNER JOIN dep_chain dc ON td.task_id = dc.current_id
      WHERE dc.depth < 100  -- Limit recursion depth
    )
    SELECT 1 FROM dep_chain WHERE current_id = task_id
  );
$$;

-- =====================================================
-- STEP 6: Trigger to prevent circular dependencies
-- =====================================================

DROP TRIGGER IF EXISTS prevent_circular_dependencies ON task_dependencies;

CREATE TRIGGER prevent_circular_dependencies
BEFORE INSERT OR UPDATE ON task_dependencies
FOR EACH ROW
EXECUTE FUNCTION (
  CASE WHEN check_circular_dependency(NEW.task_id, NEW.depends_on_task_id)
    THEN RAISE EXCEPTION 'Circular dependency detected: adding this dependency would create a cycle'
    ELSE NEW
  END
);

-- =====================================================
-- STEP 7: Update comments on tasks table
-- =====================================================

COMMENT ON COLUMN tasks.task_type IS 'Type of task: paralela (time reduces with more users), não_paralela (cannot start until dependencies complete), fixa (fixed time regardless of users)';

-- =====================================================
-- STEP 8: Migration complete
-- =====================================================
/*
  Status: ✅ Complete

  New tables:
  - task_dependencies: Tracks which tasks block which other tasks

  New columns:
  - tasks.task_type: Task classification (paralela, não_paralela, fixa)

  New views:
  - v_task_dependencies_active: Shows blocking dependencies with status

  New functions:
  - check_circular_dependency(): Detects cycles in dependency graph

  New triggers:
  - prevent_circular_dependencies: Prevents circular dependency creation

  Next steps:
  1. Update backend validation functions (Phase 2)
  2. Update frontend components (Phase 3-4)
  3. Update API endpoints to handle task_type and dependencies
*/
