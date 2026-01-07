const { exec } = require('child_process');

// Mata o processo na porta 3000
exec('netstat -ano | findstr :3000', (error, stdout, stderr) => {
  if (error) {
    console.error('Erro ao buscar processo:', error);
    return;
  }

  const lines = stdout.trim().split('\n');
  const pidMatch = lines[0]?.match(/\d+$/);

  if (pidMatch) {
    const pid = pidMatch[0];
    console.log(`Matando processo PID: ${pid}`);

    exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
      if (error) {
        console.error('Erro ao matar processo:', error);
      } else {
        console.log('✅ Processo morto com sucesso!');
        console.log(stdout);
      }
    });
  } else {
    console.log('Nenhum processo encontrado na porta 3000');
  }
});
