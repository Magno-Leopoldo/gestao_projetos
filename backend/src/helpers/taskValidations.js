import { query } from '../config/database.js';

// Validar limite de 8 horas diárias (POR USUÁRIO, somando TODAS as tarefas)
export async function validateDailyHours(userId, taskId, dailyHours) {
  // Buscar soma de horas diárias do usuário em TODAS as tarefas (excluindo a tarefa atual)
  // IMPORTANTE: O limite é POR USUÁRIO somando todas as suas tarefas, não por tarefa
  const [result] = await query(
    `SELECT COALESCE(SUM(ta.daily_hours), 0) as total_hours
     FROM task_assignments ta
     INNER JOIN tasks t ON ta.task_id = t.id
     WHERE ta.user_id = ?
       AND ta.task_id != ?
       AND t.status NOT IN ('concluido', 'cancelado')`,
    [userId, taskId || 0]
  );

  const currentHours = parseFloat(result.total_hours) || 0;
  const requestedHours = parseFloat(dailyHours) || 0;
  const newTotal = currentHours + requestedHours;
  const available = 8 - currentHours;

  return {
    is_valid: newTotal <= 8,
    current_hours: parseFloat(currentHours.toFixed(2)),
    requested_hours: parseFloat(requestedHours.toFixed(2)),
    total_hours: parseFloat(newTotal.toFixed(2)),
    available_hours: Math.max(0, parseFloat(available.toFixed(2))),
    max_hours: 8,
  };
}

// Validar transição de status
export function validateStatusTransition(userRole, fromStatus, toStatus) {
  const transitions = {
    novo: {
      em_desenvolvimento: ['user', 'supervisor', 'admin'],
    },
    em_desenvolvimento: {
      novo: ['user', 'supervisor', 'admin'],
      analise_tecnica: ['supervisor', 'admin'],
    },
    analise_tecnica: {
      concluido: ['supervisor', 'admin'],
      refaca: ['supervisor', 'admin'],
    },
    refaca: {
      em_desenvolvimento: ['user', 'supervisor', 'admin'],
    },
    concluido: {}, // Status final
  };

  const allowedRoles = transitions[fromStatus]?.[toStatus] || [];
  const isValid = allowedRoles.includes(userRole);

  return {
    is_valid: isValid,
    from_status: fromStatus,
    to_status: toStatus,
    user_role: userRole,
    reason: isValid ? null : `Usuários com role '${userRole}' não podem mover tarefas de '${fromStatus}' para '${toStatus}'`,
  };
}

// Buscar breakdown de horas por tarefa
export async function getTaskHoursBreakdown(userId) {
  const tasks = await query(
    `SELECT
      t.id as task_id,
      t.title as task_title,
      ta.daily_hours
    FROM tasks t
    INNER JOIN task_assignments ta ON t.id = ta.task_id
    WHERE ta.user_id = ?
      AND t.status NOT IN ('concluido', 'cancelado')
    ORDER BY ta.daily_hours DESC`,
    [userId]
  );

  return tasks;
}

// =====================================================
// VALIDAÇÃO DE DAILY HOURS POR USUÁRIO
// =====================================================

// Validar se o usuário pode ser atribuído com as horas especificadas
export async function validateUserDailyHours(userId, taskId, requestedHours) {
  // Validação do usuário específico
  const validation = await validateDailyHours(userId, taskId, requestedHours);

  if (!validation.is_valid) {
    return {
      success: false,
      error: `Usuário já possui ${validation.current_hours}h/dia alocadas em outras tarefas. ` +
             `Solicitado para esta tarefa: ${requestedHours}h. ` +
             `Disponível: ${validation.available_hours}h/dia.`,
      validation
    };
  }

  return { success: true, validation };
}

// =====================================================
// VALIDAÇÕES DE TIME ENTRIES (FASE 3)
// =====================================================

// Validar se usuário pode iniciar nova sessão (limite de 8 horas/dia)
export async function validateTimeEntryStart(userId) {
  // Buscar total de horas completadas hoje (STOPPED) + horas em progresso (RUNNING/PAUSED)
  const sessions = await query(
    `SELECT
      id,
      status,
      duration_hours,
      start_time,
      resume_time,
      pause_time,
      duration_total_seconds,
      paused_total_seconds
    FROM time_entries_sessions
    WHERE user_id = ? AND DATE(created_at) = CURDATE()`,
    [userId]
  );

  let totalHours = 0;
  let activeSessionCount = 0;

  // Calcular horas considerando sessões em progresso
  sessions.forEach((session) => {
    if (session.status === 'stopped') {
      // Sessão finalizada: usar duration_hours registrado
      totalHours += parseFloat(session.duration_hours) || 0;
    } else if (session.status === 'running' || session.status === 'paused') {
      // Sessão ativa: usar duration_total_seconds + tempo acumulado
      const secondsWorked = parseFloat(session.duration_total_seconds) || 0;
      const hoursWorked = secondsWorked / 3600;

      // Se está rodando, adicionar tempo desde último resume/start
      if (session.status === 'running') {
        const startTime = new Date(session.resume_time || session.start_time);
        const nowSeconds = (new Date() - startTime) / 1000;
        totalHours += (secondsWorked + nowSeconds) / 3600;
      } else {
        // Se pausado, usar só os segundos trabalhados
        totalHours += hoursWorked;
      }

      activeSessionCount++;
    }
  });

  const completedHours = parseFloat(totalHours.toFixed(2));
  const available = 8 - completedHours;
  const canStart = available > 0;

  return {
    can_start: canStart,
    completed_hours_today: completedHours,
    available_hours: Math.max(0, parseFloat(available.toFixed(2))),
    max_hours: 8,
    active_sessions: activeSessionCount,
    warning_level: completedHours >= 7 ? 'high' : completedHours >= 5 ? 'medium' : 'low',
  };
}

