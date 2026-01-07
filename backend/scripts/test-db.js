import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabase() {
  console.log('🔍 Testando conexão com MySQL...\n');

  console.log('📋 Configurações:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.DB_PORT || 3306}`);
  console.log(`   User: ${process.env.DB_USER || 'root'}`);
  console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : '(vazio)'}`);
  console.log(`   Database: ${process.env.DB_NAME || 'projeto_engenharia'}\n`);

  try {
    // Tentar conectar SEM especificar o banco primeiro
    console.log('1️⃣ Testando conexão básica (sem banco)...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    console.log('   ✅ Conexão básica OK!\n');

    // Listar todos os bancos de dados
    console.log('2️⃣ Listando bancos de dados disponíveis:');
    const [databases] = await connection.query('SHOW DATABASES');
    databases.forEach((db) => {
      const dbName = db.Database;
      const marker = dbName === 'projeto_engenharia' ? '👉' : '  ';
      console.log(`   ${marker} ${dbName}`);
    });
    console.log('');

    // Tentar selecionar o banco projeto_engenharia
    console.log('3️⃣ Tentando usar o banco projeto_engenharia...');
    try {
      await connection.query('USE projeto_engenharia');
      console.log('   ✅ Banco projeto_engenharia selecionado!\n');

      // Listar tabelas
      console.log('4️⃣ Listando tabelas:');
      const [tables] = await connection.query('SHOW TABLES');
      if (tables.length === 0) {
        console.log('   ⚠️  Nenhuma tabela encontrada! Execute o schema.sql\n');
      } else {
        tables.forEach((table) => {
          const tableName = Object.values(table)[0];
          console.log(`   ✅ ${tableName}`);
        });
        console.log('');
      }

      // Contar usuários
      console.log('5️⃣ Testando query de usuários:');
      const [users] = await connection.query('SELECT COUNT(*) as total FROM users');
      console.log(`   ✅ Total de usuários: ${users[0].total}\n`);

      console.log('═'.repeat(60));
      console.log('✅ TUDO OK! Banco de dados está funcionando perfeitamente!');
      console.log('═'.repeat(60));

    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
      console.log('🔧 SOLUÇÃO:');
      console.log('   O banco existe mas não pode ser acessado.');
      console.log('   Verifique se você executou o schema.sql');
    }

    await connection.end();

  } catch (error) {
    console.error(`❌ Erro na conexão: ${error.message}\n`);
    console.log('🔧 POSSÍVEIS SOLUÇÕES:');
    console.log('   1. Verifique se o XAMPP está rodando');
    console.log('   2. Verifique se o MySQL está ativo (porta 3306)');
    console.log('   3. Verifique user/password no arquivo .env');
    console.log('   4. Tente acessar http://localhost/phpmyadmin');
  }
}

testDatabase();
