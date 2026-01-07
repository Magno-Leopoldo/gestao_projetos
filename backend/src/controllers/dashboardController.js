import { query } from '../config/database.js';
import { getUserDayStatusSummary } from '../helpers/taskValidations.js';

// GET /api/dashboard/stats - Estatísticas do dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;

    // Filtro baseado no role (sem WHERE keyword - será adicionado em cada query)
    let projectFilterCondition = '';
    const params = [];

    if (role === 'supervisor') {
      projectFilterCondition = 'p.supervisor_id = ?';
      params.push(userId);
    } else if (role === 'user') {
      projectFilterCondition = `p.id IN (
        SELECT DISTINCT ps2.project_id
        FROM project_stages ps2
        INNER JOIN tasks t2 ON ps2.id = t2.stage_id
        INNER JOIN task_assignments ta ON t2.id = ta.task_id
        WHERE ta.user_id = ?
      )`;
      params.push(userId);
    }

    // 1. Projetos em andamento
    const [openProjects] = await query(
      `SELECT COUNT(*) as total FROM projects p ${projectFilterCondition ? 'WHERE ' + projectFilterCondition + ' AND' : 'WHERE'} p.status = 'active'`,
      params
    );

    // 2. Projetos em risco
    const [atRiskProjects] = await query(
      `SELECT COUNT(*) as total
       FROM projects p
       ${projectFilterCondition ? 'WHERE ' + projectFilterCondition + ' AND' : 'WHERE'} p.status = 'active'
         AND p.due_date IS NOT NULL
         AND DATEDIFF(p.due_date, CURDATE()) <= 7`,
      params
    );

    // 3. Usuários ativos
    let activeUsersQuery = `
      SELECT COUNT(DISTINCT ta.user_id) as total
      FROM task_assignments ta
      INNER JOIN tasks t ON ta.task_id = t.id
      WHERE t.status = 'em_desenvolvimento'
    `;

    if (role !== 'admin') {
      activeUsersQuery += ` AND t.stage_id IN (
        SELECT ps.id FROM project_stages ps
        INNER JOIN projects p ON ps.project_id = p.id
        WHERE ${projectFilterCondition}
      )`;
    }

    const [activeUsers] = await query(activeUsersQuery, params);

    // 4. Tarefas em "refaca"
    let refacaTasksQuery = `
      SELECT COUNT(*) as total
      FROM tasks t
      WHERE t.status = 'refaca'
    `;

    if (role !== 'admin') {
      refacaTasksQuery += ` AND t.stage_id IN (
        SELECT ps.id FROM project_stages ps
        INNER JOIN projects p ON ps.project_id = p.id
        WHERE ${projectFilterCondition}
      )`;
    }

    const [refacaTasks] = await query(refacaTasksQuery, params);

    // 5. Distribuição de status
    let statusDistQuery = `
      SELECT
        t.status,
        COUNT(*) as count
      FROM tasks t
    `;

    if (role !== 'admin') {
      statusDistQuery += ` INNER JOIN project_stages ps ON t.stage_id = ps.id
        INNER JOIN projects p ON ps.project_id = p.id
        WHERE ${projectFilterCondition}`;
    }

    statusDistQuery += ` GROUP BY t.status`;

    const statusDistribution = await query(statusDistQuery, params);

    const totalTasks = statusDistribution.reduce((sum, s) => sum + s.count, 0);
    const statusWithPercentage = statusDistribution.map(s => ({
      status: s.status,
      count: s.count,
      percentage: totalTasks > 0 ? ((s.count / totalTasks) * 100).toFixed(1) : 0,
    }));

    // 6. Tarefas recentes
    let recentTasksQuery = `
      SELECT
        t.*,
        ps.name as stage_name,
        p.name as project_name,
        p.id as project_id
      FROM tasks t
      INNER JOIN project_stages ps ON t.stage_id = ps.id
      INNER JOIN projects p ON ps.project_id = p.id
    `;

    if (role !== 'admin') {
      recentTasksQuery += ` WHERE ${projectFilterCondition}`;
    }

    recentTasksQuery += ` ORDER BY t.updated_at DESC LIMIT 10`;

    const recentTasks = await query(recentTasksQuery, params);

    res.json({
      success: true,
      data: {
        open_projects: openProjects.total,
        at_risk_projects: atRiskProjects.total,
        active_users: activeUsers.total,
        refaca_tasks: refacaTasks.total,
        status_distribution: statusWithPercentage,
        recent_tasks: recentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/my-tasks - Tarefas do usuário logado
export const getMyTasks = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { status } = req.query;

    let sql = `
      SELECT
        t.*,
        ps.name as stage_name,
        p.name as project_name,
        p.id as project_id
      FROM tasks t
      INNER JOIN task_assignments ta ON t.id = ta.task_id
      INNER JOIN project_stages ps ON t.stage_id = ps.id
      INNER JOIN projects p ON ps.project_id = p.id
      WHERE ta.user_id = ?
    `;

    const params = [userId];

    if (status) {
      sql += ` AND t.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY
      CASE WHEN t.status = 'refaca' THEN 0 ELSE 1 END,
      t.updated_at DESC`;

    const tasks = await query(sql, params);

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/my-hours - Horas alocadas do usuário
export const getMyHours = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const tasks = await query(
      `SELECT
        t.id,
        t.title,
        t.daily_hours,
        t.status,
        ps.name as stage_name,
        p.name as project_name
      FROM tasks t
      INNER JOIN task_assignments ta ON t.id = ta.task_id
      INNER JOIN project_stages ps ON t.stage_id = ps.id
      INNER JOIN projects p ON ps.project_id = p.id
      WHERE ta.user_id = ?
        AND t.status NOT IN ('concluido', 'cancelado')
      ORDER BY t.daily_hours DESC`,
      [userId]
    );

    const totalHours = tasks.reduce((sum, t) => sum + parseFloat(t.daily_hours), 0);
    const availableHours = 8 - totalHours;

    res.json({
      success: true,
      data: {
        tasks,
        total_hours: totalHours,
        available_hours: availableHours,
        max_hours: 8,
        is_at_limit: totalHours >= 8,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// FASE 5: MONITORAMENTO E MÉTRICAS
// =====================================================

// GET /api/dashboard/time-tracking-stats - Estatísticas de rastreamento de tempo
export const getTimeTrackingStats = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;

    // Filtro de projeto baseado em role
    let projectFilter = '';
    const params = [];

    if (role === 'supervisor') {
      projectFilter = `AND ps.project_id IN (
        SELECT id FROM projects WHERE supervisor_id = ?
      )`;
      params.push(userId);
    } else if (role === 'user') {
      projectFilter = `AND ts.user_id = ?`;
      params.push(userId);
    }

    // 1. Total de horas rastreadas hoje
    const [todayStats] = await query(
      `SELECT
        COUNT(*) as total_sessions,
        COALESCE(SUM(CASE WHEN ts.status = 'stopped' THEN ts.duration_hours ELSE 0 END), 0) as total_hours_completed,
        SUM(CASE WHEN ts.status IN ('running', 'paused') THEN 1 ELSE 0 END) as active_sessions,
        COUNT(DISTINCT ts.user_id) as active_users
      FROM time_entries_sessions ts
      LEFT JOIN tasks t ON ts.task_id = t.id
      LEFT JOIN project_stages ps ON t.stage_id = ps.id
      WHERE DATE(ts.created_at) = CURDATE() ${projectFilter}`,
      params
    );

    // 2. Horas por tarefa (top 10)
    let tasksHoursQuery = `
      SELECT
        t.id,
        t.title,
        ps.name as stage_name,
        p.name as project_name,
        COALESCE(SUM(CASE WHEN ts.status = 'stopped' THEN ts.duration_hours ELSE 0 END), 0) as total_hours,
        COUNT(DISTINCT ts.user_id) as collaborators,
        t.estimated_hours,
        CASE
          WHEN t.estimated_hours > 0
          THEN ROUND((COALESCE(SUM(CASE WHEN ts.status = 'stopped' THEN ts.duration_hours ELSE 0 END), 0) / t.estimated_hours) * 100, 1)
          ELSE 0
        END as progress_percent
      FROM tasks t
      LEFT JOIN project_stages ps ON t.stage_id = ps.id
      LEFT JOIN projects p ON ps.project_id = p.id
      LEFT JOIN time_entries_sessions ts ON t.id = ts.task_id AND ts.status = 'stopped'
      WHERE ps.project_id IS NOT NULL
    `;

    if (role === 'supervisor') {
      tasksHoursQuery += ` AND ps.project_id IN (SELECT id FROM projects WHERE supervisor_id = ?)`;
      params.push(userId);
    }

    tasksHoursQuery += ` GROUP BY t.id, t.title, ps.name, p.name, t.estimated_hours
      ORDER BY total_hours DESC LIMIT 10`;

    const topTasksByHours = await query(tasksHoursQuery, params);

    // 3. Tarefas em risco (ultrapassaram prazo)
    let atRiskQuery = `
      SELECT
        t.id,
        t.title,
        p.name as project_name,
        t.estimated_hours,
        COALESCE(SUM(CASE WHEN ts.status = 'stopped' THEN ts.duration_hours ELSE 0 END), 0) as hours_tracked,
        t.due_date,
        DATEDIFF(CURDATE(), t.due_date) as days_overdue,
        tm.status_risco
      FROM tasks t
      LEFT JOIN project_stages ps ON t.stage_id = ps.id
      LEFT JOIN projects p ON ps.project_id = p.id
      LEFT JOIN time_entries_sessions ts ON t.id = ts.task_id
      LEFT JOIN v_task_metrics tm ON t.id = tm.task_id
      WHERE t.due_date IS NOT NULL AND t.status NOT IN ('concluido', 'cancelado')
    `;

    if (role === 'supervisor') {
      atRiskQuery += ` AND p.supervisor_id = ?`;
      params.push(userId);
    }

    atRiskQuery += ` GROUP BY t.id HAVING DATEDIFF(CURDATE(), t.due_date) > 0
      ORDER BY days_overdue DESC`;

    const atRiskTasks = await query(atRiskQuery, params);

    res.json({
      success: true,
      data: {
        today_stats: {
          total_sessions: todayStats.total_sessions,
          total_hours_completed: parseFloat(todayStats.total_hours_completed).toFixed(2),
          active_sessions: todayStats.active_sessions,
          active_users: todayStats.active_users,
        },
        top_tasks_by_hours: topTasksByHours,
        at_risk_tasks: atRiskTasks.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/team-workload - Carga de trabalho da equipe
export const getTeamWorkload = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;

    // Filtro baseado em role
    let projectFilter = '';
    const params = [];

    if (role === 'supervisor') {
      projectFilter = `WHERE p.supervisor_id = ?`;
      params.push(userId);
    } else if (role === 'user') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Apenas supervisores e admins podem ver a carga de trabalho da equipe',
      });
    }

    // Buscar todas as tarefas e workload do usuário
    const users = await query(
      `SELECT DISTINCT u.id, u.full_name, u.email
       FROM users u
       INNER JOIN task_assignments ta ON u.id = ta.user_id
       INNER JOIN tasks t ON ta.task_id = t.id
       INNER JOIN project_stages ps ON t.stage_id = ps.id
       INNER JOIN projects p ON ps.project_id = p.id
       ${projectFilter}
       ORDER BY u.full_name ASC`,
      params
    );

    // Buscar workload e horas rastreadas para cada usuário
    const workload = await Promise.all(
      users.map(async (user) => {
        // Horas alocadas
        const [allocatedHours] = await query(
          `SELECT COALESCE(SUM(t.daily_hours), 0) as total
           FROM tasks t
           INNER JOIN task_assignments ta ON t.id = ta.task_id
           INNER JOIN project_stages ps ON t.stage_id = ps.id
           INNER JOIN projects p ON ps.project_id = p.id
           WHERE ta.user_id = ? AND t.status NOT IN ('concluido', 'cancelado')
           ${role === 'supervisor' ? 'AND p.supervisor_id = ?' : ''}`,
          role === 'supervisor' ? [user.id, userId] : [user.id]
        );

        // Horas rastreadas hoje
        const [todayHours] = await query(
          `SELECT
            COALESCE(SUM(ts.duration_hours), 0) as completed_hours,
            SUM(CASE WHEN ts.status IN ('running', 'paused') THEN 1 ELSE 0 END) as active_sessions
           FROM time_entries_sessions ts
           WHERE ts.user_id = ? AND DATE(ts.created_at) = CURDATE()`,
          [user.id]
        );

        return {
          user_id: user.id,
          user_name: user.full_name,
          email: user.email,
          allocated_hours: parseFloat(allocatedHours.total) || 0,
          hours_tracked_today: parseFloat(todayHours.completed_hours).toFixed(2),
          active_sessions_today: todayHours.active_sessions || 0,
          workload_percentage: ((parseFloat(allocatedHours.total) || 0) / 8) * 100,
          at_limit: (parseFloat(allocatedHours.total) || 0) >= 8,
        };
      })
    );

    // Ordenar por carga de trabalho
    workload.sort((a, b) => b.workload_percentage - a.workload_percentage);

    res.json({
      success: true,
      data: workload,
      summary: {
        total_team_members: workload.length,
        members_at_limit: workload.filter(w => w.at_limit).length,
        average_workload: (workload.reduce((sum, w) => sum + w.workload_percentage, 0) / workload.length).toFixed(1),
      },
    });
  } catch (error) {
    next(error);
  }
};
