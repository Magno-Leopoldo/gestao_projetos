import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testDirect() {
  console.log('🔍 Testando conexão DIRETA com projeto_engenharia...\n');

  try {
    // Conectar diretamente ao banco especificando database
    console.log('📡 Conectando ao banco projeto_engenharia...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'projeto_engenharia', // Especificar diretamente
    });

    console.log('✅ Conectado com sucesso!\n');

    // Testar query simples
    console.log('📊 Testando queries...\n');

    // 1. Mostrar tabelas
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`1️⃣ Tabelas encontradas: ${tables.length}`);
    tables.forEach((table) => {
      const tableName = Object.values(table)[0];
      console.log(`   ✅ ${tableName}`);
    });
    console.log('');

    // 2. Contar usuários
    const [users] = await connection.query('SELECT COUNT(*) as total FROM users');
    console.log(`2️⃣ Total de usuários: ${users[0].total}\n`);

    // 3. Listar usuários
    const [userList] = await connection.query('SELECT id, email, full_name, role FROM users ORDER BY role, id');
    console.log('3️⃣ Usuários cadastrados:');
    console.log('─'.repeat(80));
    userList.forEach((user) => {
      console.log(`   ${user.id} | ${user.email.padEnd(30)} | ${user.role.padEnd(10)} | ${user.full_name}`);
    });
    console.log('─'.repeat(80));
    console.log('');

    // 4. Contar projetos
    const [projects] = await connection.query('SELECT COUNT(*) as total FROM projects');
    console.log(`4️⃣ Total de projetos: ${projects[0].total}\n`);

    // 5. Contar tarefas
    const [tasks] = await connection.query('SELECT COUNT(*) as total FROM tasks');
    console.log(`5️⃣ Total de tarefas: ${tasks[0].total}\n`);

    console.log('═'.repeat(80));
    console.log('✅ SUCESSO! O banco está funcionando perfeitamente!');
    console.log('═'.repeat(80));
    console.log('\n🎉 O servidor pode ser iniciado com: npm run dev\n');

    await connection.end();

  } catch (error) {
    console.error(`\n❌ ERRO: ${error.message}\n`);

    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('🔧 O banco "projeto_engenharia" não existe ou está inacessível.\n');
      console.log('📝 SOLUÇÃO:');
      console.log('   1. Abra o phpMyAdmin: http://localhost/phpmyadmin');
      console.log('   2. Verifique se o banco "projeto_engenharia" está na lista');
      console.log('   3. Se não estiver, crie um novo banco com esse nome');
      console.log('   4. Execute o arquivo schema.sql no banco criado\n');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔧 Acesso negado!\n');
      console.log('📝 SOLUÇÃO:');
      console.log('   1. Verifique o usuário e senha no arquivo .env');
      console.log('   2. User padrão do XAMPP: root');
      console.log('   3. Password padrão do XAMPP: (vazio)\n');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔧 Conexão recusada!\n');
      console.log('📝 SOLUÇÃO:');
      console.log('   1. Verifique se o XAMPP está rodando');
      console.log('   2. Verifique se o MySQL está ativo na porta 3306');
      console.log('   3. Abra o XAMPP Control Panel e inicie o MySQL\n');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('🔧 Tabela não encontrada!\n');
      console.log('📝 SOLUÇÃO:');
      console.log('   1. Execute o arquivo schema.sql no phpMyAdmin');
      console.log('   2. Caminho: C:\\Users\\Magno\\Documents\\Dev-Engenharia\\database\\schema.sql\n');
    } else {
      console.log('❓ Erro desconhecido. Detalhes:');
      console.log(`   Code: ${error.code}`);
      console.log(`   Message: ${error.message}\n`);
    }
  }
}

testDirect();
