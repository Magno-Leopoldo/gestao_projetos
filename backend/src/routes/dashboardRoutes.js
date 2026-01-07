import express from 'express';
import {
  getDashboardStats,
  getMyTasks,
  getMyHours,
  getTimeTrackingStats,
  getTeamWorkload,
} from '../controllers/dashboardController.js';
import { authenticate, isSupervisorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticate);

// Rotas de dashboard (supervisor/admin)
router.get('/stats', isSupervisorOrAdmin, getDashboardStats);

// Rotas pessoais (todos os usuários)
router.get('/my-tasks', getMyTasks);
router.get('/my-hours', getMyHours);

// =====================================================
// FASE 5: Rotas de Monitoramento e Métricas
// =====================================================

// GET /api/dashboard/time-tracking-stats - Estatísticas de rastreamento de tempo
router.get('/time-tracking-stats', getTimeTrackingStats);

// GET /api/dashboard/team-workload - Carga de trabalho da equipe
router.get('/team-workload', isSupervisorOrAdmin, getTeamWorkload);

export default router;
