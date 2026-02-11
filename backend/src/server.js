import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import projectsRoutes from './routes/projectsRoutes.js';
import stagesRoutes from './routes/stagesRoutes.js';
import tasksRoutes from './routes/tasksRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';

// Carregar variáveis de ambiente
dotenv.config();

// Criar app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/stages', stagesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calendar', calendarRoutes);

// Middleware de rota não encontrada
app.use(notFound);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
async function startServer() {
  try {
    // Testar conexão com banco de dados
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      console.error('Verifique se o MySQL está rodando e as credenciais estão corretas');
      process.exit(1);
    }

    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════════╗');
      console.log('║                                                    ║');
      console.log('║   🚀 Servidor API iniciado com sucesso!           ║');
      console.log('║                                                    ║');
      console.log(`║   📡 URL: http://localhost:${PORT}                   ║`);
      console.log(`║   🌍 Ambiente: ${process.env.NODE_ENV}                      ║`);
      console.log('║   📊 Database: projeto_engenharia                 ║');
      console.log('║                                                    ║');
      console.log('║   Rotas disponíveis:                              ║');
      console.log('║                                                    ║');
      console.log('║   🔐 Auth:                                         ║');
      console.log(`║   - POST /api/auth/login                          ║`);
      console.log(`║   - POST /api/auth/register                       ║`);
      console.log('║                                                    ║');
      console.log('║   📊 Projetos:                                     ║');
      console.log(`║   - GET/POST    /api/projects                     ║`);
      console.log(`║   - GET/PUT/DEL /api/projects/:id                 ║`);
      console.log('║                                                    ║');
      console.log('║   📋 Etapas & Tarefas:                             ║');
      console.log(`║   - GET/POST /api/stages/project/:id              ║`);
      console.log(`║   - GET/POST /api/tasks/stage/:id                 ║`);
      console.log('║                                                    ║');
      console.log('║   ⏱️  Rastreamento de Tempo:                       ║');
      console.log(`║   - POST   /api/tasks/:id/time-entries/start      ║`);
      console.log(`║   - PATCH  /api/tasks/:id/time-entries/:sid/pause ║`);
      console.log(`║   - PATCH  /api/tasks/:id/time-entries/:sid/resm  ║`);
      console.log(`║   - PATCH  /api/tasks/:id/time-entries/:sid/stop  ║`);
      console.log(`║   - GET    /api/tasks/:id/time-entries            ║`);
      console.log(`║   - GET    /api/tasks/:id/time-entries/today      ║`);
      console.log(`║   - GET    /api/users/:id/time-entries/today      ║`);
      console.log('║                                                    ║');
      console.log('║   📈 Dashboard:                                    ║');
      console.log(`║   - GET /api/dashboard/stats                      ║`);
      console.log(`║   - GET /api/dashboard/my-tasks                   ║`);
      console.log(`║   - GET /api/dashboard/my-hours                   ║`);
      console.log(`║   - GET /api/dashboard/time-tracking-stats (F5)   ║`);
      console.log(`║   - GET /api/dashboard/team-workload (F5)         ║`);
      console.log('║   - GET /api/users/:id/time-entries/status (F3)  ║');
      console.log('║                                                    ║');
      console.log('╚════════════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar
startServer();
