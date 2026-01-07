-- =====================================================
-- SCRIPT DE TESTE DE CONEXÃO E VERIFICAÇÃO
-- Execute este script após rodar o schema.sql
-- =====================================================

-- Verificar versão do MySQL
SELECT VERSION() AS mysql_version;

-- Listar todas as tabelas
SHOW TABLES;

-- Contar registros em cada tabela
SELECT 'users' AS tabela, COUNT(*) AS total FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'project_stages', COUNT(*) FROM project_stages
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'task_assignments', COUNT(*) FROM task_assignments
UNION ALL
SELECT 'time_entries', COUNT(*) FROM time_entries;

-- Ver usuários de exemplo
SELECT
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM users
ORDER BY role, full_name;

-- Ver projeto de exemplo
SELECT
    p.id,
    p.name,
    p.status,
    p.start_date,
    p.due_date,
    u.full_name AS supervisor
FROM projects p
LEFT JOIN users u ON p.supervisor_id = u.id;

-- Ver etapas do projeto
SELECT
    id,
    name,
    `order`,
    is_parallel,
    (SELECT COUNT(*) FROM tasks WHERE stage_id = ps.id) AS total_tasks
FROM project_stages ps
WHERE project_id = 1
ORDER BY `order`;

-- Ver tarefas com informações completas
SELECT
    t.id,
    t.title,
    t.status,
    t.estimated_hours,
    t.daily_hours,
    t.priority,
    ps.name AS stage_name,
    GROUP_CONCAT(u.full_name SEPARATOR ', ') AS assigned_to
FROM tasks t
INNER JOIN project_stages ps ON t.stage_id = ps.id
LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
LEFT JOIN users u ON ta.user_id = u.id
GROUP BY t.id, t.title, t.status, t.estimated_hours, t.daily_hours, t.priority, ps.name
ORDER BY ps.order, t.order;

-- Testar a stored procedure de cálculo de prazo
CALL sp_calculate_project_deadline(1);

-- Ver estatísticas de usuários (usando a view)
SELECT * FROM vw_user_statistics;

-- Verificar triggers
SHOW TRIGGERS;

-- Verificar procedures
SHOW PROCEDURE STATUS WHERE Db = 'projeto_engenharia';

-- Verificar views
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- =====================================================
-- TESTE DE VALIDAÇÃO DE LIMITE DE 8 HORAS
-- =====================================================

-- Ver horas alocadas por usuário
SELECT
    u.full_name,
    SUM(t.daily_hours) AS total_daily_hours,
    8 - SUM(t.daily_hours) AS available_hours
FROM users u
INNER JOIN task_assignments ta ON u.id = ta.user_id
INNER JOIN tasks t ON ta.task_id = t.id
WHERE t.status NOT IN ('concluido', 'cancelado')
GROUP BY u.id, u.full_name
ORDER BY total_daily_hours DESC;

-- =====================================================
-- TESTE CONCLUÍDO
-- =====================================================
SELECT '✅ Banco de dados configurado com sucesso!' AS status;
