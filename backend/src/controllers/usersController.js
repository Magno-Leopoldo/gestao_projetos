import { query } from '../config/database.js';

// GET /api/users - Listar todos os usuários
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    let sql = 'SELECT id, full_name, email, role, created_at FROM users WHERE 1=1';
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
      'SELECT id, full_name, email, role, created_at FROM users WHERE id = ?',
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
      'SELECT id, full_name, email, role, created_at FROM users WHERE role = ? ORDER BY full_name ASC',
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
