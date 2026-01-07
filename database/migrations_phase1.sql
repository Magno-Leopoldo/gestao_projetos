-- =====================================================
-- MIGRAÇÕES FASE 1: BANCO DE DADOS
-- Sistema de Gestão de Projetos - Play/Pause/Stop
-- =====================================================
-- Arquivo para executar no HeidiSQL
-- Data: 05/01/2026
-- =====================================================

USE projeto_engenharia;

-- =====================================================
-- PASSO 1: ADICIONAR CAMPOS À TABELA 'tasks'
-- =====================================================

-- Nota: Se der erro dizendo que o campo já existe, é seguro ignorar
-- Os campos abaixo podem já estar presentes

-- Tentar adicionar start_date
ALTER TABLE tasks ADD COLUMN start_date DATE NULL COMMENT 'Data de início declarada pelo user quando clica PLAY';

-- Se o comando acima falhar, tente modificar (case sensitivity)
-- Tentar adicionar date_begin_real
ALTER TABLE tasks ADD COLUMN date_begin_real DATE NULL COMMENT 'Data real do primeiro PLAY (auto-preenchida)';

-- Criar índices para performance
-- Se der erro de "índice duplicado", é seguro ignorar
CREATE INDEX idx_tasks_company ON tasks(company_contract);
CREATE INDEX idx_tasks_dates ON tasks(start_date, due_date);

-- Verificar estrutura final
SELECT 'Campos na tabela tasks:' as Status;
DESCRIBE tasks;

-- Verificar índices criados
SELECT 'Índices na tabela tasks:' as Status;
SHOW INDEX FROM tasks;

-- =====================================================
-- PASSO 2: CRIAR TABELA 'time_entries_sessions'
-- Esta tabela rastreia cada sessão de trabalho (Play/Pause/Stop)
-- =====================================================

CREATE TABLE time_entries_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,

    -- Timestamps exatos
    start_time DATETIME NOT NULL COMMENT 'Quando clicou PLAY',
    pause_time DATETIME NULL COMMENT 'Quando clicou PAUSE',
    resume_time DATETIME NULL COMMENT 'Quando clicou PLAY após PAUSE',
    end_time DATETIME NULL COMMENT 'Quando clicou STOP (finaliza)',

    -- Duração calculada
    duration_minutes INT NULL COMMENT 'Minutos trabalhados',
    duration_hours DECIMAL(5, 2) NULL COMMENT 'Horas (duration_minutes ÷ 60)',

    -- Status
    status ENUM('running', 'paused', 'stopped') NOT NULL DEFAULT 'running'
        COMMENT 'running=em andamento, paused=pausado, stopped=finalizado',

    -- Metadados
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign keys
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- Índices para performance
    INDEX idx_task_user (task_id, user_id),
    INDEX idx_task_date (task_id, created_at),
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_status (status)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Sessões de trabalho rastreadas com Play/Pause/Stop';

-- Verificar se tabela foi criada
DESCRIBE time_entries_sessions;

-- =====================================================
-- PASSO 3: CRIAR VIEW 'v_task_metrics'
-- Calcula TODAS as métricas de uma tarefa
-- =====================================================

