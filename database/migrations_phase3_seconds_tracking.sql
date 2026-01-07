-- =====================================================
-- MIGRAÇÕES FASE 3: RASTREAMENTO EM SEGUNDOS
-- Muda de minutos (INT) para segundos (INT) para precisão
-- =====================================================

USE projeto_engenharia;

-- =====================================================
-- ADICIONAR COLUNAS PARA RASTREAMENTO EM SEGUNDOS
-- =====================================================

-- Adicionar coluna com segundos totais (0-59) para duration
ALTER TABLE time_entries_sessions ADD COLUMN IF NOT EXISTS duration_total_seconds INT DEFAULT 0
  COMMENT 'Total de segundos de trabalho (para precisão de MM:SS)';

-- Adicionar coluna com segundos totais (0-59) para paused
ALTER TABLE time_entries_sessions ADD COLUMN IF NOT EXISTS paused_total_seconds INT DEFAULT 0
  COMMENT 'Total de segundos pausado (para precisão de MM:SS)';

-- =====================================================
-- MIGRAR DADOS EXISTENTES (minutos → segundos)
-- =====================================================

-- Converter duration_minutes para duration_total_seconds
UPDATE time_entries_sessions
SET duration_total_seconds = COALESCE(duration_minutes, 0) * 60
WHERE duration_total_seconds = 0;

-- Converter paused_minutes para paused_total_seconds
UPDATE time_entries_sessions
SET paused_total_seconds = COALESCE(paused_minutes, 0) * 60
WHERE paused_total_seconds = 0;

-- =====================================================
-- CRIAR ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_duration_seconds ON time_entries_sessions(duration_total_seconds);
CREATE INDEX IF NOT EXISTS idx_paused_seconds ON time_entries_sessions(paused_total_seconds);

-- =====================================================
-- FIM DA MIGRAÇÃO FASE 3
-- =====================================================
-- Status: ✅ Completo
-- Próximo passo: Atualizar backend para usar segundos
-- =====================================================
