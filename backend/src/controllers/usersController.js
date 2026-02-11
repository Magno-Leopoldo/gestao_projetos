import { query } from '../config/database.js';

// GET /api/users - Listar todos os usuários
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    let sql = 'SELECT id, full_name, email, role, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    // Filtrar por role se fornecido
    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    // Buscar por nome ou email se fornecido
    if (search) {
      sql += ' AND (full_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY full_name ASC';

    const users = await query(sql, params);

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id - Obter usuário específico
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [user] = await query(
      'SELECT id, full_name, email, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/role/:role - Listar usuários por role
export const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    const validRoles = ['admin', 'supervisor', 'user'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ROLE',
        message: `Role deve ser um de: ${validRoles.join(', ')}`,
      });
    }

    const users = await query(
      'SELECT id, full_name, email, role, is_active, created_at FROM users WHERE role = ? ORDER BY full_name ASC',
      [role]
    );

    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id/role - Alterar role de um usuário
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ['user', 'supervisor', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_ROLE',
        message: `Role deve ser um de: ${validRoles.join(', ')}`,
      });
    }

    if (String(req.user.id) === String(id)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você não pode alterar seu próprio role',
      });
    }

    const [existing] = await query('SELECT id FROM users WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Usuário não encontrado',
      });
    }

    await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    const [updated] = await query(
      'SELECT id, full_name, email, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updated,
      message: 'Role atualizado com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/toggle-active - Ativar/desativar um usuário
export const toggleUserActive = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (String(req.user.id) === String(id)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você não pode desativar sua própria conta',
      });
    }

    const [existing] = await query('SELECT id, is_active FROM users WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Usuário não encontrado',
      });
    }

    const newStatus = existing.is_active ? 0 : 1;
    await query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    const [updated] = await query(
      'SELECT id, full_name, email, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updated,
      message: updated.is_active ? 'Usuário ativado com sucesso' : 'Usuário desativado com sucesso',
    });
  } catch (error) {
    next(error);
  }
};