CREATE VIEW v_task_metrics AS
SELECT
    t.id as task_id,
    t.title,
    t.description,
    t.company_contract,
    t.estimated_hours,
    t.due_date,
    t.status,

    -- Data de início real (primeira sessão)
    (SELECT MIN(ts.start_time)
     FROM time_entries_sessions ts
     WHERE ts.task_id = t.id AND ts.status = 'stopped') as data_inicio_real,

    -- Total de horas reais investidas
    COALESCE((SELECT SUM(ts.duration_hours)
     FROM time_entries_sessions ts
     WHERE ts.task_id = t.id AND ts.status = 'stopped'), 0) as total_horas_reais,

    -- Total de colaboradores
    (SELECT COUNT(DISTINCT user_id)
     FROM task_assignments
     WHERE task_id = t.id) as total_colaboradores,

    -- Sum de daily_hours de todos colaboradores
    COALESCE((SELECT SUM(daily_hours)
     FROM task_assignments
     WHERE task_id = t.id), 0) as total_daily_hours,

    -- TAXA MÉDIA: tempo real vs estimado (%)
    CASE
        WHEN t.estimated_hours > 0
        THEN ROUND(
            (COALESCE((SELECT SUM(ts.duration_hours)
             FROM time_entries_sessions ts
             WHERE ts.task_id = t.id AND ts.status = 'stopped'), 0) / t.estimated_hours) * 100,
            2
        )
        ELSE 0
    END as taxa_media_percent,

    -- DIAS NECESSÁRIOS: horas estimadas ÷ daily_hours total
    CASE
        WHEN COALESCE((SELECT SUM(daily_hours)
             FROM task_assignments
             WHERE task_id = t.id), 0) > 0
        THEN CEIL(t.estimated_hours / COALESCE((SELECT SUM(daily_hours)
             FROM task_assignments
             WHERE task_id = t.id), 0))
        ELSE NULL
    END as dias_necessarios,

    -- FIM REAL ESTIMADO: data_inicio_real + dias_necessários
    CASE
        WHEN (SELECT MIN(ts.start_time)
             FROM time_entries_sessions ts
             WHERE ts.task_id = t.id AND ts.status = 'stopped') IS NOT NULL
        AND COALESCE((SELECT SUM(daily_hours)
             FROM task_assignments
             WHERE task_id = t.id), 0) > 0
        THEN DATE_ADD(
            (SELECT MIN(ts.start_time)
             FROM time_entries_sessions ts
             WHERE ts.task_id = t.id AND ts.status = 'stopped'),
            INTERVAL CEIL(t.estimated_hours / COALESCE((SELECT SUM(daily_hours)
             FROM task_assignments
             WHERE task_id = t.id), 0)) DAY
        )
        ELSE NULL
    END as fim_real_estimado,

    -- DIAS DE ATRASO/ADIANTAMENTO
    CASE
        WHEN (SELECT MIN(ts.start_time)
             FROM time_entries_sessions ts
             WHERE ts.task_id = t.id AND ts.status = 'stopped') IS NOT NULL
        AND COALESCE((SELECT SUM(daily_hours)
             FROM task_assignments
             WHERE task_id = t.id), 0) > 0
        THEN DATEDIFF(
            DATE_ADD(
                (SELECT MIN(ts.start_time)
                 FROM time_entries_sessions ts
                 WHERE ts.task_id = t.id AND ts.status = 'stopped'),
                INTERVAL CEIL(t.estimated_hours / COALESCE((SELECT SUM(daily_hours)
                 FROM task_assignments
                 WHERE task_id = t.id), 0)) DAY
            ),
            t.due_date
        )
        ELSE NULL
    END as dias_diferenca,

    -- STATUS DE RISCO
    CASE
        WHEN COALESCE((SELECT COUNT(DISTINCT user_id)
             FROM task_assignments
             WHERE task_id = t.id), 0) = 0 THEN 'CRITICO'
        WHEN DATEDIFF(
            DATE_ADD(
                (SELECT MIN(ts.start_time)
                 FROM time_entries_sessions ts
                 WHERE ts.task_id = t.id AND ts.status = 'stopped'),
                INTERVAL CEIL(t.estimated_hours / COALESCE((SELECT SUM(daily_hours)
                 FROM task_assignments
                 WHERE task_id = t.id), 0)) DAY
            ),
            t.due_date
        ) > 5 THEN 'CRITICO'
        WHEN DATEDIFF(
            DATE_ADD(
                (SELECT MIN(ts.start_time)
                 FROM time_entries_sessions ts
                 WHERE ts.task_id = t.id AND ts.status = 'stopped'),
                INTERVAL CEIL(t.estimated_hours / COALESCE((SELECT SUM(daily_hours)
                 FROM task_assignments
                 WHERE task_id = t.id), 0)) DAY
            ),
            t.due_date
        ) > 0 THEN 'RISCO'
        ELSE 'NO_PRAZO'
    END as status_risco

FROM tasks t;

-- Verificar se view foi criada
SELECT * FROM v_task_metrics LIMIT 1;

-- =====================================================
-- PASSO 4: CRIAR VIEW 'v_task_assignees_metrics'
-- Métricas detalhadas POR COLABORADOR
-- =====================================================

