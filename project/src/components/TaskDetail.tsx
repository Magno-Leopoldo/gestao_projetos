import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Task, TaskWithDetails, TimeEntrySession, DayStatusSummary } from '../types';
import { tasksService } from '../services/tasksService';
import { timeEntriesService } from '../services/timeEntriesService';
import { useAuth } from '../contexts/AuthContext';
import TimeTrackingControls from './TimeTrackingControls';
import AssignUsersModal from './AssignUsersModal';
import SessionDetailsModal from './SessionDetailsModal';
import DailyHoursDetailsModal from './DailyHoursDetailsModal';
import ProgressChartModal from './ProgressChartModal';

const TaskDetail: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, stageId, taskId } = useParams<{
    projectId: string;
    stageId: string;
    taskId: string;
  }>();
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [sessions, setSessions] = useState<TimeEntrySession[]>([]);
  const [activeSession, setActiveSession] = useState<TimeEntrySession | null>(null);
  const [dayStatus, setDayStatus] = useState<DayStatusSummary | null>(null);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TimeEntrySession | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editDailyHours, setEditDailyHours] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [isDailyHoursDetailsOpen, setIsDailyHoursDetailsOpen] = useState(false);
  const [isProgressChartOpen, setIsProgressChartOpen] = useState(false);

  // NOVO: Estados para filtros de histórico
  const [historyPeriod, setHistoryPeriod] = useState<'today' | 'week' | 'month' | 'custom' | 'all'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [historyUserFilter, setHistoryUserFilter] = useState<number | undefined>(undefined);
  const [historySessions, setHistorySessions] = useState<TimeEntrySession[]>([]);

  useEffect(() => {
    if (projectId && stageId && taskId && user) {
      loadData(parseInt(taskId), user.id);
    }
  }, [projectId, stageId, taskId, user]);

  // Recarregar assignees quando abrir o modal de detalhes para garantir dados frescos
  useEffect(() => {
    if (isDailyHoursDetailsOpen && projectId && stageId && taskId && user) {
      const reloadAssignees = async () => {
        try {
          const taskResult = await tasksService.getById(parseInt(taskId));
          if (taskResult.assignees) {
            setAssignees(taskResult.assignees);
            setTask(taskResult);
          }
        } catch (err) {
          console.error('Erro ao recarregar assignees:', err);
        }
      };
      reloadAssignees();
    }
  }, [isDailyHoursDetailsOpen]);

  // NOVO: Recarregar histórico ao mudar filtros
  useEffect(() => {
    if (taskId) {
      loadHistorySessions();
    }
  }, [historyPeriod, customStartDate, customEndDate, historyUserFilter, taskId]);

  const loadData = async (tId: number, userId: number) => {
    setLoading(true);
    setError(null);
    try {
      // Load task
      const taskResult = await tasksService.getById(tId);
      setTask(taskResult);

      // Load assignees from task if available
      if (taskResult.assignees) {
        setAssignees(taskResult.assignees);
      }

      // Load FINISHED sessions - para progresso ACUMULATIVO (não apenas hoje)
      const sessionsResult = await timeEntriesService.getTaskSessions(tId, {
        status: 'stopped'  // Apenas sessões finalizadas para o progresso
      });
      const finishedSessions = sessionsResult?.data || [];
      setSessions(finishedSessions);

      // Load ACTIVE sessions (running or paused) - são sessões não finalizadas
      const activeSessionsResult = await timeEntriesService.getTaskSessions(tId);
      const allSessionsIncludingActive = activeSessionsResult?.data || [];

      // Find active session (running or paused) - APENAS DO USUÁRIO LOGADO (CRÍTICO!)
      const active = allSessionsIncludingActive.find(
        (s) => (s.status === 'running' || s.status === 'paused') && s.user_id === userId
      );
      setActiveSession(active || null);

      // Load day status
      const dayStatusResult = await timeEntriesService.getUserDayStatus(userId);
      setDayStatus(dayStatusResult?.data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao carregar dados';
      setError(errorMsg);
      console.error('Erro ao carregar task detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // NOVO: Carregar sessões com filtros para a tabela de histórico
  const loadHistorySessions = async () => {
    if (!taskId) return;

    try {
      const filters: any = {};

      if (historyUserFilter) {
        filters.user_id = historyUserFilter;
      }

      if (historyPeriod !== 'all') {
        filters.period = historyPeriod === 'custom' ? 'custom' : historyPeriod;
      }

      if (historyPeriod === 'custom' && customStartDate && customEndDate) {
        filters.start_date = customStartDate;
        filters.end_date = customEndDate;
      }

      const result = await timeEntriesService.getTaskSessions(parseInt(taskId), filters);
      setHistorySessions(result?.data || []);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    }
  };

  const handleSessionChange = () => {
    if (projectId && stageId && taskId && user) {
      loadData(parseInt(taskId), user.id);
    }
  };

  const handleAssignmentSuccess = () => {
    if (projectId && stageId && taskId && user) {
      loadData(parseInt(taskId), user.id);
    }
  };

  // Editar daily_hours de um usuário
  const handleEditUserHours = (assignee: any) => {
    setEditingUserId(assignee.id);
    setEditDailyHours(assignee.daily_hours || 0);
    setEditError(null);
  };

  // Salvar daily_hours editado
  const handleSaveUserHours = async () => {
    if (!editingUserId || !taskId) return;

    try {
      setEditError(null);
      await tasksService.updateAssignmentDailyHours(
        parseInt(taskId),
        editingUserId,
        editDailyHours
      );

      // Recarregar dados
      if (projectId && stageId && taskId && user) {
        loadData(parseInt(taskId), user.id);
      }

      // Fechar edição
      setEditingUserId(null);
      setEditDailyHours(0);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao atualizar horas';
      setEditError(errorMsg);
      console.error('Erro ao atualizar horas:', err);
    }
  };

  const navigateBack = () => {
    if (projectId && stageId) {
      navigate(`/projects/${projectId}/stages/${stageId}/tasks`);
    }
  };

  const getProgressPercentage = () => {
    if (!task || !Array.isArray(sessions)) return 0;

    const estimatedHours = parseFloat(task.estimated_hours?.toString() || '1');
    if (estimatedHours <= 0) return 0;

    try {
      const completedHours = sessions
        .filter((s) => s.status === 'stopped')
        .reduce((sum, s) => {
          const hours = parseFloat(s.duration_hours?.toString() || '0');
          return sum + (isNaN(hours) ? 0 : hours);
        }, 0);

      const percentage = (completedHours / estimatedHours) * 100;
      return Math.min(Math.round(percentage), 100);
    } catch (error) {
      console.error('Erro ao calcular progresso:', error);
      return 0;
    }
  };

  const getRiskStatus = (task: Task) => {
    if (!task.due_date) return null;
    const daysUntilDue = Math.ceil(
      (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilDue < 0) return { text: 'ATRASADO', color: 'text-red-700 bg-red-50' };
    if (daysUntilDue <= 3) return { text: 'CRÍTICO', color: 'text-orange-700 bg-orange-50' };
    if (daysUntilDue <= 7) return { text: 'ATENÇÃO', color: 'text-yellow-700 bg-yellow-50' };
    return { text: 'NO PRAZO', color: 'text-green-700 bg-green-50' };
  };

  // Calcular conclusão estimada dinamicamente baseada nos daily_hours dos assignees
  const getEstimatedCompletionDate = () => {
    if (!task || !Array.isArray(assignees) || assignees.length === 0) {
      return 'N/A';
    }

    const estimatedHours = parseFloat(task.estimated_hours?.toString() || '0');
    if (estimatedHours <= 0) return 'N/A';

    // Soma todos os daily_hours dos assignees (trabalho paralelo)
    const totalDailyHours = assignees.reduce((sum, assignee) => {
      const hours = parseFloat(assignee.daily_hours?.toString() || '0');
      return sum + (isNaN(hours) ? 0 : hours);
    }, 0);

    if (totalDailyHours <= 0) {
      return 'N/A';
    }

    // Calcula dias necessários
    const diasNecessarios = Math.ceil(estimatedHours / totalDailyHours);

    // Data estimada = hoje + dias necessários
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + diasNecessarios);

    return estimatedDate.toLocaleDateString('pt-BR');
  };

  const getEstimatedDaysLabel = () => {
    if (!task || !Array.isArray(assignees) || assignees.length === 0) {
      return 'Nenhum usuário atribuído';
    }

    const estimatedHours = parseFloat(task.estimated_hours?.toString() || '0');
    const totalDailyHours = assignees.reduce((sum, a) => sum + (parseFloat(a.daily_hours?.toString() || '0')), 0);

    if (totalDailyHours <= 0) {
      return 'Defina horas diárias';
    }

    const diasNecessarios = Math.ceil(estimatedHours / totalDailyHours);
    return `Baseado em ${totalDailyHours.toFixed(1)}h/dia (${assignees.length} usuário${assignees.length > 1 ? 's' : ''})`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={navigateBack}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-4"
          >
            ← Voltar para Tarefas
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">❌ {error}</p>
            <button
              onClick={() =>
                taskId && user && loadData(parseInt(taskId), user.id)
              }
              className="mt-2 text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando tarefa...</span>
          </div>
        )}

        {/* Task Details */}
        {!loading && task && (
          <>
            {/* Header */}
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
                  {task.description && (
                    <p className="text-gray-600 mb-4">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="block text-gray-600 font-medium">ID</span>
                      <span className="block text-gray-900">{task.id}</span>
                    </div>
                    <div>
                      <span className="block text-gray-600 font-medium">Status</span>
                      <span className="block text-gray-900">{task.status}</span>
                    </div>
                    <div>
                      <span className="block text-gray-600 font-medium">Prioridade</span>
                      <span className="block text-gray-900">{task.priority}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Status Badge */}
                {getRiskStatus(task) && (
                  <div className={`px-4 py-2 rounded-lg font-semibold text-center ${getRiskStatus(task)?.color}`}>
                    {getRiskStatus(task)?.text}
                  </div>
                )}
              </div>
            </div>

            {/* Progress & Metrics */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Estimated Hours */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Horas Estimadas</p>
                <p className="text-4xl font-bold text-gray-900 mb-2">{task.estimated_hours}h</p>
                <p className="text-xs text-gray-600">Alocado para projeto</p>
              </div>

              {/* Daily Hours */}
              <div
                onClick={() => setIsDailyHoursDetailsOpen(true)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <p className="text-sm font-medium text-gray-600 mb-2 group-hover:text-blue-600 transition-colors">
                  Horas Dedicadas
                </p>
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  {assignees.reduce((sum, a) => sum + (parseFloat(a.daily_hours?.toString() || '0')), 0).toFixed(2)}h
                </p>
                <p className="text-xs text-gray-600">
                  {assignees.length > 0
                    ? `${assignees.length} usuário${assignees.length !== 1 ? 's' : ''} comprometido${assignees.length !== 1 ? 's' : ''}`
                    : 'Clique para ver detalhes'}
                </p>
                <p className="text-xs text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  ⓘ Clique para ver detalhes
                </p>
              </div>

              {/* Progress */}
              <div
                onClick={() => setIsProgressChartOpen(true)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-green-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Progresso</p>
                  <p className="text-xs text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    📊 Ver gráfico
                  </p>
                </div>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  {getProgressPercentage()}%
                </p>
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Time Tracking Control */}
            {dayStatus && (
              <div className="mb-8">
                <TimeTrackingControls
                  taskId={task.id}
                  activeSession={activeSession}
                  dayStatus={dayStatus}
                  onSessionChange={handleSessionChange}
                />
              </div>
            )}

            {/* Deadlines */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {task.due_date && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">Data de Conclusão</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(task.due_date).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Prazo definido para entrega
                  </p>
                </div>
              )}

              {/* Estimated Completion Date - DINÂMICA */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <p className="text-sm font-medium text-gray-600 mb-2">Conclusão Estimada</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getEstimatedCompletionDate()}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {getEstimatedDaysLabel()}
                </p>
              </div>
            </div>

            {/* Assignees Section */}
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Usuários Atribuídos</h3>
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Atribuir Usuário
                </button>
              </div>

              {assignees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignees.map((assignee) => (
                    <div
                      key={assignee.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{assignee.full_name}</p>
                          <p className="text-sm text-gray-600">{assignee.email}</p>
                        </div>
                        <button
                          onClick={() => setIsAssignModalOpen(true)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                          title="Remover atribuição"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Role Badge */}
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded mb-3">
                        {assignee.role === 'admin'
                          ? '👤 Admin'
                          : assignee.role === 'supervisor'
                          ? '👨‍💼 Supervisor'
                          : '👤 Usuário'}
                      </span>

                      {/* Daily Hours Section */}
                      {editingUserId === assignee.id ? (
                        // Edit Mode
                        <div className="space-y-2 p-3 bg-white rounded border border-blue-200">
                          <label className="block text-xs font-medium text-gray-700">
                            Horas/dia (máximo 8h):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="8"
                            step="0.5"
                            value={editDailyHours}
                            onChange={(e) => setEditDailyHours(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            autoFocus
                          />
                          {editError && (
                            <p className="text-xs text-red-600 mt-1">{editError}</p>
                          )}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSaveUserHours}
                              className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Compromisso:</p>
                            <p className="text-lg font-bold text-blue-600">
                              {assignee.daily_hours || 0}h/dia
                            </p>
                            {task?.daily_hours !== assignee.daily_hours && (
                              <p className="text-xs text-gray-500 mt-1">
                                (sugestão: {task?.daily_hours}h)
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleEditUserHours(assignee)}
                            className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
                          >
                            Editar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">Nenhum usuário atribuído a esta tarefa</p>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Atribuir Primeiro Usuário
                  </button>
                </div>
              )}
            </div>

            {/* Filtros de Histórico - NOVO */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Filtros de Histórico
              </h3>

              <div className="flex flex-wrap gap-4 items-end">
                {/* Botões de Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período:
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setHistoryPeriod('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        historyPeriod === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setHistoryPeriod('today')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        historyPeriod === 'today'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Hoje
                    </button>
                    <button
                      onClick={() => setHistoryPeriod('week')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        historyPeriod === 'week'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Semana
                    </button>
                    <button
                      onClick={() => setHistoryPeriod('month')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        historyPeriod === 'month'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Mês
                    </button>
                    <button
                      onClick={() => setHistoryPeriod('custom')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        historyPeriod === 'custom'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Customizado
                    </button>
                  </div>
                </div>

                {/* Date Pickers (apenas se custom) */}
                {historyPeriod === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        De:
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Até:
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Filtro de Usuário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuário:
                  </label>
                  <select
                    value={historyUserFilter || ''}
                    onChange={(e) => setHistoryUserFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos os usuários</option>
                    {assignees.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sessions History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Histórico de Sessões
                {historyPeriod === 'all' && ' - Todos'}
                {historyPeriod === 'today' && ' - Hoje'}
                {historyPeriod === 'week' && ' - Últimos 7 dias'}
                {historyPeriod === 'month' && ' - Últimos 30 dias'}
                {historyPeriod === 'custom' && ' - Período Customizado'}
                {historyUserFilter && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (Filtrado por {assignees.find(a => a.id === historyUserFilter)?.full_name})
                  </span>
                )}
              </h3>
              {historySessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Início</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Usuário</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Duração</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historySessions.map((session) => (
                        <tr
                          key={session.id}
                          onClick={() => {
                            setSelectedSession(session);
                            setIsDetailsModalOpen(true);
                          }}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4">
                            {new Date(session.start_time).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-3 px-4">
                            {assignees.find(a => a.id === session.user_id)?.full_name || 'Desconhecido'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                session.status === 'stopped'
                                  ? 'bg-green-100 text-green-800'
                                  : session.status === 'running'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {session.status === 'stopped' && '✓ Finalizada'}
                              {session.status === 'running' && '▶️ Em andamento'}
                              {session.status === 'paused' && '⏸️ Pausada'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            {timeEntriesService.formatDuration(
                              session.duration_hours || 0
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {session.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">Nenhuma sessão encontrada para o período selecionado</p>
              )}
            </div>
          </>
        )}

        {/* Assign Users Modal */}
        <AssignUsersModal
          taskId={parseInt(taskId || '0')}
          taskDailyHours={task?.daily_hours}
          currentAssignees={assignees}
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={handleAssignmentSuccess}
        />

        {/* Session Details Modal */}
        <SessionDetailsModal
          session={selectedSession}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />

        {/* Daily Hours Details Modal */}
        <DailyHoursDetailsModal
          isOpen={isDailyHoursDetailsOpen}
          taskTitle={task?.title}
          suggestedHours={task?.daily_hours || 0}
          assignees={assignees}
          onClose={() => setIsDailyHoursDetailsOpen(false)}
        />

        {/* Progress Chart Modal */}
        {task && (
          <ProgressChartModal
            isOpen={isProgressChartOpen}
            taskId={task.id}
            taskTitle={task.title}
            suggestedHours={task.daily_hours || 0}
            assignees={assignees}
            onClose={() => setIsProgressChartOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
