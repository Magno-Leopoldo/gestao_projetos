import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectRisk,
} from '../controllers/projectsController.js';
import { authenticate, isSupervisorOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticate);

// Rotas públicas (para usuários autenticados)
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/:id/risk', getProjectRisk);

// Rotas protegidas (apenas supervisor/admin)
router.post('/', isSupervisorOrAdmin, createProject);
router.put('/:id', isSupervisorOrAdmin, updateProject);
router.delete('/:id', isSupervisorOrAdmin, deleteProject);

export default router;
