import { query } from '../config/database.js';

// GET /api/projects/:projectId/stages - Listar etapas de um projeto
export const getStagesByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const stages = await query(
      `SELECT
        ps.*,
        COUNT(t.id) as total_tasks,
        SUM(CASE WHEN t.status = 'concluido' THEN 1 ELSE 0 END) as completed_tasks
      FROM project_stages ps
      LEFT JOIN tasks t ON ps.id = t.stage_id
      WHERE ps.project_id = ?
      GROUP BY ps.id
      ORDER BY ps.order ASC`,
      [projectId]
    );

    res.json({
      success: true,
      data: stages,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stages/:id - Obter etapa por ID
export const getStageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [stage] = await query(
      'SELECT * FROM project_stages WHERE id = ?',
      [id]
    );

    if (!stage) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Etapa não encontrada',
      });
    }

    res.json({
      success: true,
      data: stage,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/projects/:projectId/stages - Criar etapa
export const createStage = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, description, is_parallel } = req.body;
    const { role, id: userId } = req.user;

    // Validações
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Nome da etapa é obrigatório',
      });
    }

    // Verificar se projeto existe e permissão
    const [project] = await query(
      'SELECT * FROM projects WHERE id = ?',
      [projectId]
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Projeto não encontrado',
      });
    }

    // Verificar permissão (apenas supervisor do projeto ou admin)
    if (role === 'supervisor' && project.supervisor_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você só pode criar etapas em seus próprios projetos',
      });
    }

    // Calcular próxima ordem
    const [maxOrder] = await query(
      'SELECT COALESCE(MAX(`order`), 0) as max_order FROM project_stages WHERE project_id = ?',
      [projectId]
    );

    const nextOrder = (maxOrder?.max_order || 0) + 1;

    // Inserir etapa
    const result = await query(
      `INSERT INTO project_stages (project_id, name, description, \`order\`, is_parallel)
       VALUES (?, ?, ?, ?, ?)`,
      [projectId, name, description || null, nextOrder, is_parallel || false]
    );

    // Buscar etapa criada
    const [stage] = await query(
      'SELECT * FROM project_stages WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Etapa criada com sucesso',
      data: stage,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/stages/:id - Atualizar etapa
export const updateStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, is_parallel, order } = req.body;
    const { role, id: userId } = req.user;

    // Verificar se etapa existe
    const [stage] = await query(
      'SELECT * FROM project_stages WHERE id = ?',
      [id]
    );

    if (!stage) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Etapa não encontrada',
      });
    }

    // Verificar permissão
    const [project] = await query(
      'SELECT * FROM projects WHERE id = ?',
      [stage.project_id]
    );

    if (role === 'supervisor' && project.supervisor_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você só pode editar etapas de seus próprios projetos',
      });
    }

    // Construir query de update
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
    if (is_parallel !== undefined) {
      updates.push('is_parallel = ?');
      params.push(is_parallel);
    }
    if (order !== undefined) {
      updates.push('`order` = ?');
      params.push(order);
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
      `UPDATE project_stages SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Buscar etapa atualizada
    const [updatedStage] = await query(
      'SELECT * FROM project_stages WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Etapa atualizada com sucesso',
      data: updatedStage,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/stages/:id - Deletar etapa
export const deleteStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    // Verificar se etapa existe
    const [stage] = await query(
      'SELECT * FROM project_stages WHERE id = ?',
      [id]
    );

    if (!stage) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Etapa não encontrada',
      });
    }

    // Verificar permissão
    const [project] = await query(
      'SELECT * FROM projects WHERE id = ?',
      [stage.project_id]
    );

    if (role === 'supervisor' && project.supervisor_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você só pode deletar etapas de seus próprios projetos',
      });
    }

    // Contar tarefas nesta etapa
    const [taskCount] = await query(
      'SELECT COUNT(*) as total FROM tasks WHERE stage_id = ?',
      [id]
    );

    // Deletar etapa (CASCADE vai deletar tarefas)
    await query('DELETE FROM project_stages WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Etapa deletada com sucesso${taskCount.total > 0 ? ` (${taskCount.total} tarefas foram excluídas)` : ''}`,
    });
  } catch (error) {
    next(error);
  }
};
