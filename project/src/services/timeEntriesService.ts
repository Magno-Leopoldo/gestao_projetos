import apiClient from './apiClient';
import { TimeEntrySession, DayStatusSummary } from '../types';

/**
 * Service para gerenciar sessões de rastreamento de tempo (Play/Pause/Stop)
 */
class TimeEntriesService {
  /**
   * Iniciar uma nova sessão de trabalho (PLAY)
   */
  async startSession(
    taskId: number,
    notes?: string
  ): Promise<{
    success: boolean;
    data: TimeEntrySession;
    warnings?: Array<{
      type: 'warning' | 'info';
      message: string;
    }>;
    daily_status?: {
      completed_hours: number;
      available_hours: number;
      warning_level: 'low' | 'medium' | 'high';
    };
  }> {
    const response = await apiClient.post(
      `/tasks/${taskId}/time-entries/start`,
      {
        notes: notes || null,
      }
    );
    return response.data;
  }

  /**
   * Pausar uma sessão de trabalho (PAUSE)
   */
  async pauseSession(
    taskId: number,
    sessionId: number
  ): Promise<{
    success: boolean;
    data: TimeEntrySession;
  }> {
    const response = await apiClient.patch(
      `/tasks/${taskId}/time-entries/${sessionId}/pause`
    );
    return response.data;
  }

  /**
   * Retomar uma sessão pausada (RESUME)
   */
  async resumeSession(
    taskId: number,
    sessionId: number
  ): Promise<{
    success: boolean;
    data: TimeEntrySession;
  }> {
    const response = await apiClient.patch(
      `/tasks/${taskId}/time-entries/${sessionId}/resume`
    );
    return response.data;
  }

  /**
   * Finalizar uma sessão de trabalho (STOP)
   */
  async stopSession(
    taskId: number,
    sessionId: number,
    notes?: string
  ): Promise<{
    success: boolean;
    data: TimeEntrySession;
  }> {
    const response = await apiClient.patch(
      `/tasks/${taskId}/time-entries/${sessionId}/stop`,
      {
        notes: notes || null,
      }
    );
    return response.data;
  }

  /**
   * Listar todas as sessões de uma tarefa
   */
  async getTaskSessions(
    taskId: number,
    filters?: {
      user_id?: number;
      status?: 'running' | 'paused' | 'stopped';
      // NOVO: Filtros de data
      period?: 'today' | 'week' | 'month' | 'custom';
      start_date?: string;  // formato YYYY-MM-DD
      end_date?: string;    // formato YYYY-MM-DD
    }
  ): Promise<{
    success: boolean;
    data: TimeEntrySession[];
    metrics?: {
      total_sessions: number;
      total_users: number;
      total_hours_completed: number;
      active_sessions: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.user_id) {
      params.append('user_id', filters.user_id.toString());
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }

    // NOVO: Adicionar filtros de data
    if (filters?.period) {
      params.append('period', filters.period);
    }
    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }

    const queryString = params.toString();
    const url = `/tasks/${taskId}/time-entries${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Listar sessões de uma tarefa feitas hoje
   */
  async getTodaySessions(
    taskId: number,
    userId?: number
  ): Promise<{
    success: boolean;
    data: TimeEntrySession[];
    metrics?: {
      total_sessions: number;
      total_users: number;
      total_hours_completed: number;
      active_sessions: number;
      last_active_time?: string;
    };
  }> {
    const params = new URLSearchParams();
    if (userId) {
      params.append('user_id', userId.toString());
    }

    const queryString = params.toString();
    const url = `/tasks/${taskId}/time-entries/today${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Obter status completo do dia do usuário com avisos
   * Retorna todas as sessões, avisos de limite de 8 horas, etc
   */
  async getUserDayStatus(userId: number): Promise<{
    success: boolean;
    data: {
      user_id: number;
      user_name: string;
      date: string;
      total_sessions: number;
      total_hours_tracked: number;
      active_session?: {
        task_id: number;
        task_title: string;
        session_id: number;
        started_at: string;
        current_duration: number;
      } | null;
      paused_session?: any | null;
      completed_sessions: Array<{
        task_id: number;
        task_title: string;
        session_id: number;
        completed_at: string;
        total_hours: number;
      }>;
      warning_messages: Array<{
        type: 'error' | 'warning' | 'info';
        message: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
      }>;
      can_continue: boolean;
      hours_remaining: number;
    };
  }> {
    const response = await apiClient.get(`/users/${userId}/time-entries/status`);
    return response.data;
  }

  /**
   * Listar todas as sessões de um usuário feitas hoje
   */
  async getUserTodaySessions(
    userId: number,
    taskId?: number
  ): Promise<{
    success: boolean;
    data: Array<
      TimeEntrySession & {
        task_title: string;
        estimated_hours: number;
        daily_hours: number;
        stage_name: string;
        project_name: string;
      }
    >;
    totals: {
      total_sessions: number;
      total_tasks: number;
      total_hours_completed: number;
      total_hours_active: number;
      active_sessions: number;
      user_id: number;
      user_name: string;
      date: string;
    };
  }> {
    const params = new URLSearchParams();
    if (taskId) {
      params.append('task_id', taskId.toString());
    }

    const queryString = params.toString();
    const url = `/users/${userId}/time-entries/today${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
  }

  /**
   * Validar se o usuário pode iniciar uma nova sessão
   * Verifica se não ultrapassou o limite de 8 horas/dia
   */
  async validateCanStart(userId: number): Promise<{
    can_start: boolean;
    completed_hours_today: number;
    available_hours: number;
    max_hours: number;
    active_sessions: number;
    warning_level: 'low' | 'medium' | 'high';
  }> {
    try {
      const response = await this.getUserDayStatus(userId);
      const { can_continue, total_hours_tracked, hours_remaining } = response.data;

      // Mapear o retorno para o formato esperado
      const completed = total_hours_tracked;
      const available = hours_remaining;
      const active = response.data.active_session ? 1 : 0;

      let warningLevel: 'low' | 'medium' | 'high' = 'low';
      if (completed >= 7) warningLevel = 'high';
      else if (completed >= 5) warningLevel = 'medium';

      return {
        can_start: can_continue,
        completed_hours_today: completed,
        available_hours: available,
        max_hours: 8,
        active_sessions: active,
        warning_level: warningLevel,
      };
    } catch (error) {
      console.error('Erro ao validar se pode iniciar sessão:', error);
      throw error;
    }
  }

  /**
   * Calcular tempo decorrido de uma sessão ativa
   * Útil para manter o timer atualizado no frontend
   */
  calculateElapsedTime(session: TimeEntrySession): number {
    if (!session) return 0;

    try {
      const now = new Date();
      let relevantStartTime: Date;

      if (session.resume_time && session.resume_time !== null) {
        // Se foi retomada, usar o tempo de resume
        relevantStartTime = new Date(session.resume_time);
      } else if (session.start_time && session.start_time !== null) {
        // Senão usar o start_time
        relevantStartTime = new Date(session.start_time);
      } else {
        // Se nenhum dos dois tem valor, retornar 0
        return 0;
      }

      // Validar se a data é válida
      if (isNaN(relevantStartTime.getTime())) {
        console.warn('Data inválida em calculateElapsedTime:', relevantStartTime);
        return 0;
      }

      // Calcular diferença em minutos
      const diffMs = now.getTime() - relevantStartTime.getTime();
      const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

      // Adicionar os minutos já registrados
      const existingMinutes = parseInt(session.duration_minutes?.toString() || '0', 10);
      const durationMinutes = Math.max(0, existingMinutes) + diffMinutes;

      // Retornar em horas
      return parseFloat((durationMinutes / 60).toFixed(2));
    } catch (error) {
      console.error('Erro ao calcular tempo decorrido:', error, session);
      return 0;
    }
  }

  /**
   * Calcular tempo decorrido com precisão de segundos
   * Retorna objeto com minutos, segundos e total de segundos
   * ✅ CORREÇÃO: Se está pausado, não soma mais tempo
   */
  getDetailedElapsedTime(session: TimeEntrySession): {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    totalMinutes: number;
  } {
    if (!session) return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, totalMinutes: 0 };

    try {
      const now = new Date();
      let relevantStartTime: Date | null = null;
      let diffSeconds = 0;

      // ✅ CORREÇÃO: Se está pausado, não adiciona mais tempo
      if (session.status === 'paused') {
        // Se pausado, usar apenas o tempo já registrado
        diffSeconds = 0;
      } else if (session.status === 'running') {
        // Se rodando, calcular tempo desde resume ou start
        if (session.resume_time && session.resume_time !== null) {
          relevantStartTime = new Date(session.resume_time);
        } else if (session.start_time && session.start_time !== null) {
          relevantStartTime = new Date(session.start_time);
        }

        if (relevantStartTime && !isNaN(relevantStartTime.getTime())) {
          const diffMs = now.getTime() - relevantStartTime.getTime();
          diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
        }
      }

      // ✅ Usar duration_total_seconds se disponível (mais preciso)
      // Senão converter duration_minutes para segundos (compatibilidade)
      let existingSeconds = 0;
      if (session.duration_total_seconds) {
        existingSeconds = session.duration_total_seconds;
      } else if (session.duration_minutes) {
        existingSeconds = (parseInt(session.duration_minutes?.toString() || '0', 10) || 0) * 60;
      }
      const totalSeconds = Math.max(0, existingSeconds + diffSeconds);

      // Converter para horas, minutos e segundos
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const totalMinutes = Math.floor(totalSeconds / 60);

      return {
        hours,
        minutes,
        seconds,
        totalSeconds,
        totalMinutes,
      };
    } catch (error) {
      console.error('Erro ao calcular tempo detalhado:', error, session);
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, totalMinutes: 0 };
    }
  }

  /**
   * Formatar duração em horas para string legível
   * Ex: 1.5 -> "1h 30m"
   */
  formatDuration(hours: number): string {
    if (hours === 0) return '0m';

    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;

    return `${h}h ${m}m`;
  }

  /**
   * Formatar tempo detalhado como cronômetro: "MM:SS" ou "H:MM:SS"
   * Ex: { hours: 1, minutes: 5, seconds: 30 } -> "1:05:30"
   * Ex: { hours: 0, minutes: 2, seconds: 15 } -> "02:15"
   */
  formatDurationDetailed(timeData: { hours: number; minutes: number; seconds: number }): string {
    const pad = (num: number) => String(num).padStart(2, '0');

    if (timeData.hours > 0) {
      return `${timeData.hours}:${pad(timeData.minutes)}:${pad(timeData.seconds)}`;
    }

    return `${pad(timeData.minutes)}:${pad(timeData.seconds)}`;
  }

  /**
   * Calcular tempo pausado em tempo real
   * Se pausado AGORA: calcula (agora - pause_time) + paused_total_seconds já registrado
   * ✅ NOVO: Permite que o contador de pausa continue incrementando quando pausado
   */
  getDetailedPausedTime(session: TimeEntrySession): {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  } {
    if (!session || !session.pause_time) {
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    const now = new Date();
    const pauseTime = new Date(session.pause_time);
    const previousPausedSeconds = session.paused_total_seconds || (session.paused_minutes ? session.paused_minutes * 60 : 0) || 0;

    // ✅ Se está pausado AGORA, calcular tempo adicional desde pause_time
    let additionalSeconds = 0;
    if (session.status === 'paused') {
      const pausedMs = now.getTime() - pauseTime.getTime();
      additionalSeconds = Math.max(0, Math.floor(pausedMs / 1000));
    }

    // Total de segundos pausado (histórico + tempo atual se pausado)
    const totalSeconds = previousPausedSeconds + additionalSeconds;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
    };
  }

  /**
   * Formatar tempo pausado como cronômetro: "MM:SS" ou "H:MM:SS"
   * Ex: 8 minutos -> "08:00"
   * Ex: 65 minutos -> "1:05:00"
   */
  formatPausedTime(pausedMinutes?: number | null): {
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  } {
    const totalMinutes = pausedMinutes || 0;
    const totalSeconds = totalMinutes * 60;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      totalSeconds,
    };
  }

  /**
   * Formatar informações de pausa
   * Ex: { paused_minutes: 8, pause_count: 2 } -> "Pausado 2 vezes por 8 minutos"
   */
  formatPauseInfo(pausedMinutes?: number | null, pauseCount?: number | null): string {
    const paused = pausedMinutes || 0;
    const count = pauseCount || 0;

    if (paused === 0 || count === 0) return '';

    const minutes = paused % 60;
    const hours = Math.floor(paused / 60);

    let timeStr = '';
    if (hours > 0) {
      timeStr = `${hours}h ${minutes}m`;
    } else {
      timeStr = `${minutes}m`;
    }

    const countStr = count === 1 ? 'vez' : 'vezes';

    return `Pausado ${count} ${countStr} por ${timeStr}`;
  }

  /**
   * Verificar se deve mostrar aviso de limite próximo
   */
  shouldShowWarning(completedHours: number): boolean {
    return completedHours >= 5; // Mostrar aviso quando 5+ horas
  }

  /**
   * Verificar se atingiu o limite de 8 horas
   */
  hasReachedLimit(completedHours: number): boolean {
    return completedHours >= 8;
  }

  /**
   * Obter dados de progresso por dia para gráfico
   */
  async getTaskProgressChart(
    taskId: number,
    filters?: {
      user_id?: number;
      period?: 'today' | 'week' | 'month' | 'custom' | 'all';
      start_date?: string;
      end_date?: string;
    }
  ): Promise<{
    success: boolean;
    data: Array<{
      data: string;
      horasReais: number;
      horasSugeridas: number;
    }>;
    metadata: {
      taskId: number;
      taskTitle: string;
      suggestedHours: number;
      period: string;
      userId: number | null;
      totalSessions: number;
    };
  }> {
    const params = new URLSearchParams();

    if (filters?.user_id) {
      params.append('user_id', filters.user_id.toString());
    }

    if (filters?.period) {
      params.append('period', filters.period);
    }

    if (filters?.start_date) {
      params.append('start_date', filters.start_date);
    }

    if (filters?.end_date) {
      params.append('end_date', filters.end_date);
    }

    const query = params.toString();
    const url = `/tasks/${taskId}/progress-chart${query ? `?${query}` : ''}`;

    const response = await apiClient.get(url);
    return response.data;
  }
}

export const timeEntriesService = new TimeEntriesService();
