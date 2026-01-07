import { query, transaction } from '../config/database.js';

// GET /api/projects - Listar projetos
export const getProjects = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const { status, search, include } = req.query;
    const includeStages = include && include.includes('stages');
    const includeTasks = include && include.includes('tasks');

    let sql = `
      SELECT
        p.*,
        u.full_name as supervisor_name,
        u.email as supervisor_email,
        COUNT(DISTINCT ps.id) as total_stages,
        COUNT(DISTINCT t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'concluido' THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.supervisor_id = u.id
      LEFT JOIN project_stages ps ON p.id = ps.project_id
      LEFT JOIN tasks t ON ps.id = t.stage_id
      WHERE 1=1
    `;

    const params = [];

    // Filtro por role
    if (role === 'user') {
      // User só vê projetos onde tem tarefas atribuídas
      sql += ` AND (p.id IN (
        SELECT DISTINCT ps2.project_id
        FROM project_stages ps2
        INNER JOIN tasks t2 ON ps2.id = t2.stage_id
        INNER JOIN task_assignments ta ON t2.id = ta.task_id
        WHERE ta.user_id = ?
      ))`;
      params.push(userId);
    } else if (role === 'supervisor') {
      // Supervisor vê apenas seus projetos
      sql += ` AND p.supervisor_id = ?`;
      params.push(userId);
    }
    // Admin vê todos

    // Filtro por status
    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    // Busca por nome
    if (search) {
      sql += ` AND p.name LIKE ?`;
      params.push(`%${search}%`);
    }

    sql += ` GROUP BY p.id, u.full_name, u.email`;
    sql += ` ORDER BY p.created_at DESC`;

    let projects = await query(sql, params);

    // Se solicitado, incluir stages e tasks
    if (includeStages || includeTasks) {
      for (let project of projects) {
        // Buscar stages
        const stages = await query(
          'SELECT * FROM project_stages WHERE project_id = ? ORDER BY `order` ASC',
          [project.id]
        );

        if (includeTasks) {
          // Buscar tasks para cada stage
          for (let stage of stages) {
            const tasks = await query(
              'SELECT t.* FROM tasks t WHERE t.stage_id = ? ORDER BY t.order ASC',
              [stage.id]
            );

            // Buscar assignees para cada task
            for (let task of tasks) {
              const assignees = await query(
                `SELECT u.id, u.email, u.full_name, u.role
                 FROM users u
                 INNER JOIN task_assignments ta ON u.id = ta.user_id
                 WHERE ta.task_id = ?`,
                [task.id]
              );
              task.assignees = assignees;
            }

            stage.tasks = tasks;
          }
        } else {
          // Se não incluir tasks, apenas definir array vazio
          for (let stage of stages) {
            stage.tasks = [];
          }
        }

        project.stages = stages;

        // Adicionar supervisor como objeto
        if (project.supervisor_name) {
          project.supervisor = {
            full_name: project.supervisor_name,
            email: project.supervisor_email
          };
        }
      }
    }

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id - Obter projeto por ID
export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    const { include } = req.query;
    const includeStages = include && include.includes('stages');

    let sql = `
      SELECT
        p.*,
        u.full_name as supervisor_name,
        u.email as supervisor_email
      FROM projects p
      LEFT JOIN users u ON p.supervisor_id = u.id
      WHERE p.id = ?
    `;

    const params = [id];

    // Verificar permissão
    if (role === 'user') {
      sql += ` AND p.id IN (
        SELECT DISTINCT ps2.project_id
        FROM project_stages ps2
        INNER JOIN tasks t2 ON ps2.id = t2.stage_id
        INNER JOIN task_assignments ta ON t2.id = ta.task_id
        WHERE ta.user_id = ?
      )`;
      params.push(userId);
    } else if (role === 'supervisor') {
      sql += ` AND p.supervisor_id = ?`;
      params.push(userId);
    }

    const projects = await query(sql, params);

    if (projects.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Projeto não encontrado ou você não tem permissão para acessá-lo',
      });
    }

    const project = projects[0];

    // Incluir stages (sempre, por padrão)
    const stages = await query(
      'SELECT * FROM project_stages WHERE project_id = ? ORDER BY `order` ASC',
      [project.id]
    );
    project.stages = stages || [];

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects - Criar projeto
export const createProject = async (req, res, next) => {
  try {
    const { name, description, start_date, due_date } = req.body;
    const { id: userId } = req.user;

    // Validações
    if (!name || !due_date) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Nome e data final são obrigatórios',
      });
    }

    // Validar datas
    const startDate = start_date ? new Date(start_date) : new Date();
    const dueDate = new Date(due_date);

    if (dueDate <= startDate) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DATES',
        message: 'Data final deve ser maior que a data de início',
      });
    }

    // Inserir projeto
    const result = await query(
      `INSERT INTO projects (name, description, start_date, due_date, supervisor_id, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [name, description || null, start_date || null, due_date, userId]
    );

    // Buscar projeto criado
    const [project] = await query(
      'SELECT * FROM projects WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Projeto criado com sucesso',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id - Atualizar projeto
export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, start_date, due_date } = req.body;
    const { role, id: userId } = req.user;

    // Verificar se projeto existe e permissão
    const [project] = await query('SELECT * FROM projects WHERE id = ?', [id]);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Projeto não encontrado',
      });
    }

    // Apenas supervisor do projeto ou admin pode editar
    if (role === 'supervisor' && project.supervisor_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você só pode editar seus próprios projetos',
      });
    }

    // Validar datas se fornecidas
    if (start_date && due_date) {
      const startDate = new Date(start_date);
      const dueDate = new Date(due_date);

      if (dueDate <= startDate) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_DATES',
          message: 'Data final deve ser maior que a data de início',
        });
      }
    }

    // Construir query de update dinamicamente
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      params.push(start_date);
    }
    if (due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(due_date);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'NO_UPDATES',
        message: 'Nenhum campo para atualizar',
      });
    }

    params.push(id);

    await query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Buscar projeto atualizado
    const [updatedProject] = await query(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Projeto atualizado com sucesso',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/projects/:id - Deletar projeto
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    // Verificar se projeto existe
    const [project] = await query('SELECT * FROM projects WHERE id = ?', [id]);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Projeto não encontrado',
      });
    }

    // Apenas supervisor do projeto ou admin pode deletar
    if (role === 'supervisor' && project.supervisor_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você só pode deletar seus próprios projetos',
      });
    }

    // Deletar projeto (CASCADE vai deletar etapas e tarefas)
    await query('DELETE FROM projects WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Projeto deletado com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id/risk - Calcular risco do projeto
export const getProjectRisk = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Chamar stored procedure
    const [riskData] = await query('CALL sp_calculate_project_deadline(?)', [id]);

    if (!riskData || riskData.length === 0 || riskData[0].length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Projeto não encontrado',
      });
    }

    res.json({
      success: true,
      data: riskData[0][0],
    });
  } catch (error) {
    next(error);
  }
};