// Validar status atual das sessões do dia
export async function getUserDayStatusSummary(userId) {
  const sessions = await query(
    `SELECT
      t.id as task_id,
      t.title as task_title,
      ts.id as session_id,
      ts.status,
      ts.start_time,
      ts.pause_time,
      ts.resume_time,
      ts.end_time,
      ts.duration_minutes,
      ts.duration_hours,
      ts.duration_total_seconds,  -- ✅ Novo: segundos totais (mais preciso)
      ts.paused_minutes,
      ts.paused_total_seconds,    -- ✅ Novo: segundos pausado (mais preciso)
      ts.pause_count,
      CASE
        WHEN ts.status = 'running'
        THEN TIMESTAMPDIFF(MINUTE, ts.start_time, NOW()) / 60
        WHEN ts.status = 'paused'
        THEN (ts.duration_total_seconds / 60 / 60) -- Usar segundos se disponível
        ELSE ts.duration_hours
      END as current_hours
    FROM time_entries_sessions ts
    INNER JOIN tasks t ON ts.task_id = t.id
    WHERE ts.user_id = ? AND DATE(ts.created_at) = CURDATE()
    ORDER BY ts.start_time ASC`,
    [userId]
  );

  const summary = {
    total_sessions: sessions.length,
    total_hours_tracked: 0,
    active_session: null,
    paused_session: null,
    completed_sessions: [],
    warning_messages: [],
  };

  sessions.forEach(session => {
    // Garantir conversão para número (o banco às vezes retorna como string)
    const currentHours = parseFloat(session.current_hours) || 0;
    const durationHours = parseFloat(session.duration_hours) || 0;

    if (session.status === 'running') {
      summary.active_session = {
        task_id: session.task_id,
        task_title: session.task_title,
        session_id: session.session_id,
        started_at: session.start_time,
        current_duration: currentHours,
        paused_minutes: session.paused_minutes || 0,  // ✅ Tempo total pausado
        pause_count: session.pause_count || 0,        // ✅ Quantas vezes pausou
      };
      summary.total_hours_tracked += currentHours;
    } else if (session.status === 'paused') {
      summary.paused_session = {
        task_id: session.task_id,
        task_title: session.task_title,
        session_id: session.session_id,
        paused_at: session.pause_time,
        duration_so_far: currentHours,
        paused_minutes: session.paused_minutes || 0,  // ✅ Adicionar tempo pausado
        pause_count: session.pause_count || 0,        // ✅ Quantas vezes pausou
      };
      summary.total_hours_tracked += currentHours;
    } else if (session.status === 'stopped') {
      summary.completed_sessions.push({
        task_id: session.task_id,
        task_title: session.task_title,
        session_id: session.session_id,
        completed_at: session.end_time,
        total_hours: durationHours,
      });
      summary.total_hours_tracked += durationHours;
    }
  });

  // Gerar avisos
  if (summary.total_hours_tracked >= 8) {
    summary.warning_messages.push({
      type: 'error',
      message: 'Limite de 8 horas diárias atingido!',
      severity: 'critical',
    });
  } else if (summary.total_hours_tracked >= 7) {
    summary.warning_messages.push({
      type: 'warning',
      message: `Cuidado! Você já trabalhou ${summary.total_hours_tracked.toFixed(2)} horas. Limite próximo!`,
      severity: 'high',
    });
  } else if (summary.total_hours_tracked >= 5) {
    summary.warning_messages.push({
      type: 'info',
      message: `${summary.total_hours_tracked.toFixed(2)} horas registradas (limite: 8h)`,
      severity: 'medium',
    });
  }

  // Se tem sessão ativa e já passou de 8h
  if (summary.active_session && summary.total_hours_tracked >= 8) {
    summary.warning_messages.push({
      type: 'error',
      message: 'Sessão ativa ultrapassou o limite de 8 horas. Finalize imediatamente!',
      severity: 'critical',
    });
  }

  // Garantir que total_hours_tracked é um número válido, arredondado a 2 casas
  summary.total_hours_tracked = parseFloat((summary.total_hours_tracked || 0).toFixed(2));
  summary.can_continue = summary.total_hours_tracked < 8;
  summary.hours_remaining = Math.max(0, parseFloat((8 - summary.total_hours_tracked).toFixed(2)));

  return summary;
}

