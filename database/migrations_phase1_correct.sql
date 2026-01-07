-- =====================================================
-- MIGRAÇÕES FASE 1: VERSÃO CORRIGIDA
-- Baseada na análise real da estrutura do banco
-- =====================================================

USE projeto_engenharia;

-- =====================================================
-- PASSO 1: ADICIONAR CAMPOS À TABELA 'tasks'
-- =====================================================

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE NULL COMMENT 'Data de início declarada pelo usuário quando clica PLAY';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS date_begin_real DATE NULL COMMENT 'Data real do primeiro PLAY (auto-preenchida)';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS company_contract VARCHAR(255) NULL COMMENT 'Contrato/empresa relacionada';

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_tasks_company ON tasks(company_contract);
CREATE INDEX IF NOT EXISTS idx_tasks_dates ON tasks(start_date, due_date);

-- =====================================================
-- PASSO 2: CRIAR TABELA 'time_entries_sessions'
-- CRÍTICO para o sistema Play/Pause/Stop
-- =====================================================

CREATE TABLE IF NOT EXISTS time_entries_sessions (
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

-- =====================================================
-- PASSO 3: CRIAR VIEW 'v_task_metrics'
-- Calcula TODAS as métricas de uma tarefa
-- CORREÇÃO: daily_hours vem de tasks, não de task_assignments
-- =====================================================

DROP VIEW IF EXISTS v_task_metrics;

CREATE VIEW v_task_metrics AS
SELECT
    t.id as task_id,
    t.title,
    t.description,
    t.company_contract,
    t.estimated_hours,
    t.daily_hours as daily_hours_task,
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

    -- daily_hours da tarefa (mesmo para todos colaboradores)
    t.daily_hours as total_daily_hours,

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

    -- DIAS NECESSÁRIOS: horas estimadas ÷ daily_hours
    CASE
        WHEN t.daily_hours > 0
        THEN CEIL(t.estimated_hours / t.daily_hours)
        ELSE NULL
    END as dias_necessarios,

    -- FIM REAL ESTIMADO: data_inicio_real + dias_necessários
    CASE
        WHEN (SELECT MIN(ts.start_time)
             FROM time_entries_sessions ts
             WHERE ts.task_id = t.id AND ts.status = 'stopped') IS NOT NULL
        AND t.daily_hours > 0
        THEN DATE_ADD(
            (SELECT MIN(ts.start_time)
             FROM time_entries_sessions ts
             WHERE ts.task_id = t.id AND ts.status = 'stopped'),
            INTERVAL CEIL(t.estimated_hours / t.daily_hours) DAY
        )
        ELSE NULL
    END as fim_real_estimado,

    -- DIAS DE ATRASO/ADIANTAMENTO
    CASE
        WHEN (SELECT MIN(ts.start_time)
             FROM time_entries_sessions ts
             WHERE ts.task_id = t.id AND ts.status = 'stopped') IS NOT NULL
        AND t.daily_hours > 0
        THEN DATEDIFF(
            DATE_ADD(
                (SELECT MIN(ts.start_time)
                 FROM time_entries_sessions ts
                 WHERE ts.task_id = t.id AND ts.status = 'stopped'),
                INTERVAL CEIL(t.estimated_hours / t.daily_hours) DAY
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
        WHEN t.daily_hours > 0 AND DATEDIFF(
            DATE_ADD(
                (SELECT MIN(ts.start_time)
                 FROM time_entries_sessions ts
                 WHERE ts.task_id = t.id AND ts.status = 'stopped'),
                INTERVAL CEIL(t.estimated_hours / t.daily_hours) DAY
            ),
            t.due_date
        ) > 5 THEN 'CRITICO'
        WHEN t.daily_hours > 0 AND DATEDIFF(
            DATE_ADD(
                (SELECT MIN(ts.start_time)
                 FROM time_entries_sessions ts
                 WHERE ts.task_id = t.id AND ts.status = 'stopped'),
                INTERVAL CEIL(t.estimated_hours / t.daily_hours) DAY
            ),
            t.due_date
        ) > 0 THEN 'RISCO'
        ELSE 'NO_PRAZO'
    END as status_risco

FROM tasks t;

-- =====================================================
-- PASSO 4: CRIAR VIEW 'v_task_assignees_metrics'
-- Métricas detalhadas POR COLABORADOR
-- CORREÇÃO: daily_hours vem de tasks, não de task_assignments
-- =====================================================

DROP VIEW IF EXISTS v_task_assignees_metrics;

CREATE VIEW v_task_assignees_metrics AS
SELECT
    ta.task_id,
    ta.user_id,
    u.full_name,
    t.estimated_hours,
    t.daily_hours as task_daily_hours,

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

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 1
-- =====================================================
-- Status: ✅ Completo
-- Próximo passo: Implementar endpoints backend (FASE 2)
-- =====================================================
