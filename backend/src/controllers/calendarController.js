import { query } from '../config/database.js';

// GET /api/calendar/allocations?start_date=&end_date=&user_id=
export const getCalendarAllocations = async (req, res, next) => {
  try {
    const { start_date, end_date, user_id } = req.query;
    const { role, id: currentUserId } = req.user;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'start_date e end_date são obrigatórios',
      });
    }

    // Admin/supervisor podem ver calendário de outro; caso contrário, sempre o próprio
    const targetUserId = (role === 'user') ? currentUserId : (user_id || currentUserId);

    let whereConditions = ['ca.allocation_date >= ?', 'ca.allocation_date <= ?', 'ca.user_id = ?'];
    let params = [start_date, end_date, targetUserId];

    const allocations = await query(
      `SELECT
        ca.*,
        t.title AS task_title,
        t.status AS task_status,
        t.priority,
        p.name AS project_name,
        p.id AS project_id,
        ps.name AS stage_name
      FROM calendar_allocations ca
      INNER JOIN tasks t ON ca.task_id = t.id
      INNER JOIN project_stages ps ON t.stage_id = ps.id
      INNER JOIN projects p ON ps.project_id = p.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ca.allocation_date, ca.start_time`,
      params
    );

    res.json({ success: true, data: allocations });
  } catch (error) {
    next(error);
  }
};

