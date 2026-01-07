import express from 'express';
import {
  getStagesByProject,
  getStageById,
  createStage,
  updateStage,
  deleteStage,
} from '../controllers/stagesController.js';
import { authenticate, isSupervisorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticate);

// Rotas públicas (para usuários autenticados)
router.get('/project/:projectId', getStagesByProject);
router.get('/:id', getStageById);

// Rotas protegidas (apenas supervisor/admin)
router.post('/project/:projectId', isSupervisorOrAdmin, createStage);
router.put('/:id', isSupervisorOrAdmin, updateStage);
router.delete('/:id', isSupervisorOrAdmin, deleteStage);

export default router;