// =====================================================
// VALIDAÇÕES DE DEPENDÊNCIAS (NOVA FASE)
// =====================================================

// Validar se tarefa tem dependências bloqueantes não concluídas
export async function validateTaskDependencies(taskId) {
  // Buscar todas as dependências da tarefa
  const [taskInfo] = await query(
    `SELECT task_type FROM tasks WHERE id = ?`,
    [taskId]
  );

  if (!taskInfo) {
    return {
      is_blocked: false,
      blocking_dependencies: [],
      task_type: null,
    };
  }

  // Se tarefa é "fixa" ou "paralela", não há bloqueio (dependências não afetam execução)
  if (taskInfo.task_type !== 'não_paralela') {
    return {
      is_blocked: false,
      blocking_dependencies: [],
      task_type: taskInfo.task_type,
    };
  }

  // Se tarefa é "não_paralela", verificar dependências
  const blockedDependencies = await query(
    `SELECT
      td.id as dependency_id,
      td.depends_on_task_id,
      t.title,
      t.status,
      t.status = 'concluido' as is_satisfied
    FROM task_dependencies td
    INNER JOIN tasks t ON td.depends_on_task_id = t.id
    WHERE td.task_id = ?
      AND t.status != 'concluido'`,
    [taskId]
  );

  return {
    is_blocked: blockedDependencies.length > 0,
    blocking_dependencies: blockedDependencies.map(dep => ({
      dependency_id: dep.dependency_id,
      task_id: dep.depends_on_task_id,
      title: dep.title,
      status: dep.status,
      is_satisfied: !!dep.is_satisfied,
    })),
    task_type: taskInfo.task_type,
    blocked_count: blockedDependencies.length,
  };
}

// Validar se é possível atribuir usuários (deve validar dependências bloqueantes)
export async function validateAssignmentWithDependencies(taskId) {
  const validation = await validateTaskDependencies(taskId);

  return {
    can_assign: !validation.is_blocked,
    reason: validation.is_blocked
      ? `Esta tarefa depende de ${validation.blocked_count} tarefa(s) que não foram concluídas: ${
        validation.blocking_dependencies
          .map(d => `"${d.title}"`)
          .join(', ')
      }. Não é possível atribuir usuários até que sejam concluídas.`
      : null,
    validation,
  };
}

// Validar se tarefa_type é válido e se tem as dependências obrigatórias
export async function validateTaskTypeWithDependencies(taskType, dependencies = []) {
  const validTypes = ['paralela', 'não_paralela', 'fixa'];

  if (!validTypes.includes(taskType)) {
    return {
      is_valid: false,
      error: `Tipo de tarefa inválido. Deve ser um de: ${validTypes.join(', ')}`,
    };
  }

  // Se tarefa é "não_paralela", exigir pelo menos uma dependência
  if (taskType === 'não_paralela' && (!dependencies || dependencies.length === 0)) {
    return {
      is_valid: false,
      error: 'Tarefas do tipo "não_paralela" obrigatoriamente devem ter dependências.',
    };
  }

  return {
    is_valid: true,
    task_type: taskType,
    dependencies_count: dependencies.length,
  };
}

// Validar se criar essa dependência causaria ciclo
export async function validateNoDependencyCycle(taskId, dependsOnTaskId) {
  // Verificar se já existe essa dependência exata
  const [existingDep] = await query(
    `SELECT id FROM task_dependencies WHERE task_id = ? AND depends_on_task_id = ?`,
    [taskId, dependsOnTaskId]
  );

  if (existingDep) {
    return {
      has_cycle: false,
      would_duplicate: true,
      error: 'Esta dependência já existe.',
    };
  }

  // Verificar se dependsOnTaskId depende de taskId (causaria ciclo)
  // Usar recursão para detectar
  const chainDependencies = await query(
    `WITH RECURSIVE dep_chain AS (
      -- Base case: dependências diretas de dependsOnTaskId
      SELECT depends_on_task_id as next_id, 1 as depth
      FROM task_dependencies
      WHERE task_id = ?

      UNION ALL

      -- Caso recursivo: dependências de dependências
      SELECT td.depends_on_task_id, dc.depth + 1
      FROM task_dependencies td
      INNER JOIN dep_chain dc ON td.task_id = dc.next_id
      WHERE dc.depth < 100  -- Limite de profundidade para evitar loops infinitos
    )
    SELECT * FROM dep_chain WHERE next_id = ?`,
    [dependsOnTaskId, taskId]
  );

  if (chainDependencies.length > 0) {
    return {
      has_cycle: true,
      would_duplicate: false,
      error: 'Adicionar esta dependência criaria um ciclo: a tarefa dependente já (indiretamente) depende desta tarefa.',
    };
  }

  return {
    has_cycle: false,
    would_duplicate: false,
    is_valid: true,
  };
}