// GET /api/calendar/unallocated-tasks?user_id=
export const getUnallocatedTasks = async (req, res, next) => {
  try {
    const { user_id } = req.query;
    const { role, id: currentUserId } = req.user;

    // Admin/supervisor podem ver tarefas de outro usuário
    const targetUserId = (role === 'user') ? currentUserId : (user_id || currentUserId);

    const tasks = await query(
      `SELECT
        t.id AS task_id,
        t.title AS task_title,
        t.priority,
        t.status,
        t.daily_hours,
        t.estimated_hours,
        p.name AS project_name,
        p.id AS project_id,
        ps.name AS stage_name,
        COALESCE(SUM(ca.duration_minutes), 0) AS total_allocated_minutes,
        GREATEST(ROUND(t.estimated_hours * 60) - COALESCE(SUM(ca.duration_minutes), 0), 0) AS remaining_minutes
      FROM tasks t
      INNER JOIN task_assignments ta ON t.id = ta.task_id AND ta.user_id = ?
      INNER JOIN project_stages ps ON t.stage_id = ps.id
      INNER JOIN projects p ON ps.project_id = p.id
      LEFT JOIN calendar_allocations ca ON t.id = ca.task_id AND ca.user_id = ?
      WHERE t.status != 'concluido'
      GROUP BY t.id, t.title, t.priority, t.status, t.daily_hours, t.estimated_hours,
               p.name, p.id, ps.name
      HAVING total_allocated_minutes = 0
      ORDER BY
        FIELD(t.priority, 'high', 'medium', 'low'),
        t.title`,
      [targetUserId, targetUserId]
    );

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

// POST /api/calendar/allocations
export const createCalendarAllocation = async (req, res, next) => {
  try {
    const { task_id, allocation_date, start_time, end_time, notes, user_id } = req.body;
    const { id: currentUserId, role } = req.user;

    // Admin pode criar para outro usuário
    const targetUserId = (role === 'admin' && user_id) ? user_id : currentUserId;

    // Validação de campos obrigatórios
    if (!task_id || !allocation_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'task_id, allocation_date, start_time e end_time são obrigatórios',
      });
    }

    // Verificar se a tarefa existe e o user-alvo está atribuído
    const assignments = await query(
      `SELECT ta.id, t.status
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.id
       WHERE ta.task_id = ? AND ta.user_id = ?`,
      [task_id, targetUserId]
    );

    if (assignments.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Usuário não está atribuído a esta tarefa',
      });
    }

    if (assignments[0].status === 'concluido') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Não é possível alocar tempo para tarefas concluídas',
      });
    }

    // Calcular duração em minutos
    const [sh, sm] = start_time.split(':').map(Number);
    const [eh, em] = end_time.split(':').map(Number);
    const duration_minutes = (eh * 60 + em) - (sh * 60 + sm);

    if (duration_minutes <= 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'end_time deve ser posterior a start_time',
      });
    }

    if (duration_minutes < 15) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Duração mínima é de 15 minutos',
      });
    }

    // Verificar overlap
    const overlaps = await query(
      `SELECT id, start_time, end_time
       FROM calendar_allocations
       WHERE user_id = ? AND allocation_date = ?
         AND start_time < ? AND end_time > ?`,
      [targetUserId, allocation_date, end_time, start_time]
    );

    if (overlaps.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'OVERLAP_ERROR',
        message: 'Já existe uma alocação neste horário',
        overlapping: overlaps,
      });
    }

    // Inserir
    const result = await query(
      `INSERT INTO calendar_allocations (task_id, user_id, allocation_date, start_time, end_time, duration_minutes, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [task_id, targetUserId, allocation_date, start_time, end_time, duration_minutes, notes || null]
    );

    // Warning se total diário > 480min (8h)
    const dailyTotal = await query(
      `SELECT COALESCE(SUM(duration_minutes), 0) AS total
       FROM calendar_allocations
       WHERE user_id = ? AND allocation_date = ?`,
      [targetUserId, allocation_date]
    );

    const warning = dailyTotal[0].total > 480
      ? `Total do dia: ${(dailyTotal[0].total / 60).toFixed(1)}h — excede 8h`
      : null;

    // Buscar alocação criada com dados completos
    const [allocation] = await query(
      `SELECT
        ca.*,
        t.title AS task_title,
        t.status AS task_status,
        t.priority,
        p.name AS project_name,
        p.id AS project_id,
        ps.name AS stage_name
      FROM calendar_allocations ca
      INNER JOIN tasks t ON ca.task_id = t.id
      INNER JOIN project_stages ps ON t.stage_id = ps.id
      INNER JOIN projects p ON ps.project_id = p.id
      WHERE ca.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: allocation,
      warning,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/calendar/allocations/:id
export const updateCalendarAllocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { allocation_date, start_time, end_time, notes } = req.body;
    const { id: currentUserId, role } = req.user;

    // Admin pode editar alocações de qualquer usuário
    const existing = role === 'admin'
      ? await query('SELECT * FROM calendar_allocations WHERE id = ?', [id])
      : await query('SELECT * FROM calendar_allocations WHERE id = ? AND user_id = ?', [id, currentUserId]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Alocação não encontrada',
      });
    }

    const allocationOwnerId = existing[0].user_id;

    const newDate = allocation_date || existing[0].allocation_date;
    const newStart = start_time || existing[0].start_time;
    const newEnd = end_time || existing[0].end_time;

    // Calcular duração
    const [sh, sm] = newStart.split(':').map(Number);
    const [eh, em] = newEnd.split(':').map(Number);
    const duration_minutes = (eh * 60 + em) - (sh * 60 + sm);

    if (duration_minutes <= 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'end_time deve ser posterior a start_time',
      });
    }

    if (duration_minutes < 15) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Duração mínima é de 15 minutos',
      });
    }

    // Verificar overlap (excluindo esta alocação)
    const overlaps = await query(
      `SELECT id, start_time, end_time
       FROM calendar_allocations
       WHERE user_id = ? AND allocation_date = ?
         AND start_time < ? AND end_time > ?
         AND id != ?`,
      [allocationOwnerId, newDate, newEnd, newStart, id]
    );

    if (overlaps.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'OVERLAP_ERROR',
        message: 'Já existe uma alocação neste horário',
        overlapping: overlaps,
      });
    }

    // Atualizar
    await query(
      `UPDATE calendar_allocations
       SET allocation_date = ?, start_time = ?, end_time = ?, duration_minutes = ?, notes = ?
       WHERE id = ?`,
      [newDate, newStart, newEnd, duration_minutes, notes !== undefined ? notes : existing[0].notes, id]
    );

    // Buscar atualizada
    const [allocation] = await query(
      `SELECT
        ca.*,
        t.title AS task_title,
        t.status AS task_status,
        t.priority,
        p.name AS project_name,
        p.id AS project_id,
        ps.name AS stage_name
      FROM calendar_allocations ca
      INNER JOIN tasks t ON ca.task_id = t.id
      INNER JOIN project_stages ps ON t.stage_id = ps.id
      INNER JOIN projects p ON ps.project_id = p.id
      WHERE ca.id = ?`,
      [id]
    );

    // Warning se total diário > 480min
    const dailyTotal = await query(
      `SELECT COALESCE(SUM(duration_minutes), 0) AS total
       FROM calendar_allocations
       WHERE user_id = ? AND allocation_date = ?`,
      [allocationOwnerId, newDate]
    );

    const warning = dailyTotal[0].total > 480
      ? `Total do dia: ${(dailyTotal[0].total / 60).toFixed(1)}h — excede 8h`
      : null;

    res.json({ success: true, data: allocation, warning });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/calendar/allocations/:id
