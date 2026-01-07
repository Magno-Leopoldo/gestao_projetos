-- =====================================================
-- Script para resetar senha do usuário "emanuel"
-- Hash da senha "123456" gerado com bcrypt (rounds: 10)
-- =====================================================

-- IMPORTANTE: Este hash foi pre-gerado para a senha "123456"
-- Hash: $2b$10$L9.zzS7P5OzKKE0.V/5qpe9RFCk7wKqH1Y5R5z7K9U8K8q.R9K0S.

UPDATE users
SET password_hash = '$2b$10$L9.zzS7P5OzKKE0.V/5qpe9RFCk7wKqH1Y5R5z7K9U8K8q.R9K0S.',
    updated_at = NOW()
WHERE email LIKE '%emanuel%' OR full_name LIKE '%emanuel%';

-- Verificar se a atualização funcionou
SELECT id, email, full_name, role, is_active, updated_at
FROM users
WHERE email LIKE '%emanuel%' OR full_name LIKE '%emanuel%';
