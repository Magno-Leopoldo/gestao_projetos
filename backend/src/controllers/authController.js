import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Gerar access token
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};

// Gerar refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Email e senha são obrigatórios',
      });
    }

    // Buscar usuário por email
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Email ou senha incorretos',
      });
    }

    const user = users[0];

    // Verificar se usuário está ativo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'USER_INACTIVE',
        message: 'Usuário desativado',
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Email ou senha incorretos',
      });
    }

    // Gerar tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Remover senha do objeto
    delete user.password_hash;

    // Retornar sucesso
    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          avatar_url: user.avatar_url,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;

    // Validações básicas
    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Email, senha e nome completo são obrigatórios',
      });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Email inválido',
      });
    }

    // Validar força da senha
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'A senha deve ter no mínimo 6 caracteres',
      });
    }

    // Verificar se email já existe
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'EMAIL_ALREADY_EXISTS',
        message: 'Este email já está cadastrado',
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Inserir usuário
    const result = await query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [email, password_hash, full_name, 'user']
    );

    const userId = result.insertId;

    // Gerar tokens
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Retornar sucesso
    res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userId,
          email,
          full_name,
          role: 'user',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_TOKEN',
        message: 'Refresh token não fornecido',
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Buscar usuário
    const users = await query(
      'SELECT id, email, full_name, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Token inválido ou usuário desativado',
      });
    }

    // Gerar novo access token
    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Refresh token inválido ou expirado',
      });
    }
    next(error);
  }
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    // req.user já foi preenchido pelo middleware authenticate
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    // No futuro, pode adicionar blacklist de tokens aqui
    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// ADMIN: Reset de Senha de Usuário (Novo)
// =====================================================

// PUT /api/auth/users/:userId/reset-password
// Apenas admins podem resetar senha de outros usuários
export const adminResetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { new_password } = req.body;
    const { id: adminId, role } = req.user;

    // Validar que é admin
    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Apenas admins podem resetar senhas de usuários',
      });
    }

    // Validar entrada
    if (!new_password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Nova senha é obrigatória',
      });
    }

    // Validar força da senha
    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'A senha deve ter no mínimo 6 caracteres',
      });
    }

    // Verificar que o usuário não está tentando resetar a própria senha com admin
    if (parseInt(userId) === adminId) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Você não pode resetar sua própria senha desta forma. Use a função de trocar senha.',
      });
    }

    // Verificar se usuário existe
    const users = await query(
      'SELECT id, email, full_name, role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Usuário não encontrado',
      });
    }

    const targetUser = users[0];

    // Não permitir resetar senha de outro admin
    if (targetUser.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você não pode resetar a senha de outro administrador',
      });
    }

    // Gerar hash da nova senha
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(new_password, saltRounds);

    // Atualizar senha no banco
    await query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [password_hash, userId]
    );

    // Log da ação (auditoria)
    console.log(
      `[AUDITORIA] Admin ${adminId} resetou a senha do usuário ${userId} (${targetUser.email})`
    );

    res.json({
      success: true,
      message: 'Senha resetada com sucesso',
      data: {
        user_id: targetUser.id,
        user_email: targetUser.email,
        user_name: targetUser.full_name,
        note: 'Compartilhe a nova senha com o usuário de forma segura',
      },
    });
  } catch (error) {
    next(error);
  }
};
