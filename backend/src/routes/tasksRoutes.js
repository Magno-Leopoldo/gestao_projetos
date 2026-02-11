import express from 'express';
import {
  getAllTasks,
  getTasksByStage,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  getTaskStatusHistory,
  assignUsersToTask,
  unassignUserFromTask,
  updateAssignmentDailyHours,
  deleteTask,
} from '../controllers/tasksController.js';
import {
  startTimeEntry,
  pauseTimeEntry,
  resumeTimeEntry,
  stopTimeEntry,
  getTaskTimeEntries,
  getTodayTimeEntries,
  getUserTodayTimeEntries,
  getTaskProgressChart,
} from '../controllers/timeEntriesController.js';
import { authenticate, isSupervisorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticate);

// Rotas públicas (para usuários autenticados)
router.get('/', getAllTasks); // Listar todas as tarefas (IMPORTANTE: deve vir antes de /:id)
router.get('/stage/:stageId', getTasksByStage);
router.get('/:id/status-history', getTaskStatusHistory);
router.get('/:id', getTaskById);

// Rotas protegidas (apenas supervisor/admin)
// IMPORTANTE: Rotas mais específicas ANTES das genéricas!
router.post('/stage/:stageId', isSupervisorOrAdmin, createTask);

// Rotas de assignment (mais específicas - 3 segmentos)
router.patch('/:taskId/assign/:userId', authenticate, updateAssignmentDailyHours); // User pode editar seu próprio compromisso
router.delete('/:taskId/assign/:userId', isSupervisorOrAdmin, unassignUserFromTask);

// Rotas com status (mais específicas)
router.patch('/:id/status', authenticate, updateTaskStatus); // User pode mudar status (com validação)

// Rotas de assignment (menos específicas - 2 segmentos)
router.post('/:taskId/assign', isSupervisorOrAdmin, assignUsersToTask);

// Rotas genéricas (menos específicas - 1 segmento)
router.put('/:id', authenticate, updateTask); // User pode editar suas tarefas
router.delete('/:id', isSupervisorOrAdmin, deleteTask);

// =====================================================
// Rotas de Time Entries (Rastreamento de Tempo)
// =====================================================

// POST /api/tasks/:taskId/time-entries/start - Iniciar sessão
router.post('/:taskId/time-entries/start', startTimeEntry);

// GET /api/tasks/:taskId/time-entries - Listar sessões
router.get('/:taskId/time-entries', getTaskTimeEntries);

// GET /api/tasks/:taskId/progress-chart - Dados para gráfico de progresso
router.get('/:taskId/progress-chart', getTaskProgressChart);

// GET /api/tasks/:taskId/time-entries/today - Sessões do dia
router.get('/:taskId/time-entries/today', getTodayTimeEntries);

// PATCH /api/tasks/:taskId/time-entries/:sessionId/pause - Pausar sessão
router.patch('/:taskId/time-entries/:sessionId/pause', pauseTimeEntry);

// PATCH /api/tasks/:taskId/time-entries/:sessionId/resume - Retomar sessão
router.patch('/:taskId/time-entries/:sessionId/resume', resumeTimeEntry);

// PATCH /api/tasks/:taskId/time-entries/:sessionId/stop - Finalizar sessão
router.patch('/:taskId/time-entries/:sessionId/stop', stopTimeEntry);

export default router;