CREATE VIEW v_task_assignees_metrics AS
SELECT
    ta.task_id,
    ta.user_id,
    u.full_name,
    t.estimated_hours,
    ta.daily_hours,

    -- Horas estimadas divididas igualmente entre colaboradores
    ROUND(
        t.estimated_hours / COALESCE((SELECT COUNT(DISTINCT user_id)
         FROM task_assignments
         WHERE task_id = ta.task_id), 1),
        2
    ) as horas_estimadas_user,

    -- Horas reais investidas por este usuário
    COALESCE((SELECT SUM(ts.duration_hours)
     FROM time_entries_sessions ts
     WHERE ts.task_id = ta.task_id
       AND ts.user_id = ta.user_id
       AND ts.status = 'stopped'), 0) as horas_registradas,

    -- Taxa de progresso individual (%)
    CASE
        WHEN t.estimated_hours > 0
        THEN ROUND(
            (COALESCE((SELECT SUM(ts.duration_hours)
             FROM time_entries_sessions ts
             WHERE ts.task_id = ta.task_id
               AND ts.user_id = ta.user_id
               AND ts.status = 'stopped'), 0) /
            (t.estimated_hours / COALESCE((SELECT COUNT(DISTINCT user_id)
             FROM task_assignments
             WHERE task_id = ta.task_id), 1))
            ) * 100,
            2
        )
        ELSE 0
    END as taxa_progresso_user,

    -- Dias de trabalho
    (SELECT COUNT(DISTINCT DATE(ts.start_time))
     FROM time_entries_sessions ts
     WHERE ts.task_id = ta.task_id
       AND ts.user_id = ta.user_id
       AND ts.status = 'stopped') as dias_trabalho,

    -- Status
    CASE
        WHEN (SELECT SUM(ts.duration_hours)
              FROM time_entries_sessions ts
              WHERE ts.task_id = ta.task_id
                AND ts.user_id = ta.user_id
                AND ts.status = 'stopped') IS NULL THEN 'SEM_INICIAR'
        WHEN (SELECT SUM(ts.duration_hours)
              FROM time_entries_sessions ts
              WHERE ts.task_id = ta.task_id
                AND ts.user_id = ta.user_id
                AND ts.status = 'stopped') <
            (t.estimated_hours / COALESCE((SELECT COUNT(DISTINCT user_id)
             FROM task_assignments
             WHERE task_id = ta.task_id), 1))
        THEN 'EM_PROGRESSO'
        ELSE 'CONCLUIDO'
    END as status_user

FROM task_assignments ta
LEFT JOIN users u ON ta.user_id = u.id
LEFT JOIN tasks t ON ta.task_id = t.id;

-- Verificar se view foi criada
SELECT * FROM v_task_assignees_metrics LIMIT 1;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- 1. Verificar campos na tabela tasks
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'tasks'
  AND COLUMN_NAME IN ('company_contract', 'start_date', 'date_begin_real');

-- 2. Verificar tabela time_entries_sessions
SHOW TABLES LIKE 'time_entries_sessions';
DESCRIBE time_entries_sessions;

-- 3. Verificar views
SHOW TABLES WHERE Table_Type = 'VIEW' AND Tables_in_projeto_engenharia IN ('v_task_metrics', 'v_task_assignees_metrics');

-- =====================================================
-- BACKUP E RESTAURAÇÃO (OPCIONAL)
-- Se algo der errado, execute o rollback abaixo
-- =====================================================

/*
-- ROLLBACK (descomente se precisar desfazer)

-- Remover campos adicionados
ALTER TABLE tasks DROP COLUMN company_contract;
ALTER TABLE tasks DROP COLUMN start_date;
ALTER TABLE tasks DROP COLUMN date_begin_real;

-- Remover índices
DROP INDEX idx_tasks_company ON tasks;
DROP INDEX idx_tasks_dates ON tasks;

-- Remover tabela
DROP TABLE time_entries_sessions;

-- Remover views
DROP VIEW v_task_metrics;
DROP VIEW v_task_assignees_metrics;

*/

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 1
-- =====================================================
-- Status: ✅ Completo
-- Próximo passo: Implementar endpoints backend (FASE 2)
-- =====================================================
