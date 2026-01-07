#!/usr/bin/env node
/**
 * Script para resetar senha de usuário
 * Uso: node scripts/reset-password.js <email> <nova-senha>
 * Exemplo: node scripts/reset-password.js emanuel@example.com 123456
 */

import bcrypt from 'bcrypt';
import { query } from '../src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function resetPassword(email, newPassword) {
  try {
    // Validar entrada
    if (!email || !newPassword) {
      console.error('❌ Erro: Email e senha são obrigatórios');
      console.log('Uso: node scripts/reset-password.js <email> <nova-senha>');
      process.exit(1);
    }

    // Verificar se usuário existe
    const users = await query('SELECT id, email, full_name FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      console.error(`❌ Erro: Usuário com email "${email}" não encontrado`);
      process.exit(1);
    }

    const user = users[0];

    // Gerar hash da nova senha
    console.log('🔐 Gerando hash da nova senha...');
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha no banco
    console.log(`🔄 Atualizando senha para ${user.full_name} (${email})...`);
    const result = await query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [password_hash, user.id]
    );

    if (result.affectedRows > 0) {
      console.log(`✅ Senha resetada com sucesso!`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Nova senha: ${newPassword}`);
      console.log(`👤 Usuário: ${user.full_name}`);
    } else {
      console.error('❌ Erro: Falha ao atualizar senha');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao resetar senha:', error.message);
    process.exit(1);
  }
}

// Pegar argumentos da linha de comando
const args = process.argv.slice(2);
const email = args[0];
const newPassword = args[1];

resetPassword(email, newPassword);
