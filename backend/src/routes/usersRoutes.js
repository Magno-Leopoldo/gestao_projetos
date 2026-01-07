import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getAllUsers,
  getUserById,
  getUsersByRole,
} from '../controllers/usersController.js';
import {
  getUserTodayTimeEntries,
  getUserDayStatus,
} from '../controllers/timeEntriesController.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// =====================================================
// Rotas de Usuários
// =====================================================

// GET /api/users - Listar todos os usuários
router.get('/', getAllUsers);

// GET /api/users/role/:role - Listar usuários por role (deve vir antes de /:id)
router.get('/role/:role', getUsersByRole);

// GET /api/users/:id - Obter usuário específico
router.get('/:id', getUserById);

// =====================================================
// Rotas de Time Entries para Usuários
// =====================================================

// GET /api/users/:userId/time-entries/today
// Listar todas as sessões de um usuário hoje
router.get('/:userId/time-entries/today', getUserTodayTimeEntries);

// GET /api/users/:userId/time-entries/status (FASE 3)
// Resumo de status do dia com validações e avisos
router.get('/:userId/time-entries/status', getUserDayStatus);

export default router;
