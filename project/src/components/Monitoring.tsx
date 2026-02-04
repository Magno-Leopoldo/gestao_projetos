import { useEffect, useState } from 'react';
import { Calendar, Users, Filter, ChevronDown, Star, AlertCircle } from 'lucide-react';
import { TaskStatus, STATUS_LABELS } from '../types';
import { usersService } from '../services/usersService';
import { projectsService } from '../services/projectsService';
import { tasksService } from '../services/tasksService';
import { timeEntriesService } from '../services/timeEntriesService';

interface Supervisor {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface SupervisorPerformance {
  supervisor: Supervisor;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  refacaTasks: number;
  completionRate: number;
  rating: number; // 1-5 stars
  teamSize: number;
  avgHours: number;
  status: 'excelente' | 'bom' | 'atencao';
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  periodPreset: 'today' | '7days' | '30days' | 'custom';
  supervisorId: number | null;
  statusFilters: TaskStatus[];
}

interface TeamMemberWorkload {
  user_id: number;
  user_name: string;
  supervisor_id: number;
  supervisor_name: string;
  allocated_hours: number;  // Sum of daily_hours from assignments
  tracked_hours: number;    // Sum from time entries
  active_projects: number;
  completion_rate: number;  // % of completed tasks
  member_since_days: number; // Days in the team
  status: 'no_limite' | 'atencao' | 'ok'; // Based on allocated vs limit
}

interface AssignmentHistory {
  id: number;
  user_id: number;
  user_name: string;
  supervisor_name: string;
  task_id: number;
  task_title: string;
  project_name: string;
  daily_hours: number;
  assigned_at: string; // ISO date
  task_status: TaskStatus;
  task_progress: number; // 0-100
}

interface AssignmentStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
}

