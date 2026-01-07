-- =====================================================
-- MIGRAÇÕES FASE 4: DAILY HOURS POR USUÁRIO
-- Adiciona coluna daily_hours em task_assignments
-- =====================================================

USE projeto_engenharia;

-- =====================================================
-- ADICIONAR COLUNA daily_hours EM task_assignments
-- =====================================================

-- Adicionar coluna com default 0
ALTER TABLE task_assignments ADD COLUMN IF NOT EXISTS daily_hours DECIMAL(5, 2) DEFAULT 0
  COMMENT 'Horas diárias que este usuário se compromete a dedicar a esta tarefa (0-8)';

-- Adicionar constraint CHECK (opcional, mas recomendado)
-- Nota: MySQL 5.7+ suporta CHECK constraints
-- ALTER TABLE task_assignments ADD CONSTRAINT check_daily_hours
--   CHECK (daily_hours >= 0 AND daily_hours <= 8);

-- =====================================================
-- MIGRAR DADOS EXISTENTES
-- =====================================================

-- Copiar daily_hours da tabela tasks para task_assignments
-- Isso garante backward compatibility com assignments antigos
UPDATE task_assignments ta
SET daily_hours = (
  SELECT t.daily_hours
  FROM tasks t
  WHERE t.id = ta.task_id
)
WHERE daily_hours = 0 OR daily_hours IS NULL;

-- =====================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para validação rápida de limite de 8h/dia por usuário
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_daily_hours
ON task_assignments(user_id, daily_hours);

-- Índice para buscar assignments de um usuário
CREATE INDEX IF NOT EXISTS idx_task_assignments_user_id
ON task_assignments(user_id);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar que a coluna foi criada
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
-- FROM INFORMATION_SCHEMA.COLUMNS
-- WHERE TABLE_NAME = 'task_assignments' AND COLUMN_NAME = 'daily_hours';

-- Verificar dados migrados
-- SELECT ta.id, ta.user_id, ta.task_id, ta.daily_hours, t.daily_hours as task_daily_hours
-- FROM task_assignments ta
-- JOIN tasks t ON ta.task_id = t.id
-- LIMIT 10;

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 4
-- =====================================================
-- Status: ✅ Pronto para executar
-- Próximo passo: Reiniciar backend para ler a nova coluna
-- =====================================================
