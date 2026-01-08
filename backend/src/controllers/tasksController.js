import { query, transaction } from '../config/database.js';
import {
  validateDailyHours,
  validateUserDailyHours,
  validateStatusTransition,
  getTaskHoursBreakdown,
  validateTaskDependencies,
  validateAssignmentWithDependencies,
  validateTaskTypeWithDependencies,
  validateNoDependencyCycle,
} from '../helpers/taskValidations.js';

// GET /api/tasks - Listar todas as tarefas (com filtros opcionais)
export const getAllTasks = async (req, res, next) => {
  try {
    const { status, user_id, project_id, include_metrics } = req.query;
    const { role, id: currentUserId } = req.user;

    let whereConditions = [];
    let params = [];

    // Filtrar por projeto se fornecido
    if (project_id) {
      whereConditions.push('ps.project_id = ?');
      params.push(project_id);
    }

    // Filtrar por status se fornecido
    if (status) {
      whereConditions.push('t.status = ?');
      params.push(status);
    }

    // Filtrar por usuário atribuído se fornecido
    if (user_id) {
      whereConditions.push('EXISTS (SELECT 1 FROM task_assignments WHERE task_id = t.id AND user_id = ?)');
      params.push(user_id);
    }

    // Se for usuário comum, mostrar apenas suas tarefas
    if (role === 'user') {
      whereConditions.push('EXISTS (SELECT 1 FROM task_assignments WHERE task_id = t.id AND user_id = ?)');
      params.push(currentUserId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const tasks = await query(
      `SELECT
        t.*,
        ps.name as stage_name,
        ps.project_id,
        p.name as project_name
      FROM tasks t
      INNER JOIN project_stages ps ON t.stage_id = ps.id
      INNER JOIN projects p ON ps.project_id = p.id
      ${whereClause}
      ORDER BY t.order ASC`,
      params
    );

    // Buscar assignees para cada task
    let formattedTasks = await Promise.all(
      tasks.map(async (task) => {
        const assignees = await query(
          `SELECT u.id, u.email, u.full_name, u.role
           FROM users u
           INNER JOIN task_assignments ta ON u.id = ta.user_id
           WHERE ta.task_id = ?`,
          [task.id]
        );

        return {
          ...task,
          assignees: assignees
        };
      })
    );

    // =====================================================
    // FASE 4: Incluir métricas rápidas se solicitado
    // =====================================================
    if (include_metrics) {
      formattedTasks = await Promise.all(
        formattedTasks.map(async (task) => {
          const [metrics] = await query(
            `SELECT
              total_horas_reais,
              total_colaboradores,
              taxa_media_percent,
              status_risco
            FROM v_task_metrics
            WHERE task_id = ?`,
            [task.id]
          );

          if (metrics) {
            task.metrics = metrics;
          }

          return task;
        })
      );
    }

    res.json({
      success: true,
      data: formattedTasks,
      count: formattedTasks.length,
      filters: {
        project_id: project_id || null,
        status: status || null,
        user_id: user_id || null,
        include_metrics: include_metrics === 'true',
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stages/:stageId/tasks - Listar tarefas de uma etapa
export const getTasksByStage = async (req, res, next) => {
  try {
    const { stageId } = req.params;

    const tasks = await query(
      `SELECT
        t.*,
        GROUP_CONCAT(u.id) as assignee_ids,
        GROUP_CONCAT(u.full_name SEPARATOR ', ') as assignees
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.id
      WHERE t.stage_id = ?
      GROUP BY t.id
      ORDER BY t.order ASC`,
      [stageId]
    );

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id - Obter tarefa por ID
export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { include_time_metrics } = req.query;

    const [task] = await query(
      `SELECT
        t.*,
        ps.name as stage_name,
        ps.project_id,
        p.name as project_name
      FROM tasks t
      INNER JOIN project_stages ps ON t.stage_id = ps.id
      INNER JOIN projects p ON ps.project_id = p.id
      WHERE t.id = ?`,
      [id]
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Tarefa não encontrada',
      });
    }

    // Buscar usuários atribuídos
    const assignees = await query(
      `SELECT u.id, u.email, u.full_name, u.role, ta.daily_hours
       FROM users u
       INNER JOIN task_assignments ta ON u.id = ta.user_id
       WHERE ta.task_id = ?`,
      [id]
    );

    task.assignees = assignees;

    // =====================================================
    // FASE 4: Incluir métricas de time entries se solicitado
    // =====================================================
    if (include_time_metrics) {
      // Buscar view de métricas
      const [metrics] = await query(
        'SELECT * FROM v_task_metrics WHERE task_id = ?',
        [id]
      );

      if (metrics) {
        task.metrics = {
          data_inicio_real: metrics.data_inicio_real,
          total_horas_reais: metrics.total_horas_reais,
          total_colaboradores: metrics.total_colaboradores,
          taxa_media_percent: metrics.taxa_media_percent,
          dias_necessarios: metrics.dias_necessarios,
          fim_real_estimado: metrics.fim_real_estimado,
          dias_diferenca: metrics.dias_diferenca,
          status_risco: metrics.status_risco,
        };
      }

      // Buscar métricas por colaborador
      const collaboratorMetrics = await query(
        'SELECT * FROM v_task_assignees_metrics WHERE task_id = ?',
        [id]
      );

      task.collaborator_metrics = collaboratorMetrics;
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/stages/:stageId/tasks - Criar tarefa
export const createTask = async (req, res, next) => {
  try {
    const { stageId } = req.params;
    const {
      title,
      description,
      estimated_hours,
      daily_hours,
      priority,
      due_date,
      assigned_user_ids,
      task_type,
      dependency_ids,
    } = req.body;
    const { role, id: userId } = req.user;

    // Validações básicas
    if (!title || !estimated_hours) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Título e horas estimadas são obrigatórios',
      });
    }

    if (estimated_hours <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_HOURS',
        message: 'Horas estimadas deve ser maior que zero',
      });
    }

    if (daily_hours && (daily_hours < 0 || daily_hours > 8)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_DAILY_HOURS',
        message: 'Horas diárias deve estar entre 0 e 8',
      });
    }

    if (daily_hours > estimated_hours) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_HOURS',
        message: 'Horas diárias não pode ser maior que horas estimadas',
      });
    }

    // Validar task_type e dependências
    const typeValidation = await validateTaskTypeWithDependencies(
      task_type || 'paralela',
      dependency_ids || []
    );

    if (!typeValidation.is_valid) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TASK_TYPE',
        message: typeValidation.error,
      });
    }

    // Validar que tarefas não-paralelas não podem ser atribuídas na criação
    if (task_type === 'não_paralela' && assigned_user_ids && assigned_user_ids.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'CANNOT_ASSIGN_BLOCKING_TASK',
        message: 'Tarefas do tipo "não_paralela" não podem ter usuários atribuídos na criação. Aguarde até que as dependências sejam concluídas.',
      });
    }

    // Validar ciclos de dependência
    if (dependency_ids && dependency_ids.length > 0) {
      for (const depId of dependency_ids) {
        // Verificar se a tarefa dependência existe na mesma etapa
        const [depTask] = await query(
          `SELECT id, stage_id FROM tasks WHERE id = ?`,
          [depId]
        );

        if (!depTask) {
          return res.status(404).json({
            success: false,
            error: 'DEPENDENCY_NOT_FOUND',
            message: `Tarefa dependência ${depId} não encontrada`,
          });
        }

        if (depTask.stage_id !== stageId) {
          return res.status(400).json({
            success: false,
            error: 'INVALID_DEPENDENCY',
            message: `Apenas tarefas da mesma etapa podem ser dependências`,
          });
        }
      }
    }

    // Verificar se etapa existe e permissão
    const [stage] = await query(
      `SELECT ps.*, p.supervisor_id
       FROM project_stages ps
       INNER JOIN projects p ON ps.project_id = p.id
       WHERE ps.id = ?`,
      [stageId]
    );

    if (!stage) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Etapa não encontrada',
      });
    }

    // Verificar permissão
    if (role === 'supervisor' && stage.supervisor_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você só pode criar tarefas em seus próprios projetos',
      });
    }

    // Validar limite de 8h/dia para cada usuário atribuído
    if (assigned_user_ids && assigned_user_ids.length > 0 && daily_hours > 0) {
      const validationResults = [];

      for (const assignedUserId of assigned_user_ids) {
        const validation = await validateDailyHours(assignedUserId, null, daily_hours);
        validationResults.push({
          user_id: assignedUserId,
          ...validation,
        });
      }

      const failedValidations = validationResults.filter(v => !v.is_valid);

      if (failedValidations.length > 0) {
        // Buscar nomes dos usuários
        const userIds = failedValidations.map(v => v.user_id);
        const users = await query(
          `SELECT id, full_name FROM users WHERE id IN (${userIds.join(',')})`,
          []
        );

        const userMap = {};
        users.forEach(u => {
          userMap[u.id] = u.full_name;
        });

        return res.status(400).json({
          success: false,
          error: 'DAILY_LIMIT_EXCEEDED',
          message: 'Um ou mais usuários excederam o limite de 8 horas diárias',
          details: failedValidations.map(v => ({
            user_id: v.user_id,
            user_name: userMap[v.user_id],
            current_hours: v.current_hours,
            requested_hours: v.requested_hours,
            available_hours: v.available_hours,
          })),
        });
      }
    }

    // Calcular próxima ordem
    const [maxOrder] = await query(
      'SELECT COALESCE(MAX(`order`), 0) as max_order FROM tasks WHERE stage_id = ?',
      [stageId]
    );

    const nextOrder = (maxOrder?.max_order || 0) + 1;

    // Usar transação para criar tarefa, dependências e atribuições
    const result = await transaction(async (conn) => {
      // Inserir tarefa
      const [taskResult] = await conn.execute(
        `INSERT INTO tasks (stage_id, title, description, status, estimated_hours, daily_hours, priority, \`order\`, due_date, task_type)
         VALUES (?, ?, ?, 'novo', ?, ?, ?, ?, ?, ?)`,
        [
          stageId,
          title,
          description || null,
          estimated_hours,
          daily_hours || 0,
          priority || 'medium',
          nextOrder,
          due_date || null,
          task_type || 'paralela',
        ]
      );

      const taskId = taskResult.insertId;

      // Inserir dependências
      if (dependency_ids && dependency_ids.length > 0) {
        for (const depId of dependency_ids) {
          await conn.execute(
            'INSERT INTO task_dependencies (task_id, depends_on_task_id) VALUES (?, ?)',
            [taskId, depId]
          );
        }
      }

      // Atribuir usuários (apenas para tarefas não "não_paralelas")
      if (assigned_user_ids && assigned_user_ids.length > 0 && task_type !== 'não_paralela') {
        for (const assignedUserId of assigned_user_ids) {
          await conn.execute(
            'INSERT INTO task_assignments (task_id, user_id) VALUES (?, ?)',
            [taskId, assignedUserId]
          );
        }
      }

      return taskId;
    });

    // Buscar tarefa criada
    const [task] = await query('SELECT * FROM tasks WHERE id = ?', [result]);

    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id - Atualizar tarefa
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, estimated_hours, daily_hours, priority, due_date } = req.body;
    const { role, id: userId } = req.user;

    // Buscar tarefa
    const [task] = await query(
      `SELECT t.*, ps.project_id, p.supervisor_id
       FROM tasks t
       INNER JOIN project_stages ps ON t.stage_id = ps.id
       INNER JOIN projects p ON ps.project_id = p.id
       WHERE t.id = ?`,
      [id]
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Tarefa não encontrada',
      });
    }

    // Verificar permissão
    if (role === 'user') {
      // User pode editar apenas se está atribuído
      const [assignment] = await query(
        'SELECT * FROM task_assignments WHERE task_id = ? AND user_id = ?',
        [id, userId]
      );

      if (!assignment) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Você só pode editar tarefas atribuídas a você',
        });
      }
    } else if (role === 'supervisor' && task.supervisor_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você só pode editar tarefas de seus próprios projetos',
      });
    }

    // Validar daily_hours se alterado
    if (daily_hours !== undefined && daily_hours !== task.daily_hours) {
      if (daily_hours < 0 || daily_hours > 8) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_DAILY_HOURS',
          message: 'Horas diárias deve estar entre 0 e 8',
        });
      }

      // Buscar usuários atribuídos
      const assignees = await query(
        'SELECT user_id FROM task_assignments WHERE task_id = ?',
        [id]
      );

      // Validar para cada usuário
      for (const assignee of assignees) {
        const validation = await validateDailyHours(assignee.user_id, id, daily_hours);

        if (!validation.is_valid) {
          const [user] = await query(
            'SELECT full_name FROM users WHERE id = ?',
            [assignee.user_id]
          );

          return res.status(400).json({
            success: false,
            error: 'DAILY_LIMIT_EXCEEDED',
            message: `Usuário ${user.full_name} excederia o limite de 8 horas diárias`,
            details: validation,
          });
        }
      }
    }

    // Construir query de update
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (estimated_hours !== undefined) {
      updates.push('estimated_hours = ?');
      params.push(estimated_hours);
    }
    if (daily_hours !== undefined) {
      updates.push('daily_hours = ?');
      params.push(daily_hours);
    }
    if (priority !== undefined) {
      updates.push('priority = ?');
      params.push(priority);
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

    await query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);

    // Buscar tarefa atualizada
    const [updatedTask] = await query('SELECT * FROM tasks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Tarefa atualizada com sucesso',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:id/status - Alterar status da tarefa
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const { role } = req.user;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_STATUS',
        message: 'Status é obrigatório',
      });
    }

    // Buscar tarefa atual
    const [task] = await query('SELECT * FROM tasks WHERE id = ?', [id]);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Tarefa não encontrada',
      });
    }

    // Validar transição de status
    const validation = validateStatusTransition(role, task.status, status);

    if (!validation.is_valid) {
      return res.status(403).json({
        success: false,
        error: 'INVALID_TRANSITION',
        message: validation.reason,
        details: validation,
      });
    }

    // Se movendo para "refaca", razão é obrigatória
    if (status === 'refaca' && !reason) {
      return res.status(400).json({
        success: false,
        error: 'REASON_REQUIRED',
        message: 'Ao mover para "Refaça", a razão é obrigatória',
      });
    }

    // Atualizar status
    await query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);

    // Buscar tarefa atualizada
    const [updatedTask] = await query('SELECT * FROM tasks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Status alterado para '${status}' com sucesso`,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks/:id/assign - Atribuir usuários à tarefa COM daily_hours individuais
export const assignUsersToTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { assignments, user_ids } = req.body;

    // Suportar ambos os formatos para backward compatibility
    let assignmentsToProcess;

    if (assignments && Array.isArray(assignments)) {
      // Novo formato: array de { user_id, daily_hours }
      if (assignments.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_INPUT',
          message: 'Campo "assignments" não pode estar vazio',
        });
      }
      assignmentsToProcess = assignments;
    } else if (user_ids && Array.isArray(user_ids)) {
      // Formato antigo: array de user_ids (backward compatibility)
      if (user_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_USER_IDS',
          message: 'Lista de IDs de usuários é obrigatória',
        });
      }
      // Converter para novo formato usando daily_hours padrão da tarefa
      assignmentsToProcess = user_ids.map(userId => ({
        user_id: userId,
        daily_hours: null // Será preenchido com task.daily_hours
      }));
    } else {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Campo "assignments" (novo) ou "user_ids" (antigo) é obrigatório',
      });
    }

    // Buscar tarefa
    const [task] = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Tarefa não encontrada',
      });
    }

    // ✅ VALIDAÇÃO: Verificar se tarefa está bloqueada por dependências
    const depValidation = await validateAssignmentWithDependencies(taskId);

    if (!depValidation.can_assign) {
      return res.status(400).json({
        success: false,
        error: 'TASK_BLOCKED_BY_DEPENDENCIES',
        message: depValidation.reason,
        blocking_dependencies: depValidation.validation.blocking_dependencies,
      });
    }

    // Garantir que suggestedHours é um número
    const suggestedHours = parseFloat(task.daily_hours) || 0;
    const results = [];
    const errors = [];

    // Validar e processar cada assignment
    for (const assignment of assignmentsToProcess) {
      const { user_id, daily_hours } = assignment;

      // Converter para número se necessário (pode vir como string do request)
      const parsedHours = daily_hours !== null && daily_hours !== undefined
        ? parseFloat(daily_hours)
        : null;

      // Usar sugestão se não especificado
      const userHours = parsedHours ?? suggestedHours;

      // Validar que horas está entre 0 e 8
      if (typeof userHours !== 'number' || userHours < 0 || userHours > 8) {
        errors.push({
          user_id,
          error: `Horas diárias devem estar entre 0 e 8. Recebido: ${userHours}h`,
        });
        continue;
      }

      // ✅ VALIDAÇÃO RIGOROSA: Verificar limite de 8h/dia do usuário
      // Atribuição é um COMPROMISSO, então devemos garantir que não ultrapasse 8h/dia
      // (somando TODAS as tarefas do usuário)
      const validation = await validateUserDailyHours(user_id, taskId, userHours);

      if (!validation.success) {
        errors.push({
          user_id,
          error: validation.error,
          current_hours: validation.validation.current_hours,
          requested_hours: validation.validation.requested_hours,
          available_hours: validation.validation.available_hours,
        });
        continue;
      }

      // Buscar dados do usuário para resposta
      const [user] = await query('SELECT full_name FROM users WHERE id = ?', [user_id]);

      // Inserir assignment com daily_hours (ON DUPLICATE KEY para atualizar se já existe)
      try {
        await query(
          'INSERT INTO task_assignments (task_id, user_id, daily_hours) VALUES (?, ?, ?) ' +
          'ON DUPLICATE KEY UPDATE daily_hours = ?',
          [taskId, user_id, userHours, userHours]
        );

        results.push({
          user_id,
          user_name: user?.full_name || 'Desconhecido',
          daily_hours: userHours,
          success: true,
          validation: validation.validation,
        });
      } catch (err) {
        errors.push({
          user_id,
          error: err.message,
        });
      }
    }

    // Retornar resultado
    const allSuccessful = errors.length === 0;

    res.json({
      success: allSuccessful,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      message: allSuccessful
        ? `Todos os ${results.length} usuários atribuídos com sucesso`
        : `${results.length} atribuição(ões) bem-sucedida(s), ${errors.length} erro(s)`,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:taskId/assign/:userId - Remover usuário da tarefa
export const unassignUserFromTask = async (req, res, next) => {
  try {
    const { taskId, userId } = req.params;

    const result = await query(
      'DELETE FROM task_assignments WHERE task_id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Atribuição não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Usuário removido da tarefa com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:taskId/assign/:userId - Atualizar daily_hours de um assignment
export const updateAssignmentDailyHours = async (req, res, next) => {
  try {
    const { taskId, userId } = req.params;
    const { daily_hours } = req.body;

    // Validar entrada
    if (daily_hours === undefined || daily_hours === null) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Campo "daily_hours" é obrigatório',
      });
    }

    // Converter para número e validar tipo
    const userHours = parseFloat(daily_hours);
    if (isNaN(userHours) || userHours < 0 || userHours > 8) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_HOURS',
        message: 'Horas diárias devem ser um número entre 0 e 8',
      });
    }

    // Verificar se assignment existe
    const [existing] = await query(
      'SELECT * FROM task_assignments WHERE task_id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Atribuição não encontrada',
      });
    }

    // Validar limite de 8h/dia (incluindo a nova alocação)
    const validation = await validateUserDailyHours(userId, taskId, userHours);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_FAILED',
        message: validation.error,
        validation: validation.validation,
      });
    }

    // Atualizar daily_hours
    await query(
      'UPDATE task_assignments SET daily_hours = ? WHERE task_id = ? AND user_id = ?',
      [userHours, taskId, userId]
    );

    // Buscar dados do usuário para resposta
    const [user] = await query('SELECT full_name FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      data: {
        task_id: taskId,
        user_id: userId,
        user_name: user?.full_name || 'Desconhecido',
        daily_hours: userHours,
        validation: validation.validation,
      },
      message: 'Horas diárias atualizadas com sucesso',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id - Deletar tarefa
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    // Verificar se tarefa existe e permissão
    const [task] = await query(
      `SELECT t.*, ps.project_id, p.supervisor_id
       FROM tasks t
       INNER JOIN project_stages ps ON t.stage_id = ps.id
       INNER JOIN projects p ON ps.project_id = p.id
       WHERE t.id = ?`,
      [id]
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Tarefa não encontrada',
      });
    }

    // Verificar permissão
    if (role === 'supervisor' && task.supervisor_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você só pode deletar tarefas de seus próprios projetos',
      });
    }

    // Deletar tarefa
    await query('DELETE FROM tasks WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Tarefa deletada com sucesso',
    });
  } catch (error) {
    next(error);
  }
};
