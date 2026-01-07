import express from 'express';
import { login, register, refresh, getMe, logout, adminResetUserPassword } from '../controllers/authController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);

// Rotas protegidas
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

// =====================================================
// ADMIN: Reset de Senha de Usuário
// =====================================================
router.put('/users/:userId/reset-password', authenticate, isAdmin, adminResetUserPassword);

export default router;
