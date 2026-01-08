import { query, transaction } from '../config/database.js';
import {
  validateTimeEntryStart,
  getUserDayStatusSummary,
} from '../helpers/taskValidations.js';

// =====================================================
// POST /api/tasks/:taskId/time-entries/start
// Iniciar uma nova sessão de trabalho (PLAY)
// =====================================================
export const startTimeEntry = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { id: userId } = req.user;
    const { notes } = req.body;

    // Verificar se tarefa existe
    const [task] = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Tarefa não encontrada',
      });
    }

    // Verificar se usuário está atribuído à tarefa
    const [assignment] = await query(
      'SELECT * FROM task_assignments WHERE task_id = ? AND user_id = ?',
      [taskId, userId]
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Você não está atribuído a esta tarefa',
      });
    }

    // =====================================================
    // VALIDAÇÃO: Limite de 8 horas/dia (FASE 3)
    // =====================================================
    const dailyValidation = await validateTimeEntryStart(userId);

    if (!dailyValidation.can_start) {
      return res.status(400).json({
        success: false,
        error: 'DAILY_LIMIT_EXCEEDED',
        message: 'Limite de 8 horas diárias já foi atingido',
        validation: dailyValidation,
      });
    }

    // =====================================================
    // AVISO: Se está próximo do limite
    // =====================================================
    const warnings = [];
    if (dailyValidation.warning_level === 'high') {
      warnings.push({
        type: 'warning',
        message: `Cuidado! Você já trabalhou ${dailyValidation.completed_hours_today.toFixed(2)} horas. Apenas ${dailyValidation.available_hours.toFixed(2)} horas disponíveis.`,
      });
    } else if (dailyValidation.warning_level === 'medium') {
      warnings.push({
        type: 'info',
        message: `${dailyValidation.completed_hours_today.toFixed(2)} horas já registradas. ${dailyValidation.available_hours.toFixed(2)}h restantes.`,
      });
    }

    // Verificar se já existe uma sessão ativa (running ou paused)
    const [activeSession] = await query(
      `SELECT * FROM time_entries_sessions
       WHERE task_id = ? AND user_id = ? AND status IN ('running', 'paused')
       ORDER BY created_at DESC LIMIT 1`,
      [taskId, userId]
    );

    if (activeSession) {
      return res.status(400).json({
        success: false,
        error: 'ACTIVE_SESSION_EXISTS',
        message: 'Você já tem uma sessão ativa para esta tarefa',
        session: activeSession,
      });
    }

    // Criar nova sessão - garantir que duration_minutes e duration_total_seconds começam em 0
    const result = await query(
      `INSERT INTO time_entries_sessions (task_id, user_id, start_time, status, notes, duration_minutes, duration_total_seconds)
       VALUES (?, ?, NOW(), 'running', ?, 0, 0)`,
      [taskId, userId, notes || null]
    );

    const [newSession] = await query(
      'SELECT * FROM time_entries_sessions WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Sessão iniciada com sucesso',
      data: newSession,
      warnings: warnings.length > 0 ? warnings : null,
      daily_status: {
        completed_hours: dailyValidation.completed_hours_today,
        available_hours: dailyValidation.available_hours,
        warning_level: dailyValidation.warning_level,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// PATCH /api/tasks/:taskId/time-entries/:sessionId/pause
// Pausar uma sessão de trabalho (PAUSE)
// =====================================================
export const pauseTimeEntry = async (req, res, next) => {
  try {
    const { taskId, sessionId } = req.params;
    const { id: userId } = req.user;

    // Buscar sessão
    const [session] = await query(
      'SELECT * FROM time_entries_sessions WHERE id = ? AND task_id = ? AND user_id = ?',
      [sessionId, taskId, userId]
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Sessão não encontrada',
      });
    }

    if (session.status !== 'running') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Sessão está com status '${session.status}', não pode ser pausada`,
      });
    }

    // ✅ CORREÇÃO: Calcular em SEGUNDOS para manter precisão (não perde MM:SS)
    const pauseTime = new Date();
    const previousDurationSeconds = session.duration_total_seconds || (session.duration_minutes * 60) || 0;

    let newTotalSeconds = previousDurationSeconds;

    // Se há um resume_time (foi pausado antes e retomado), contar do resume até agora
    if (session.resume_time) {
      const resumeTime = new Date(session.resume_time);
      const timeSinceResumeMs = pauseTime - resumeTime;
      const timeSinceResumeSeconds = Math.floor(timeSinceResumeMs / 1000);
      newTotalSeconds = previousDurationSeconds + timeSinceResumeSeconds;
    }
    // Se não há resume_time mas há pause_time (não faz sentido, mas segurança)
    else if (session.pause_time && !session.resume_time) {
      // Já foi pausado antes sem retomar, manter o valor anterior
      newTotalSeconds = previousDurationSeconds;
    }
    // Se não há nem pause_time nem resume_time (primeira pausa)
    else {
      const startTime = new Date(session.start_time);
      const timeSinceStartMs = pauseTime - startTime;
      const timeSinceStartSeconds = Math.floor(timeSinceStartMs / 1000);
      newTotalSeconds = previousDurationSeconds + timeSinceStartSeconds;
    }

    const newDurationMinutes = Math.floor(newTotalSeconds / 60);
    const newDurationHours = parseFloat((newTotalSeconds / 3600).toFixed(2));

    await query(
      `UPDATE time_entries_sessions
       SET pause_time = NOW(),
           status = 'paused',
           duration_total_seconds = ?,
           duration_minutes = ?,
           duration_hours = ?
       WHERE id = ?`,
      [newTotalSeconds, newDurationMinutes, newDurationHours, sessionId]
    );

    const [updatedSession] = await query(
      'SELECT * FROM time_entries_sessions WHERE id = ?',
      [sessionId]
    );

    res.json({
      success: true,
      message: 'Sessão pausada com sucesso',
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// PATCH /api/tasks/:taskId/time-entries/:sessionId/resume
// Retomar uma sessão de trabalho (PLAY após PAUSE)
// =====================================================
export const resumeTimeEntry = async (req, res, next) => {
  try {
    const { taskId, sessionId } = req.params;
    const { id: userId } = req.user;

    // Buscar sessão
    const [session] = await query(
      'SELECT * FROM time_entries_sessions WHERE id = ? AND task_id = ? AND user_id = ?',
      [sessionId, taskId, userId]
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Sessão não encontrada',
      });
    }

    if (session.status !== 'paused') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: `Sessão está com status '${session.status}', não pode ser retomada`,
      });
    }

    // ✅ CORREÇÃO: Rastrear em SEGUNDOS quanto tempo ficou pausado
    const resumeTime = new Date();
    const pauseTime = new Date(session.pause_time);
    const pausedMs = resumeTime - pauseTime;
    const pausedSeconds = Math.floor(pausedMs / 1000);

    // Somar aos segundos já pausados e incrementar contador
    const previousPausedSeconds = session.paused_total_seconds || (session.paused_minutes * 60) || 0;
    const totalPausedSeconds = previousPausedSeconds + pausedSeconds;
    const totalPausedMinutes = Math.floor(totalPausedSeconds / 60);
    const pauseCount = (session.pause_count || 0) + 1;

    await query(
      `UPDATE time_entries_sessions
       SET resume_time = NOW(),
           status = 'running',
           paused_total_seconds = ?,
           paused_minutes = ?,
           pause_count = ?
       WHERE id = ?`,
      [totalPausedSeconds, totalPausedMinutes, pauseCount, sessionId]
    );

    const [updatedSession] = await query(
      'SELECT * FROM time_entries_sessions WHERE id = ?',
      [sessionId]
    );

    res.json({
      success: true,
      message: 'Sessão retomada com sucesso',
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// PATCH /api/tasks/:taskId/time-entries/:sessionId/stop
// Finalizar uma sessão de trabalho (STOP)
// =====================================================
export const stopTimeEntry = async (req, res, next) => {
  try {
    const { taskId, sessionId } = req.params;
    const { id: userId } = req.user;
    const { notes } = req.body;

    // Buscar sessão
    const [session] = await query(
      'SELECT * FROM time_entries_sessions WHERE id = ? AND task_id = ? AND user_id = ?',
      [sessionId, taskId, userId]
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Sessão não encontrada',
      });
    }

    if (session.status === 'stopped') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_STATUS',
        message: 'Sessão já foi finalizada',
      });
    }

    // ✅ CORREÇÃO: Usar duration_total_seconds acumulado + tempo adicional em SEGUNDOS
    const endTime = new Date();
    let totalSeconds = session.duration_total_seconds || (session.duration_minutes * 60) || 0;

    // Se a sessão está rodando (não pausada), adicionar o tempo desde último resume/start
    if (session.status === 'running') {
      let relevantStartTime;

      // Se há resume_time, contar do resume
      if (session.resume_time) {
        relevantStartTime = new Date(session.resume_time);
      } else {
        // Senão, contar do start
        relevantStartTime = new Date(session.start_time);
      }

      const additionalMs = endTime - relevantStartTime;
      const additionalSeconds = Math.floor(additionalMs / 1000);
      totalSeconds += additionalSeconds;
    }

    // Se está pausada agora (status = paused), pode haver pausa pendente
    if (session.status === 'paused' && session.pause_time) {
      const pauseTime = new Date(session.pause_time);
      const pausedMs = endTime - pauseTime;
      const pausedSecondsNow = Math.floor(pausedMs / 1000);
      const previousPausedSeconds = session.paused_total_seconds || (session.paused_minutes * 60) || 0;
      const totalPausedSeconds = previousPausedSeconds + pausedSecondsNow;
      // Atualizar paused_total_seconds (será salvo junto com stop)
      session.paused_total_seconds = totalPausedSeconds;
    }

    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = parseFloat((totalSeconds / 3600).toFixed(2));

    // Usar transação para atualizar sessão e tarefa
    const result = await transaction(async (conn) => {
      // Atualizar sessão
      await conn.execute(
        `UPDATE time_entries_sessions
         SET end_time = NOW(),
             status = 'stopped',
             duration_total_seconds = ?,
             duration_minutes = ?,
             duration_hours = ?,
             paused_total_seconds = ?,
             paused_minutes = ?
         WHERE id = ?`,
        [
          totalSeconds,
          totalMinutes,
          totalHours,
          session.paused_total_seconds || 0,
          session.paused_minutes || 0,
          sessionId
        ]
      );

      // Atualizar data_begin_real da tarefa se for a primeira sessão
      const [task] = await conn.execute(
        'SELECT date_begin_real FROM tasks WHERE id = ?',
        [taskId]
      );

      if (task && task.length > 0 && !task[0].date_begin_real) {
        await conn.execute(
          'UPDATE tasks SET date_begin_real = DATE(NOW()) WHERE id = ?',
          [taskId]
        );
      }

      return sessionId;
    });

    const [updatedSession] = await query(
      'SELECT * FROM time_entries_sessions WHERE id = ?',
      [result]
    );

    res.json({
      success: true,
      message: 'Sessão finalizada com sucesso',
      data: updatedSession,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET /api/tasks/:taskId/time-entries
// Listar todas as sessões de uma tarefa
// =====================================================
export const getTaskTimeEntries = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { user_id, status, period, start_date, end_date } = req.query;

    // Verificar se tarefa existe
    const [task] = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Tarefa não encontrada',
      });
    }

    // Construir query com filtros opcionais
    let whereConditions = ['ts.task_id = ?'];
    let params = [taskId];

    if (user_id) {
      whereConditions.push('ts.user_id = ?');
      params.push(user_id);
    }

    if (status) {
      whereConditions.push('ts.status = ?');
      params.push(status);
    }

    // NOVO: Filtros de período
    if (period) {
      switch (period) {
        case 'today':
          whereConditions.push('DATE(ts.created_at) = CURDATE()');
          break;
        case 'week':
          whereConditions.push('ts.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
          break;
        case 'month':
          whereConditions.push('ts.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)');
          break;
      }
    }

    // NOVO: Filtro de período customizado (start_date e/ou end_date)
    if (period === 'custom' || start_date || end_date) {
      if (start_date && end_date) {
        whereConditions.push('DATE(ts.created_at) BETWEEN ? AND ?');
        params.push(start_date, end_date);
      } else if (start_date) {
        whereConditions.push('DATE(ts.created_at) >= ?');
        params.push(start_date);
      } else if (end_date) {
        whereConditions.push('DATE(ts.created_at) <= ?');
        params.push(end_date);
      }
    }

    const whereClause = whereConditions.join(' AND ');

    const sessions = await query(
      `SELECT ts.*, u.full_name, u.email
       FROM time_entries_sessions ts
       LEFT JOIN users u ON ts.user_id = u.id
       WHERE ${whereClause}
       ORDER BY ts.created_at DESC`,
      params
    );

    // Calcular métricas agregadas
    const [metrics] = await query(
      `SELECT
        COUNT(*) as total_sessions,
        COUNT(DISTINCT user_id) as total_users,
        SUM(CASE WHEN status = 'stopped' THEN duration_hours ELSE 0 END) as total_hours_completed,
        SUM(CASE WHEN status != 'stopped' THEN 1 ELSE 0 END) as active_sessions
       FROM time_entries_sessions
       WHERE task_id = ?`,
      [taskId]
    );

    res.json({
      success: true,
      data: sessions,
      metrics: metrics || {
        total_sessions: 0,
        total_users: 0,
        total_hours_completed: 0,
        active_sessions: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET /api/tasks/:taskId/time-entries/today
// Listar sessões de uma tarefa feitas hoje
// =====================================================
export const getTodayTimeEntries = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { user_id } = req.query;

    // Verificar se tarefa existe
    const [task] = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Tarefa não encontrada',
      });
    }

    // Construir query
    let whereConditions = [
      'ts.task_id = ?',
      'DATE(ts.created_at) = CURDATE()'
    ];
    let params = [taskId];

    if (user_id) {
      whereConditions.push('ts.user_id = ?');
      params.push(user_id);
    }

    const whereClause = whereConditions.join(' AND ');

    const sessions = await query(
      `SELECT ts.*, u.full_name, u.email
       FROM time_entries_sessions ts
       LEFT JOIN users u ON ts.user_id = u.id
       WHERE ${whereClause}
       ORDER BY ts.created_at DESC`,
      params
    );

    // Calcular métricas do dia
    const [dayMetrics] = await query(
      `SELECT
        COUNT(*) as total_sessions,
        COUNT(DISTINCT user_id) as total_users,
        SUM(CASE WHEN status = 'stopped' THEN duration_hours ELSE 0 END) as total_hours_completed,
        SUM(CASE WHEN status != 'stopped' THEN 1 ELSE 0 END) as active_sessions,
        MAX(CASE WHEN status IN ('running', 'paused') THEN start_time END) as last_active_time
       FROM time_entries_sessions
       WHERE task_id = ? AND DATE(created_at) = CURDATE()`,
      [taskId]
    );

    res.json({
      success: true,
      data: sessions,
      metrics: dayMetrics || {
        total_sessions: 0,
        total_users: 0,
        total_hours_completed: 0,
        active_sessions: 0,
        last_active_time: null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET /api/users/:userId/time-entries/today
// Listar todas as sessões de um usuário hoje
// =====================================================
export const getUserTodayTimeEntries = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { task_id } = req.query;

    // Verificar se usuário existe
    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Usuário não encontrado',
      });
    }

    // Construir query
    let whereConditions = [
      'ts.user_id = ?',
      'DATE(ts.created_at) = CURDATE()'
    ];
    let params = [userId];

    if (task_id) {
      whereConditions.push('ts.task_id = ?');
      params.push(task_id);
    }

    const whereClause = whereConditions.join(' AND ');

    const sessions = await query(
      `SELECT ts.*, t.title as task_title, t.estimated_hours, t.daily_hours,
              ps.name as stage_name, p.name as project_name
       FROM time_entries_sessions ts
       LEFT JOIN tasks t ON ts.task_id = t.id
       LEFT JOIN project_stages ps ON t.stage_id = ps.id
       LEFT JOIN projects p ON ps.project_id = p.id
       WHERE ${whereClause}
       ORDER BY ts.created_at DESC`,
      params
    );

    // Calcular totais do dia para este usuário
    const [dayTotals] = await query(
      `SELECT
        COUNT(*) as total_sessions,
        COUNT(DISTINCT task_id) as total_tasks,
        SUM(CASE WHEN status = 'stopped' THEN duration_hours ELSE 0 END) as total_hours_completed,
        SUM(CASE WHEN status = 'running' THEN TIMESTAMPDIFF(MINUTE, start_time, NOW())/60
                 WHEN status = 'paused' THEN duration_minutes/60 ELSE 0 END) as total_hours_active,
        SUM(CASE WHEN status IN ('running', 'paused') THEN 1 ELSE 0 END) as active_sessions
       FROM time_entries_sessions
       WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
      [userId]
    );

    res.json({
      success: true,
      data: sessions,
      totals: {
        ...dayTotals[0] || {
          total_sessions: 0,
          total_tasks: 0,
          total_hours_completed: 0,
          total_hours_active: 0,
          active_sessions: 0,
        },
        user_id: userId,
        user_name: user.full_name,
        date: new Date().toISOString().split('T')[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET /api/users/:userId/time-entries/status (FASE 3)
// Resumo de status do dia com validações e avisos
// =====================================================
export const getUserDayStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verificar se usuário existe
    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Usuário não encontrado',
      });
    }

    // Obter resumo completo do dia
    const summary = await getUserDayStatusSummary(userId);

    res.json({
      success: true,
      data: {
        user_id: userId,
        user_name: user.full_name,
        date: new Date().toISOString().split('T')[0],
        ...summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET /api/tasks/:taskId/progress-chart
// Obter dados de progresso por dia para gráfico
// =====================================================
export const getTaskProgressChart = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { user_id, period = 'all', start_date, end_date } = req.query;

    // Verificar se tarefa existe
    const [task] = await query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Tarefa não encontrada',
      });
    }

    // Construir query com filtros de data
    let whereConditions = ['ts.task_id = ?', 'ts.status = ?'];
    let params = [taskId, 'stopped'];

    // Filtro por período
    if (period === 'today') {
      whereConditions.push('DATE(ts.created_at) = CURDATE()');
    } else if (period === 'week') {
      whereConditions.push('ts.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)');
    } else if (period === 'month') {
      whereConditions.push('ts.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)');
    } else if (period === 'custom' && start_date && end_date) {
      whereConditions.push('DATE(ts.created_at) BETWEEN ? AND ?');
      params.push(start_date, end_date);
    }

    // Filtro por usuário (opcional)
    if (user_id) {
      whereConditions.push('ts.user_id = ?');
      params.push(user_id);
    }

    const whereClause = whereConditions.join(' AND ');

    // Query para obter horas reais por dia (e por usuário se não filtrado)
    let sessionsByDay = [];
    try {
      // Se há filtro de usuário, retorna agregado por dia
      // Se não há filtro, retorna breakdown por dia e usuário
      if (user_id) {
        const result = await query(
          `SELECT
            DATE(ts.created_at) as data,
            SUM(ts.duration_hours) as horas_reais
           FROM time_entries_sessions ts
           WHERE ${whereClause}
           GROUP BY DATE(ts.created_at)
           ORDER BY data ASC`,
          params
        );
        sessionsByDay = Array.isArray(result) ? result : [];
      } else {
        // Retorna breakdown por dia e usuário
        const result = await query(
          `SELECT
            DATE(ts.created_at) as data,
            ts.user_id,
            u.full_name as user_name,
            SUM(ts.duration_hours) as horas_reais
           FROM time_entries_sessions ts
           LEFT JOIN users u ON ts.user_id = u.id
           WHERE ${whereClause}
           GROUP BY DATE(ts.created_at), ts.user_id, u.full_name
           ORDER BY data ASC, u.full_name ASC`,
          params
        );
        sessionsByDay = Array.isArray(result) ? result : [];
      }
    } catch (queryError) {
      console.error('Erro ao executar query:', queryError);
      throw queryError;
    }

    // Obter horas planejadas (sugestão do supervisor)
    const suggestedHours = parseFloat(task.daily_hours) || 0;

    // Formatar resposta
    let chartData;

    if (user_id) {
      // Quando filtrado por usuário, retorna como antes
      chartData = sessionsByDay.map((row) => ({
        data: row.data,
        horasReais: parseFloat(row.horas_reais) || 0,
        horasSugeridas: suggestedHours,
      }));
    } else {
      // Quando não filtrado, retorna com informação de usuário para breakdown
      chartData = sessionsByDay.map((row) => ({
        data: row.data,
        horasReais: parseFloat(row.horas_reais) || 0,
        horasSugeridas: suggestedHours,
        user_id: row.user_id,
        user_name: row.user_name || 'Desconhecido',
      }));
    }

    res.json({
      success: true,
      data: chartData,
      metadata: {
        taskId,
        taskTitle: task.title,
        suggestedHours,
        period,
        userId: user_id ? parseInt(user_id) : null,
        totalSessions: sessionsByDay.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