export default function Monitoring() {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    periodPreset: '7days',
    supervisorId: null,
    statusFilters: ['novo', 'em_desenvolvimento', 'analise_tecnica', 'concluido', 'refaca'],
  });

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorsPerformance, setSupervisorsPerformance] = useState<SupervisorPerformance[]>([]);
  const [teamMembersWorkload, setTeamMembersWorkload] = useState<TeamMemberWorkload[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([]);
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats>({
    total: 0,
    today: 0,
    this_week: 0,
    this_month: 0,
  });
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  // Reload team members workload when supervisor filter changes
  useEffect(() => {
    if (supervisors.length > 0) {
      const filteredSupervisors = filters.supervisorId
        ? supervisors.filter((s) => s.id === filters.supervisorId)
        : supervisors;

      if (filteredSupervisors.length > 0) {
        loadTeamMembersWorkload(filteredSupervisors);
      }
    }
  }, [filters.supervisorId, supervisors]);

  // Reload assignment history when filters change
  useEffect(() => {
    if (supervisors.length > 0) {
      loadAssignmentHistory();
    }
  }, [filters.supervisorId]);

  async function loadMonitoringData() {
    try {
      // Carregar supervisores
      const allUsers = await usersService.getAll();
      const supervisorsList = allUsers.filter(
        (user: any) => user.role === 'supervisor' || user.role === 'admin'
      );
      setSupervisors(supervisorsList);

      // Carregar dados de performance para cada supervisor
      const performanceData: SupervisorPerformance[] = [];

      for (const supervisor of supervisorsList) {
        try {
          // Carregar projetos do supervisor (com stages incluídos)
          const projects = await projectsService.getAll({ include: 'stages' });
          const supervisorProjects = projects.filter(
            (p: any) => p.supervisor_id === supervisor.id
          );

          let totalTasks = 0;
          let completedTasks = 0;
          let refacaTasks = 0;
          let teamMembers = new Set<number>();

          // Para cada projeto, carregar tarefas e calcular métricas
          for (const project of supervisorProjects) {
            if (project.stages && Array.isArray(project.stages)) {
              for (const stage of project.stages) {
                const stageTasks = await tasksService.getByStage(stage.id);
                const tasks = stageTasks.data || [];

                totalTasks += tasks.length;
                completedTasks += tasks.filter((t: any) => t.status === 'concluido').length;
                refacaTasks += tasks.filter((t: any) => t.status === 'refaca').length;

                // Contar membros únicos da equipe
                tasks.forEach((task: any) => {
                  if (task.assignees_array) {
                    task.assignees_array.forEach((assignee: any) => {
                      teamMembers.add(assignee.id);
                    });
                  }
                });
              }
            }
          }

          const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
          const rating = Math.ceil((completionRate / 20)); // 1-5 stars based on percentage

          // Determinar status baseado em completionRate
          let status: 'excelente' | 'bom' | 'atencao' = 'atencao';
          if (completionRate >= 80) status = 'excelente';
          else if (completionRate >= 60) status = 'bom';

          performanceData.push({
            supervisor,
            totalProjects: supervisorProjects.length,
            activeProjects: supervisorProjects.filter((p: any) => p.status === 'active').length,
            totalTasks,
            completedTasks,
            refacaTasks,
            completionRate,
            rating: Math.min(5, Math.max(1, rating)),
            teamSize: teamMembers.size,
            avgHours: 0, // TODO: Calcular de verdade se necessário
            status,
          });
        } catch (error) {
          console.error(`Erro ao carregar dados do supervisor ${supervisor.full_name}:`, error);
        }
      }

      // Ordenar por completion rate (descendente)
      performanceData.sort((a, b) => b.completionRate - a.completionRate);
      setSupervisorsPerformance(performanceData);

      // Carregar dados de carga de trabalho da equipe
      await loadTeamMembersWorkload(supervisorsList);

      // Carregar histórico de atribuições
      await loadAssignmentHistory();
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAssignmentHistory() {
    try {
      const history: AssignmentHistory[] = [];
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Carregar todos os projetos e suas tarefas
      const allProjects = await projectsService.getAll({ include: 'stages' });
      let supervisorsMap = new Map<number, Supervisor>();
      supervisors.forEach((s) => supervisorsMap.set(s.id, s));

      // Determinar filtro de supervisor (se houver)
      let filteredProjects = allProjects;
      if (filters.supervisorId) {
        filteredProjects = allProjects.filter(
          (p: any) => p.supervisor_id === filters.supervisorId
        );
      }

      // Iterar sobre projetos e stages para coletar atribuições
      for (const project of filteredProjects) {
        if (project.stages && Array.isArray(project.stages)) {
          for (const stage of project.stages) {
            const stageTasks = await tasksService.getByStage(stage.id);
            const tasks = stageTasks.data || [];

            for (const task of tasks) {
              // Coletar atribuições da tarefa
              const assignments = task.assignments_array || [];

              for (const assignment of assignments) {
                const userId = assignment.user_id || assignment.id;
                const supervisor = supervisorsMap.get(project.supervisor_id);

                history.push({
                  id: `${task.id}-${userId}`, // Fake ID para key
                  user_id: userId,
                  user_name: assignment.user_name || 'Desconhecido',
                  supervisor_name: supervisor?.full_name || 'N/A',
                  task_id: task.id,
                  task_title: task.title,
                  project_name: project.name,
                  daily_hours: parseFloat(String(assignment.daily_hours)) || 0,
                  assigned_at: assignment.assigned_at || new Date().toISOString(),
                  task_status: task.status,
                  task_progress: task.progress || 0,
                });
              }
            }
          }
        }
      }

      // Ordenar por data (mais recentes primeiro)
      history.sort((a, b) => new Date(b.assigned_at).getTime() - new Date(a.assigned_at).getTime());

      // Calcular estatísticas
      const stats = {
        total: history.length,
        today: history.filter((h) => {
          const date = new Date(h.assigned_at);
          return date.toDateString() === today.toDateString();
        }).length,
        this_week: history.filter((h) => {
          const date = new Date(h.assigned_at);
          return date >= startOfWeek && date <= today;
        }).length,
        this_month: history.filter((h) => {
          const date = new Date(h.assigned_at);
          return date >= startOfMonth && date <= today;
        }).length,
      };

      setAssignmentStats(stats);
      setAssignmentHistory(history);
      setAssignmentPage(1);
    } catch (error) {
      console.error('Erro ao carregar histórico de atribuições:', error);
      setAssignmentHistory([]);
    }
  }

  async function loadTeamMembersWorkload(supervisorsList: Supervisor[]) {
    try {
      const workloadMap = new Map<number, TeamMemberWorkload>();
      const usersMap = new Map<number, any>();

      // Carregar todos os usuários para referência rápida
      const allUsers = await usersService.getAll();
      allUsers.forEach((user: any) => {
        usersMap.set(user.id, user);
      });

      // Carregar todos os projetos e suas tarefas
      const allProjects = await projectsService.getAll({ include: 'stages' });

      for (const supervisor of supervisorsList) {
        const supervisorProjects = allProjects.filter(
          (p: any) => p.supervisor_id === supervisor.id
        );

        for (const project of supervisorProjects) {
          if (project.stages && Array.isArray(project.stages)) {
            for (const stage of project.stages) {
              const stageTasks = await tasksService.getByStage(stage.id);
              const tasks = stageTasks.data || [];

              // Processar cada tarefa para extrair informações de membros
              for (const task of tasks) {
                // Verificar assignments_array ou assignees_array (ambos são usados)
                const assignments = task.assignments_array || task.assignees_array || [];

                for (const assignment of assignments) {
                  const userId = assignment.user_id || assignment.id;
                  const dailyHours = assignment.daily_hours || 0;

                  if (!workloadMap.has(userId)) {
                    const user = usersMap.get(userId);
                    if (user) {
                      workloadMap.set(userId, {
                        user_id: userId,
                        user_name: user.full_name,
                        supervisor_id: supervisor.id,
                        supervisor_name: supervisor.full_name,
                        allocated_hours: 0,
                        tracked_hours: 0,
                        active_projects: 0,
                        completion_rate: 0,
                        member_since_days: 0,
                        status: 'ok',
                      });
                    }
                  }

                  const entry = workloadMap.get(userId);
                  if (entry) {
                    // Somar horas alocadas
                    entry.allocated_hours += parseFloat(String(dailyHours)) || 0;
                  }
                }
              }
            }
          }
        }

        // Definir active_projects para cada membro
        for (const [, entry] of workloadMap.entries()) {
          if (entry.supervisor_id === supervisor.id) {
            entry.active_projects = supervisorProjects.length;
          }
        }
      }

      // Calcular horas rastreadas para cada membro
      for (const [userId, entry] of workloadMap.entries()) {
        try {
          // Obter status do dia do usuário para horas rastreadas (apenas hoje por enquanto)
          const dayStatus = await timeEntriesService.getUserDayStatus(userId);
          if (dayStatus.success) {
            entry.tracked_hours = dayStatus.data.total_hours_tracked || 0;
          }
        } catch (error) {
          console.warn(`Erro ao carregar horas rastreadas do usuário ${userId}:`, error);
          entry.tracked_hours = 0;
        }

        // Determinar status baseado em horas alocadas
        if (entry.allocated_hours >= 8) {
          entry.status = 'no_limite';
        } else if (entry.allocated_hours >= 6) {
          entry.status = 'atencao';
        } else {
          entry.status = 'ok';
        }
      }

      // Converter para array e ordenar
      const workloadArray = Array.from(workloadMap.values());

      // Ordenação: no_limite → atencao → ok, dentro de cada grupo por horas descendente
      const statusOrder = { 'no_limite': 0, 'atencao': 1, 'ok': 2 };
      workloadArray.sort((a, b) => {
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        return b.allocated_hours - a.allocated_hours;
      });

      setTeamMembersWorkload(workloadArray);
    } catch (error) {
      console.error('Erro ao carregar carga de trabalho da equipe:', error);
      setTeamMembersWorkload([]);
    }
  }

  const handlePeriodPreset = (preset: 'today' | '7days' | '30days') => {
    const today = new Date();
    let dateFrom = new Date();

    switch (preset) {
      case 'today':
        dateFrom = new Date(today);
        break;
      case '7days':
        dateFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        dateFrom = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    setFilters({
      ...filters,
      periodPreset: preset,
      dateFrom: dateFrom.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0],
    });
  };

  const handleDateFromChange = (date: string) => {
    setFilters({
      ...filters,
      dateFrom: date,
      periodPreset: 'custom',
    });
  };

  const handleDateToChange = (date: string) => {
    setFilters({
      ...filters,
      dateTo: date,
      periodPreset: 'custom',
    });
  };

  const handleSupervisorChange = (supervisorId: number | null) => {
    setFilters({
      ...filters,
      supervisorId,
    });
  };

  const handleStatusToggle = (status: TaskStatus) => {
    setFilters((prev) => ({
      ...prev,
      statusFilters: prev.statusFilters.includes(status)
        ? prev.statusFilters.filter((s) => s !== status)
        : [...prev.statusFilters, status],
    }));
  };

  const handleResetFilters = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    setFilters({
      dateFrom: sevenDaysAgo.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0],
      periodPreset: '7days',
      supervisorId: null,
      statusFilters: ['novo', 'em_desenvolvimento', 'analise_tecnica', 'concluido', 'refaca'],
    });
  };

  // Formatar timestamp relativo (ex: "10 min atrás", "Ontem 16:45")
  function formatRelativeTime(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / (24 * 3600000));

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) {
      return `Ontem ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    if (diffDays < 7) return `${diffDays}d atrás`;

    // Formato: "15 Feb 14:30"
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Monitoramento</h1>
          <p className="text-gray-600">Análise profunda de desempenho, equipe e projetos</p>
        </div>

        {/* ===== SEÇÃO 1: FILTROS & PERÍODO ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Coluna 1: Período */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">📅 Período</h3>
            </div>

            {/* Inputs de Data */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">De:</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Até:</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Atalhos Rápidos */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-600">Atalhos:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handlePeriodPreset('today')}
                  className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                    filters.periodPreset === 'today'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => handlePeriodPreset('7days')}
                  className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                    filters.periodPreset === '7days'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  7 dias
                </button>
                <button
                  onClick={() => handlePeriodPreset('30days')}
                  className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                    filters.periodPreset === '30days'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  30 dias
                </button>
              </div>
            </div>
          </div>

          {/* Coluna 2: Filtrar Supervisor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">👤 Filtrar Supervisor</h3>
            </div>

            <div className="relative">
              <select
                value={filters.supervisorId || ''}
                onChange={(e) =>
                  handleSupervisorChange(e.target.value ? parseInt(e.target.value) : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os supervisores</option>
                {supervisors.map((supervisor) => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.full_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {filters.supervisorId && (
              <button
                onClick={() => handleSupervisorChange(null)}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpar filtro
              </button>
            )}
          </div>

          {/* Coluna 3: Filtrar Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">📊 Filtrar Status</h3>
            </div>

            <div className="space-y-2">
              {(['novo', 'em_desenvolvimento', 'analise_tecnica', 'concluido', 'refaca'] as TaskStatus[]).map(
                (status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.statusFilters.includes(status)}
                      onChange={() => handleStatusToggle(status)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{STATUS_LABELS[status]}</span>
                  </label>
                )
              )}
            </div>
          </div>
        </div>

        {/* Botão Limpar Filtros */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🔄 Limpar Filtros
          </button>
        </div>

        {/* Filtros Ativos - Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-blue-900">
            <strong>Filtros Ativos:</strong> Período:{' '}
            <span className="font-semibold">
              {filters.dateFrom} até {filters.dateTo}
            </span>
            {filters.supervisorId && (
              <>
                {' '}
                • Supervisor:{' '}
                <span className="font-semibold">
                  {supervisors.find((s) => s.id === filters.supervisorId)?.full_name}
                </span>
              </>
            )}
            {filters.statusFilters.length < 5 && (
              <>
                {' '}
                • Status:{' '}
                <span className="font-semibold">{filters.statusFilters.map((s) => STATUS_LABELS[s]).join(', ')}</span>
              </>
            )}
          </p>
        </div>

        {/* ===== SEÇÃO 2: DESEMPENHO DOS SUPERVISORES ===== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Desempenho dos Supervisores</h2>

          {supervisorsPerformance.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-600">
              <p>Nenhum supervisor encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {supervisorsPerformance.slice(0, 3).map((perf, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const statusColors = {
                  excelente: 'border-green-300 bg-green-50',
                  bom: 'border-blue-300 bg-blue-50',
                  atencao: 'border-yellow-300 bg-yellow-50',
                };

                return (
                  <div
                    key={perf.supervisor.id}
                    className={`rounded-lg shadow-sm border-2 p-6 ${statusColors[perf.status]}`}
                  >
                    {/* Header com Medal e Stars */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-3xl mb-2">{medals[index]}</div>
                        <h3 className="text-lg font-bold text-gray-900">{perf.supervisor.full_name}</h3>
                      </div>
                      <div className="text-2xl">
                        {'⭐'.repeat(perf.rating)}
                        {'☆'.repeat(5 - perf.rating)}
                      </div>
                    </div>

                    {/* Dados em Cards */}
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Projetos:</span>
                        <span className="font-semibold text-gray-900">
                          {perf.totalProjects} ({perf.activeProjects} Ativos)
                        </span>
                      </div>

                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(perf.activeProjects / Math.max(perf.totalProjects, 1)) * 100}%` }}
                        />
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxa Conclusão:</span>
                        <span className="font-semibold text-gray-900">{perf.completionRate}%</span>
                      </div>

                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            perf.completionRate >= 80
                              ? 'bg-green-500'
                              : perf.completionRate >= 60
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${perf.completionRate}%` }}
                        />
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Tarefas:</span>
                        <span className="font-semibold text-gray-900">
                          {perf.completedTasks}/{perf.totalTasks} ✓
                          {perf.refacaTasks > 0 && `, ${perf.refacaTasks} ⚠️`}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Equipe:</span>
                        <span className="font-semibold text-gray-900">{perf.teamSize} membros</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxa Refaça:</span>
                        <span
                          className={`font-semibold ${
                            perf.refacaTasks === 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {perf.totalTasks > 0
                            ? Math.round((perf.refacaTasks / perf.totalTasks) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    </div>

                    {/* Status e Ação */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            perf.status === 'excelente'
                              ? 'bg-green-200 text-green-800'
                              : perf.status === 'bom'
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-yellow-200 text-yellow-800'
                          }`}
                        >
                          {perf.status === 'excelente'
                            ? '🟢 Excelente'
                            : perf.status === 'bom'
                            ? '🟢 Bom'
                            : '🟡 Atenção'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== SEÇÃO 3: CARGA DE TRABALHO DA EQUIPE ===== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Carga de Trabalho da Equipe</h2>

          {teamMembersWorkload.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-600">
              <p>Nenhum membro de equipe encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">MEMBRO</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">SUPERVISOR</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ALOCADO</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">RASTREADO</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">DIFERENÇA</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">PROJETOS</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teamMembersWorkload.map((member) => {
                    const allocatedPercent = Math.min(100, (member.allocated_hours / 8) * 100);
                    const trackedPercent = Math.min(100, (member.tracked_hours / 8) * 100);
                    const differenceHours = member.allocated_hours - member.tracked_hours;
                    const differencePercent = member.allocated_hours > 0
                      ? Math.round((member.tracked_hours / member.allocated_hours) * 100)
                      : 0;

                    const statusColors = {
                      'no_limite': 'bg-red-50 hover:bg-red-100',
                      'atencao': 'bg-yellow-50 hover:bg-yellow-100',
                      'ok': 'bg-green-50 hover:bg-green-100',
                    };

                    const statusBadges = {
                      'no_limite': { emoji: '🔴', text: 'NO LIMITE', color: 'bg-red-200 text-red-800' },
                      'atencao': { emoji: '🟡', text: 'ATENÇÃO', color: 'bg-yellow-200 text-yellow-800' },
                      'ok': { emoji: '🟢', text: 'OK', color: 'bg-green-200 text-green-800' },
                    };

                    const badge = statusBadges[member.status];

                    return (
                      <tr key={member.user_id} className={`transition-colors ${statusColors[member.status]}`}>
                        {/* Membro */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">👤 {member.user_name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Desde: {member.member_since_days > 0 ? `${member.member_since_days}d` : 'Novo'}
                            </p>
                          </div>
                        </td>

                        {/* Supervisor */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{member.supervisor_name}</p>
                        </td>

                        {/* Alocado */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.allocated_hours.toFixed(1)}/8h ({allocatedPercent.toFixed(0)}%)
                            </p>
                            <div className="mt-2 w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  allocatedPercent >= 100 ? 'bg-red-500' :
                                  allocatedPercent >= 75 ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }`}
                                style={{ width: `${allocatedPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Rastreado */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {member.tracked_hours.toFixed(1)}h ({trackedPercent.toFixed(0)}%)
                            </p>
                            <div className="mt-2 w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500"
                                style={{ width: `${trackedPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Diferença */}
                        <td className="px-6 py-4">
                          <p className={`text-sm font-medium ${
                            differenceHours < 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {differenceHours >= 0 ? '+' : ''}{differenceHours.toFixed(1)}h ({differencePercent}%)
                          </p>
                        </td>

                        {/* Projetos */}
                        <td className="px-6 py-4 text-center">
                          <p className="text-sm font-medium text-gray-900">{member.active_projects}</p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                            {badge.emoji} {badge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== SEÇÃO 4: HISTÓRICO DE ATRIBUIÇÕES ===== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Histórico de Atribuições</h2>

          {/* Estatísticas no topo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium">TOTAL</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{assignmentStats.total}</p>
              <p className="text-xs text-gray-600 mt-1">atribuições</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium">HOJE</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{assignmentStats.today}</p>
              <p className="text-xs text-gray-600 mt-1">atribuições</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium">ESTA SEMANA</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{assignmentStats.this_week}</p>
              <p className="text-xs text-gray-600 mt-1">atribuições</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium">ESTE MÊS</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{assignmentStats.this_month}</p>
              <p className="text-xs text-gray-600 mt-1">atribuições</p>
            </div>
          </div>

          {/* Tabela de histórico */}
          {assignmentHistory.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-600">
              <p>Nenhuma atribuição encontrada</p>
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">TIMESTAMP</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">USUÁRIO</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">TAREFA / PROJETO</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">HORAS</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assignmentHistory.slice((assignmentPage - 1) * 15, assignmentPage * 15).map((item) => {
                      const statusBadgeColors = {
                        novo: 'bg-gray-200 text-gray-800',
                        em_desenvolvimento: 'bg-blue-200 text-blue-800',
                        analise_tecnica: 'bg-purple-200 text-purple-800',
                        concluido: 'bg-green-200 text-green-800',
                        refaca: 'bg-red-200 text-red-800',
                      };

                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">
                              {formatRelativeTime(item.assigned_at)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">👤 {item.user_name}</p>
                              <p className="text-xs text-gray-500 mt-1">({item.supervisor_name})</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.task_title}</p>
                              <p className="text-xs text-gray-500 mt-1">→ {item.project_name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <p className="text-sm font-medium text-gray-900">{item.daily_hours.toFixed(1)}h</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">✅</span>
                              <div>
                                <p className="text-xs font-medium text-gray-700">Ativo</p>
                                <p className="text-xs text-gray-600">Progresso: {item.task_progress}%</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {assignmentHistory.length > 15 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando {(assignmentPage - 1) * 15 + 1} a{' '}
                    {Math.min(assignmentPage * 15, assignmentHistory.length)} de {assignmentHistory.length}
                  </p>
                  <div className="space-x-2">
                    <button
                      onClick={() => setAssignmentPage(Math.max(1, assignmentPage - 1))}
                      disabled={assignmentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                      Página {assignmentPage} de {Math.ceil(assignmentHistory.length / 15)}
                    </span>
                    <button
                      onClick={() =>
                        setAssignmentPage(Math.min(Math.ceil(assignmentHistory.length / 15), assignmentPage + 1))
                      }
                      disabled={assignmentPage >= Math.ceil(assignmentHistory.length / 15)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Placeholder para Seções 5-9 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-600">
          <p className="text-lg font-medium">🚀 Seções 5-9 em desenvolvimento...</p>
          <p className="text-sm mt-2">
            Análises, Risco, Horas, Top Tarefas, Ranking
          </p>
        </div>
      </div>
    </div>
  );
}
