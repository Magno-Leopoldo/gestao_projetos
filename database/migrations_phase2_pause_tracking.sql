-- =====================================================
-- MIGRAÇÕES FASE 2: RASTREAMENTO DE PAUSA
-- Adiciona suporte para rastrear quanto tempo sessão ficou pausada
-- =====================================================

USE projeto_engenharia;

-- =====================================================
-- ADICIONAR CAMPOS PARA RASTREAR PAUSAS
-- =====================================================

ALTER TABLE time_entries_sessions ADD COLUMN IF NOT EXISTS paused_minutes INT DEFAULT 0
  COMMENT 'Total de minutos que a sessão ficou pausada (não trabalhada)';

ALTER TABLE time_entries_sessions ADD COLUMN IF NOT EXISTS pause_count INT DEFAULT 0
  COMMENT 'Quantas vezes a sessão foi pausada';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_paused_minutes ON time_entries_sessions(paused_minutes);

-- =====================================================
-- ATUALIZAR DADOS EXISTENTES
-- =====================================================

-- Recalcular paused_minutes para sessões já existentes
-- Lógica: Se tem pause_time e resume_time, paused = (resume - pause)
-- Senão se só tem pause_time sem resume (pausada agora), paused = (agora - pause)
-- Senão paused = 0

UPDATE time_entries_sessions
SET paused_minutes = CASE
  -- Se pausada e retomada (pause_time e resume_time), calcular pausa anterior
  WHEN pause_time IS NOT NULL AND resume_time IS NOT NULL
  THEN TIMESTAMPDIFF(MINUTE, pause_time, resume_time)

  -- Se pausada mas não retomada (pausada agora)
  WHEN pause_time IS NOT NULL AND resume_time IS NULL AND status = 'paused'
  THEN TIMESTAMPDIFF(MINUTE, pause_time, NOW())

  -- Senão não foi pausada
  ELSE 0
END;

UPDATE time_entries_sessions
SET pause_count = CASE
  WHEN pause_time IS NOT NULL THEN 1
  ELSE 0
END;

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 2
-- =====================================================
-- Status: ✅ Completo
-- Próximo passo: Implementar lógica no backend para atualizar paused_minutes
-- =====================================================