export const deleteCalendarAllocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: currentUserId, role } = req.user;

    // Admin pode deletar alocações de qualquer usuário
    const existing = role === 'admin'
      ? await query('SELECT * FROM calendar_allocations WHERE id = ?', [id])
      : await query('SELECT * FROM calendar_allocations WHERE id = ? AND user_id = ?', [id, currentUserId]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Alocação não encontrada',
      });
    }

    await query('DELETE FROM calendar_allocations WHERE id = ?', [id]);

    res.json({ success: true, message: 'Alocação removida' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/calendar/allocations/batch
// Remove alocações por escopo: 'day' (todas do dia) ou 'task' (todas da tarefa)
export const deleteBatchCalendarAllocations = async (req, res, next) => {
  try {
    const { scope, task_id, allocation_date, user_id } = req.body;
    const { id: currentUserId, role } = req.user;

    // Admin pode deletar alocações de outro usuário
    const targetUserId = (role === 'admin' && user_id) ? user_id : currentUserId;

    if (!scope || !task_id) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'scope e task_id são obrigatórios',
      });
    }

    let whereClause;
    let params;

    if (scope === 'day') {
      if (!allocation_date) {
        return res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'allocation_date é obrigatório para scope=day',
        });
      }
      whereClause = 'user_id = ? AND task_id = ? AND allocation_date = ?';
      params = [targetUserId, task_id, allocation_date];
    } else if (scope === 'task') {
      whereClause = 'user_id = ? AND task_id = ?';
      params = [targetUserId, task_id];
    } else {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: "scope deve ser 'day' ou 'task'",
      });
    }

    // Contar antes de deletar
    const countResult = await query(
      `SELECT COUNT(*) AS total FROM calendar_allocations WHERE ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    if (total === 0) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Nenhuma alocação encontrada',
      });
    }

    await query(`DELETE FROM calendar_allocations WHERE ${whereClause}`, params);

    res.json({
      success: true,
      message: `${total} alocação(ões) removida(s)`,
      deleted: total,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/calendar/allocations/batch
// Cria alocações para múltiplos dias (mesmo horário)
export const createBatchCalendarAllocations = async (req, res, next) => {
  try {
    const { task_id, start_date, end_date, start_time, end_time, notes, skip_weekends, user_id } = req.body;
    const { id: currentUserId, role } = req.user;

    // Admin pode criar para outro usuário
    const targetUserId = (role === 'admin' && user_id) ? user_id : currentUserId;

    if (!task_id || !start_date || !end_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'task_id, start_date, end_date, start_time e end_time são obrigatórios',
      });
    }

    // Verificar se a tarefa existe e o user-alvo está atribuído
    const assignments = await query(
      `SELECT ta.id, t.status
       FROM task_assignments ta
       INNER JOIN tasks t ON ta.task_id = t.id
       WHERE ta.task_id = ? AND ta.user_id = ?`,
      [task_id, targetUserId]
    );

    if (assignments.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Usuário não está atribuído a esta tarefa',
      });
    }

    if (assignments[0].status === 'concluido') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Não é possível alocar tempo para tarefas concluídas',
      });
    }

    // Calcular duração
    const [sh, sm] = start_time.split(':').map(Number);
    const [eh, em] = end_time.split(':').map(Number);
    const duration_minutes = (eh * 60 + em) - (sh * 60 + sm);

    if (duration_minutes < 15) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Duração mínima é de 15 minutos',
      });
    }

    // Gerar lista de dias
    const dates = [];
    const current = new Date(start_date + 'T00:00:00');
    const last = new Date(end_date + 'T00:00:00');
    while (current <= last) {
      const dayOfWeek = current.getDay(); // 0=Sun, 6=Sat
      if (!skip_weekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
      }
      current.setDate(current.getDate() + 1);
    }

    if (dates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Nenhum dia válido no intervalo selecionado',
      });
    }

    // Criar alocações dia a dia, coletando resultados
    const results = [];
    for (const dateStr of dates) {
      // Verificar overlap
      const overlaps = await query(
        `SELECT id, start_time, end_time
         FROM calendar_allocations
         WHERE user_id = ? AND allocation_date = ?
           AND start_time < ? AND end_time > ?`,
        [targetUserId, dateStr, end_time, start_time]
      );

      if (overlaps.length > 0) {
        results.push({ date: dateStr, success: false, error: 'Conflito de horário' });
        continue;
      }

      await query(
        `INSERT INTO calendar_allocations (task_id, user_id, allocation_date, start_time, end_time, duration_minutes, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [task_id, targetUserId, dateStr, start_time, end_time, duration_minutes, notes || null]
      );
      results.push({ date: dateStr, success: true });
    }

    const created = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.status(201).json({
      success: true,
      data: { results, created, failed, total: dates.length },
      message: failed > 0
        ? `${created} alocação(ões) criada(s), ${failed} com conflito`
        : `${created} alocação(ões) criada(s)`,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/calendar/daily-summary?date=&user_id=
export const getDailySummary = async (req, res, next) => {
  try {
    const { date, user_id } = req.query;
    const { role, id: currentUserId } = req.user;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'date é obrigatório',
      });
    }

    const targetUserId = (role === 'user') ? currentUserId : (user_id || currentUserId);

    const result = await query(
      `SELECT
        COALESCE(SUM(duration_minutes), 0) AS total_allocated_minutes,
        COUNT(*) AS allocations_count
       FROM calendar_allocations
       WHERE user_id = ? AND allocation_date = ?`,
      [targetUserId, date]
    );

    const totalMinutes = result[0].total_allocated_minutes;
    const maxMinutes = 480; // 8h

    res.json({
      success: true,
      data: {
        total_allocated_minutes: totalMinutes,
        total_allocated_hours: parseFloat((totalMinutes / 60).toFixed(1)),
        max_hours: 8,
        remaining_hours: parseFloat(Math.max((maxMinutes - totalMinutes) / 60, 0).toFixed(1)),
        allocations_count: result[0].allocations_count,
      },
    });
  } catch (error) {
    next(error);
  }
};
