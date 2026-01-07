import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updatePasswords() {
  try {
    // Conectar ao banco
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'projeto_engenharia',
    });

    console.log('✅ Conectado ao MySQL');

    // Senha padrão para todos os usuários: "senha123"
    const password = 'senha123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    console.log('🔐 Gerando hash da senha...');
    console.log(`Senha: ${password}`);
    console.log(`Hash: ${hash}`);

    // Atualizar todos os usuários
    const [result] = await connection.execute(
      'UPDATE users SET password_hash = ?',
      [hash]
    );

    console.log(`✅ ${result.affectedRows} usuários atualizados!`);

    // Listar usuários
    const [users] = await connection.execute(
      'SELECT id, email, full_name, role FROM users ORDER BY role, full_name'
    );

    console.log('\n📋 Usuários no sistema:');
    console.log('─'.repeat(70));
    users.forEach((user) => {
      console.log(`${user.id} | ${user.email.padEnd(30)} | ${user.role.padEnd(10)} | ${user.full_name}`);
    });
    console.log('─'.repeat(70));
    console.log('\n🔑 Todos os usuários agora têm a senha: senha123');
    console.log('\n💡 Você pode fazer login com qualquer um destes emails usando a senha: senha123');

    await connection.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

updatePasswords();
