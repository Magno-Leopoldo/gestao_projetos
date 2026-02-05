import { useEffect, useState } from 'react';
import { Calendar, Users, Filter, ChevronDown, Star, AlertCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
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

interface AssignmentAnalysis {
  byUser: Array<{ name: string; count: number }>;
  bySupervisor: Array<{ name: string; count: number }>;
  byHours: Array<{ range: string; percentage: number; count: number }>;
  statistics: {
    average: number;
    mode: string;
    median: number;
    errorRate: number;
  };
  dailyTrend: Array<{ day: string; count: number }>;
}

interface RiskTask {
  id: number;
  title: string;
  project_name: string;
  supervisor_name: string;
  responsible_user: string;
  progress: number; // 0-100
  allocated_hours: number;
  tracked_hours: number;
  days_overdue: number; // Negativo se atrasado
  risk_level: 'critical' | 'high' | 'medium'; // 🔴 🟠 🟡
  risk_reason: string; // Por que está em risco
}

interface TaskWithCollaborators {
  id: number;
  title: string;
  project_name: string;
  supervisor_name: string;
  collaborators_count: number;
  total_allocated_hours: number;
  status: TaskStatus;
  progress: number;
}

interface TopTask {
  id: number;
  title: string;
  project_name: string;
  hours_tracked: number;
  team_size: number;
  progress: number;
  status: TaskStatus;
}

interface StatusDistribution {
  status: TaskStatus;
  count: number;
  percentage: number;
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
  const [assignmentAnalysis, setAssignmentAnalysis] = useState<AssignmentAnalysis>({
    byUser: [],
    bySupervisor: [],
    byHours: [],
    statistics: {
      average: 0,
      mode: '0h',
      median: 0,
      errorRate: 0,
    },
    dailyTrend: [],
  });
  const [riskTasks, setRiskTasks] = useState<RiskTask[]>([]);
  const [tasksWithCollaborators, setTasksWithCollaborators] = useState<TaskWithCollaborators[]>([]);
  const [topTasks, setTopTasks] = useState<TopTask[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
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

  // Reload assignment history and risk tasks when filters change
  useEffect(() => {
    if (supervisors.length > 0) {
      loadAssignmentHistory();
      loadRiskTasks();
    }
  }, [filters.supervisorId, supervisors]);

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

      // Carregar histórico de atribuições (passar supervisorsList para evitar timing issues com state)
      await loadAssignmentHistory(supervisorsList);

      // Carregar tarefas com mais colaboradores (passar supervisorsList para evitar timing issues com state)
      await loadTasksWithMostCollaborators(supervisorsList);
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAssignmentHistory(supervisorsList?: Supervisor[]) {
    try {
      const history: AssignmentHistory[] = [];
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Carregar todos os projetos e suas tarefas
      const allProjects = await projectsService.getAll({ include: 'stages' });
      let supervisorsMap = new Map<number, Supervisor>();
      // Usar supervisorsList passado como parâmetro, ou fallback para state 'supervisors'
      const supsToUse = supervisorsList || supervisors;
      supsToUse.forEach((s) => supervisorsMap.set(s.id, s));

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
              const assignments = task.assignees_array || [];

              for (const assignment of assignments) {
                const userId = assignment.user_id || assignment.id;
                const supervisor = supervisorsMap.get(project.supervisor_id);

                history.push({
                  id: `${task.id}-${userId}`, // Fake ID para key
                  user_id: userId,
                  user_name: assignment.full_name || assignment.user_name || 'Desconhecido',
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

      // Calcular análise das atribuições
      await calculateAssignmentAnalysis(history);

      // Carregar tarefas em risco
      await loadRiskTasks();

      // Calcular estatísticas de horas rastreadas
      await calculateTrackedHoursStats();

      // Carregar top 5 tarefas por horas e distribuição de status
      await loadTopTasks();
      await loadStatusDistribution();
    } catch (error) {
      console.error('Erro ao carregar histórico de atribuições:', error);
      setAssignmentHistory([]);
    }
  }

  async function loadTopTasks() {
    try {
      const tasks: TopTask[] = [];
      const allProjects = await projectsService.getAll({ include: 'stages' });

      // Determinar filtro de supervisor
      let filteredProjects = allProjects;
      if (filters.supervisorId) {
        filteredProjects = allProjects.filter(
          (p: any) => p.supervisor_id === filters.supervisorId
        );
      }

      // Mapa para contar horas e equipes por tarefa
      const taskMetrics = new Map<number, {
        task_id: number;
        title: string;
        project_name: string;
        team_members: Set<number>;
        total_hours: number;
        status: string;
      }>();

      // Coletar dados REAIS de time_entries e assignments
      for (const project of filteredProjects) {
        if (project.stages && Array.isArray(project.stages)) {
          for (const stage of project.stages) {
            const stageTasks = await tasksService.getByStage(stage.id);
            const projectTasks = stageTasks.data || [];

            for (const task of projectTasks) {
              // Contar equipe via assignees_array (dados REAIS do banco)
              const teamMembers = (task.assignees_array || [])
                .map((a: any) => a.user_id || a.id)
                .filter((id: number) => id);

              // Se tarefa tem equipe, incluir no mapa
              if (teamMembers.length > 0) {
                if (!taskMetrics.has(task.id)) {
                  taskMetrics.set(task.id, {
                    task_id: task.id,
                    title: task.title,
                    project_name: project.name,
                    team_members: new Set(teamMembers),
                    total_hours: 0,
                    status: task.status,
                  });
                }

                // Somar horas via daily_hours alocadas (dados REAIS)
                const allocatedHours = teamMembers.reduce((sum: number, _: number) => {
                  const assignment = (task.assignees_array || []).find(
                    (a: any) => (a.user_id || a.id) === _
                  );
                  return sum + (parseFloat(String(assignment?.daily_hours)) || 0);
                }, 0);

                const metric = taskMetrics.get(task.id);
                if (metric) {
                  metric.total_hours = allocatedHours;
                }
              }
            }
          }
        }
      }

      // Converter mapa para array e ordenar por team_size (desc), depois por horas (desc)
      const topTasksArray = Array.from(taskMetrics.values())
        .map((metric) => ({
          id: metric.task_id,
          title: metric.title,
          project_name: metric.project_name,
          hours_tracked: metric.total_hours,
          team_size: metric.team_members.size,
          progress: 0, // Campo não existe em tasks, manter como 0
          status: metric.status,
        }))
        .sort((a, b) => {
          // Ordenar por team_size DESC (prioridade 1)
          if (b.team_size !== a.team_size) {
            return b.team_size - a.team_size;
          }
          // Desempate: ordenar por horas DESC (prioridade 2)
          return b.hours_tracked - a.hours_tracked;
        })
        .slice(0, 5);

      setTopTasks(topTasksArray);
    } catch (error) {
      console.error('Erro ao carregar top tarefas:', error);
      setTopTasks([]);
    }
  }

  async function loadStatusDistribution() {
    try {
      const statusMap = new Map<TaskStatus, number>();
      const allProjects = await projectsService.getAll({ include: 'stages' });

      // Determinar filtro de supervisor
      let filteredProjects = allProjects;
      if (filters.supervisorId) {
        filteredProjects = allProjects.filter(
          (p: any) => p.supervisor_id === filters.supervisorId
        );
      }

      // Contar tarefas por status
      for (const project of filteredProjects) {
        if (project.stages && Array.isArray(project.stages)) {
          for (const stage of project.stages) {
            const stageTasks = await tasksService.getByStage(stage.id);
            const projectTasks = stageTasks.data || [];

            for (const task of projectTasks) {
              statusMap.set(task.status, (statusMap.get(task.status) || 0) + 1);
            }
          }
        }
      }

      // Converter para array com percentuais
      const total = Array.from(statusMap.values()).reduce((a, b) => a + b, 0);
      const distribution: StatusDistribution[] = Array.from(statusMap.entries())
        .map(([status, count]) => ({
          status,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      setStatusDistribution(distribution);
    } catch (error) {
      console.error('Erro ao carregar distribuição de status:', error);
      setStatusDistribution([]);
    }
  }

  async function loadTasksWithMostCollaborators(supervisorsList?: Supervisor[]) {
    try {
      const taskMetrics = new Map<number, {
        id: number;
        title: string;
        project_name: string;
        supervisor_name: string;
        collaborators_count: number;
        total_allocated_hours: number;
        status: TaskStatus;
        progress: number;
      }>();

      const allProjects = await projectsService.getAll({ include: 'stages' });
      let supervisorsMap = new Map<number, Supervisor>();
      // Usar supervisorsList passado como parâmetro, ou fallback para state 'supervisors'
      const supsToUse = supervisorsList || supervisors;
      supsToUse.forEach((s) => supervisorsMap.set(s.id, s));

      // Determinar filtro de supervisor
      let filteredProjects = allProjects;
      if (filters.supervisorId) {
        filteredProjects = allProjects.filter(
          (p: any) => p.supervisor_id === filters.supervisorId
        );
      }

      // Iterar sobre projetos para coletar tarefas com colaboradores
      for (const project of filteredProjects) {
        if (project.stages && Array.isArray(project.stages)) {
          for (const stage of project.stages) {
            const stageTasks = await tasksService.getByStage(stage.id);
            const tasks = stageTasks.data || [];

            for (const task of tasks) {
              const assignees = task.assignees_array || [];
              const collaboratorsCount = assignees.length;

              // Somar horas alocadas
              const totalAllocatedHours = assignees.reduce(
                (sum: number, assignee: any) => sum + (parseFloat(String(assignee.daily_hours)) || 0),
                0
              );

              // Só incluir tarefas com pelo menos 1 colaborador
              if (collaboratorsCount > 0) {
                const supervisor = supervisorsMap.get(project.supervisor_id);
                taskMetrics.set(task.id, {
                  id: task.id,
                  title: task.title,
                  project_name: project.name,
                  supervisor_name: supervisor?.full_name || 'N/A',
                  collaborators_count: collaboratorsCount,
                  total_allocated_hours: Math.round(totalAllocatedHours * 10) / 10,
                  status: task.status,
                  progress: task.progress || 0,
                });
              }
            }
          }
        }
      }

      // Converter para array e ordenar por número de colaboradores (descendente)
      const tasksArray = Array.from(taskMetrics.values())
        .sort((a, b) => {
          // Primeiro por número de colaboradores
          if (b.collaborators_count !== a.collaborators_count) {
            return b.collaborators_count - a.collaborators_count;
          }
          // Depois por horas alocadas
          return b.total_allocated_hours - a.total_allocated_hours;
        })
        .slice(0, 5); // Top 5

      setTasksWithCollaborators(tasksArray);
    } catch (error) {
      console.error('Erro ao carregar tarefas com mais colaboradores:', error);
      setTasksWithCollaborators([]);
    }
  }

  async function loadRiskTasks() {
    try {
      const tasks: RiskTask[] = [];
      const allProjects = await projectsService.getAll({ include: 'stages' });
      let supervisorsMap = new Map<number, Supervisor>();
      supervisors.forEach((s) => supervisorsMap.set(s.id, s));

      // Determinar filtro de supervisor
      let filteredProjects = allProjects;
      if (filters.supervisorId) {
        filteredProjects = allProjects.filter(
          (p: any) => p.supervisor_id === filters.supervisorId
        );
      }

      // Iterar sobre projetos para encontrar tarefas em risco
      for (const project of filteredProjects) {
        if (project.stages && Array.isArray(project.stages)) {
          for (const stage of project.stages) {
            const stageTasks = await tasksService.getByStage(stage.id);
            const projectTasks = stageTasks.data || [];

            for (const task of projectTasks) {
              // Não incluir tarefas concluídas ou canceladas
              if (task.status === 'concluido' || task.status === 'cancelado') continue;

              const assignments = task.assignments_array || [];
              const supervisor = supervisorsMap.get(project.supervisor_id);
              const progress = task.progress || 0;

              // Calcular horas alocadas e rastreadas
              let allocatedHours = 0;
              let responsibleUser = 'N/A';
              assignments.forEach((a: any) => {
                allocatedHours += parseFloat(String(a.daily_hours)) || 0;
                if (!responsibleUser || responsibleUser === 'N/A') {
                  responsibleUser = a.user_name || 'Desconhecido';
                }
              });

              // Determinar nível de risco
              let riskLevel: 'critical' | 'high' | 'medium' = 'medium';
              let riskReason = '';
              let daysOverdue = 0;

              // Critério 1: Progresso muito lento (< 30% com múltiplas atribuições)
              if (progress < 30 && allocatedHours > 0) {
                riskLevel = 'high';
                riskReason = 'Progresso muito lento';
              }

              // Critério 2: Status "em_análise" sem progresso
              if (task.status === 'analise_tecnica' && progress < 20) {
                riskLevel = 'high';
                riskReason = 'Análise técnica estagnada';
              }

              // Critério 3: Tarefas com status "refaca" (requerem trabalho extra)
              if (task.status === 'refaca') {
                riskLevel = 'critical';
                riskReason = 'Requer refação';
                daysOverdue = -2; // Simulação
              }

              // Critério 4: Progresso 0% há muito tempo (múltiplas atribuições)
              if (progress === 0 && allocatedHours >= 6) {
                riskLevel = 'critical';
                riskReason = 'Sem início de execução';
                daysOverdue = -1;
              }

              // Apenas adicionar se em risco
              if (riskLevel === 'critical' || riskLevel === 'high') {
                tasks.push({
                  id: task.id,
                  title: task.title,
                  project_name: project.name,
                  supervisor_name: supervisor?.full_name || 'N/A',
                  responsible_user: responsibleUser,
                  progress,
                  allocated_hours: allocatedHours,
                  tracked_hours: 0, // Simplificado por enquanto
                  days_overdue: daysOverdue,
                  risk_level: riskLevel,
                  risk_reason: riskReason,
                });
              }
            }
          }
        }
      }

      // Ordenar por criticidade
      const riskOrder = { 'critical': 0, 'high': 1, 'medium': 2 };
      tasks.sort((a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level]);

      setRiskTasks(tasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas em risco:', error);
      setRiskTasks([]);
    }
  }

  async function calculateAssignmentAnalysis(history: AssignmentHistory[]) {
    try {
      // Filtrar apenas atribuições desta semana
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const weekHistory = history.filter((h) => {
        const date = new Date(h.assigned_at);
        return date >= startOfWeek && date <= today;
      });

      // Análise por usuário
      const userMap = new Map<string, number>();
      weekHistory.forEach((h) => {
        userMap.set(h.user_name, (userMap.get(h.user_name) || 0) + 1);
      });
      const byUser = Array.from(userMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Análise por supervisor
      const supervisorMap = new Map<string, number>();
      weekHistory.forEach((h) => {
        supervisorMap.set(h.supervisor_name, (supervisorMap.get(h.supervisor_name) || 0) + 1);
      });
      const bySupervisor = Array.from(supervisorMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Análise por range de horas
      const ranges = [
        { range: '1-3h', min: 1, max: 3 },
        { range: '3-6h', min: 3, max: 6 },
        { range: '6-8h', min: 6, max: 8 },
      ];
      const byHours = ranges.map((r) => {
        const count = weekHistory.filter((h) => h.daily_hours >= r.min && h.daily_hours <= r.max).length;
        return {
          range: r.range,
          count,
          percentage: weekHistory.length > 0 ? Math.round((count / weekHistory.length) * 100) : 0,
        };
      });

      // Estatísticas
      const hours = weekHistory.map((h) => h.daily_hours);
      const average = hours.length > 0 ? hours.reduce((a, b) => a + b, 0) / hours.length : 0;
      const sorted = [...hours].sort((a, b) => a - b);
      const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];

      // Moda (valor mais frequente)
      const hourCounts = new Map<number, number>();
      hours.forEach((h) => {
        hourCounts.set(h, (hourCounts.get(h) || 0) + 1);
      });
      let mode = hours.length > 0 ? hours[0] : 0;
      let maxCount = 0;
      hourCounts.forEach((count, hour) => {
        if (count > maxCount) {
          maxCount = count;
          mode = hour;
        }
      });

      // Tendência por dia da semana
      const dayMap = new Map<string, number>();
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        dayMap.set(dayNames[d.getDay()], 0);
      }
      weekHistory.forEach((h) => {
        const date = new Date(h.assigned_at);
        const day = dayNames[date.getDay()];
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      });
      const dailyTrend = Array.from(dayMap.entries()).map(([day, count]) => ({ day, count }));

      // Taxa de erro (considerando 0 de erro para agora)
      const errorRate = 0;

      setAssignmentAnalysis({
        byUser,
        bySupervisor,
        byHours,
        statistics: {
          average: Math.round(average * 10) / 10,
          mode: `${mode}h`,
          median: Math.round(median * 10) / 10,
          errorRate,
        },
        dailyTrend,
      });
    } catch (error) {
      console.error('Erro ao calcular análise de atribuições:', error);
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
                // Contar apenas tarefas ativas (exigem interação)
                const activeStatuses = ['novo', 'em_desenvolvimento', 'analise_tecnica', 'refaca'];
                const isActiveTask = activeStatuses.includes(task.status);

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
                    // Contar apenas tarefas ativas (que exigem interação)
                    if (isActiveTask) {
                      entry.active_projects += 1;
                    }
                  }
                }
              }
            }
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
                    {/* Header com Medal */}
                    <div className="mb-4">
                      <div className="text-3xl mb-2">{medals[index]}</div>
                      <h3 className="text-lg font-bold text-gray-900">{perf.supervisor.full_name}</h3>
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
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">TAREFAS</th>
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

        {/* ===== SEÇÃO 5: ANÁLISE DE ATRIBUIÇÕES ===== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Análise de Atribuições</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda - Gráficos */}
            <div className="space-y-6">
              {/* Atribuições por Usuário */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Atribuições por Usuário (Esta Semana)</h3>
                {assignmentAnalysis.byUser.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={assignmentAnalysis.byUser} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={95} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-600 text-sm">Sem dados disponíveis</p>
                )}
              </div>

              {/* Atribuições por Supervisor */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Atribuições por Supervisor (Esta Semana)</h3>
                {assignmentAnalysis.bySupervisor.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={assignmentAnalysis.bySupervisor} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={95} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-600 text-sm">Sem dados disponíveis</p>
                )}
              </div>

              {/* Estatísticas da Semana */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Estatísticas da Semana</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Média por Dia:</span>
                    <span className="font-semibold text-gray-900">
                      {Math.round((assignmentHistory.filter((h) => {
                        const date = new Date(h.assigned_at);
                        const today = new Date();
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - today.getDay());
                        return date >= startOfWeek && date <= today;
                      }).length / 7) * 10) / 10}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Peak:</span>
                    <span className="font-semibold text-gray-900">
                      {Math.max(...(assignmentAnalysis.dailyTrend.map((d) => d.count) || [0]))} atribuições
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mínimo:</span>
                    <span className="font-semibold text-gray-900">
                      {Math.min(...(assignmentAnalysis.dailyTrend.map((d) => d.count) || [0]))} atribuições
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Padrões */}
            <div className="space-y-6">
              {/* Distribuição de Horas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Distribuição de Horas</h3>
                <div className="space-y-3">
                  {assignmentAnalysis.byHours.map((item) => (
                    <div key={item.range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.range}</span>
                        <span className="text-gray-900 font-semibold">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estatísticas de Horas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Análise de Horas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Média:</span>
                    <span className="font-semibold text-gray-900">{assignmentAnalysis.statistics.average}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Moda:</span>
                    <span className="font-semibold text-gray-900">{assignmentAnalysis.statistics.mode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mediana:</span>
                    <span className="font-semibold text-gray-900">{assignmentAnalysis.statistics.median}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxa de Erro:</span>
                    <span className="font-semibold text-gray-900">{assignmentAnalysis.statistics.errorRate}%</span>
                  </div>
                </div>
              </div>

              {/* Tendência de Atribuições */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tendência Diária</h3>
                {assignmentAnalysis.dailyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={assignmentAnalysis.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-600 text-sm">Sem dados disponíveis</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== SEÇÃO 6: TAREFAS EM RISCO ===== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">⚠️ Tarefas em Risco</h2>

          {riskTasks.length === 0 ? (
            <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-8 text-center">
              <p className="text-lg font-medium text-green-900">✅ Nenhuma tarefa em risco!</p>
              <p className="text-sm text-green-700 mt-2">Todas as tarefas estão em dia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {riskTasks.map((task, index) => {
                const riskColors = {
                  critical: 'border-red-300 bg-red-50',
                  high: 'border-orange-300 bg-orange-50',
                  medium: 'border-yellow-300 bg-yellow-50',
                };

                const riskEmojis = {
                  critical: '🔴',
                  high: '🟠',
                  medium: '🟡',
                };

                const riskLabels = {
                  critical: 'CRÍTICO',
                  high: 'RISCO',
                  medium: 'ATENÇÃO',
                };

                return (
                  <div
                    key={task.id}
                    className={`rounded-lg shadow-sm border-2 p-6 ${riskColors[task.risk_level]}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl font-bold text-gray-900 bg-white px-3 py-1 rounded">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{riskEmojis[task.risk_level]}</span>
                            <span
                              className={`px-3 py-1 rounded text-xs font-semibold ${
                                task.risk_level === 'critical'
                                  ? 'bg-red-200 text-red-800'
                                  : task.risk_level === 'high'
                                  ? 'bg-orange-200 text-orange-800'
                                  : 'bg-yellow-200 text-yellow-800'
                              }`}
                            >
                              {riskLabels[task.risk_level]}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Razão: {task.risk_reason}</p>
                        </div>
                      </div>
                      {task.days_overdue < 0 && (
                        <span className="text-lg font-bold text-red-600">❌ {task.days_overdue} dias</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.project_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          <strong>Supervisor:</strong> {task.supervisor_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Responsável:</strong> {task.responsible_user}
                        </p>
                      </div>
                    </div>

                    {/* Progresso */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progresso: {task.progress}%</span>
                        <span className="text-sm font-medium text-gray-700">
                          Horas: {task.tracked_hours.toFixed(1)}h / {task.allocated_hours.toFixed(1)}h
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            task.progress >= 75 ? 'bg-green-500' : task.progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== SEÇÃO 7: TOP 5 TAREFAS COM MAIS COLABORADORES ===== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 Top 5 Tarefas com Mais Colaboradores</h2>

          {tasksWithCollaborators.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-600">
              <p>Nenhuma tarefa encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">TAREFA / PROJETO</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">SUPERVISOR</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">COLABORADORES</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">HORAS TOTAIS</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">STATUS</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">PROGRESSO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasksWithCollaborators.map((task, index) => {
                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                    const statusBadgeColors = {
                      novo: 'bg-gray-200 text-gray-800',
                      em_desenvolvimento: 'bg-blue-200 text-blue-800',
                      analise_tecnica: 'bg-purple-200 text-purple-800',
                      concluido: 'bg-green-200 text-green-800',
                      refaca: 'bg-red-200 text-red-800',
                    };

                    return (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-center">
                          <span className="text-2xl">{medals[index]}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.project_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">{task.supervisor_name}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl">👥</span>
                            <span className="text-sm font-semibold text-gray-900">{task.collaborators_count}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="text-sm font-semibold text-gray-900">{task.total_allocated_hours}h</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              statusBadgeColors[task.status]
                            }`}
                          >
                            {STATUS_LABELS[task.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-300 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  task.progress >= 75
                                    ? 'bg-green-500'
                                    : task.progress >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700 w-8 text-right">{task.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== SEÇÃO 8: TOP 5 TAREFAS POR HORAS ===== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏅 Top 5 Tarefas por Horas</h2>

          {topTasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-600">
              <p>Nenhuma tarefa encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">TAREFA / PROJETO</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">HORAS</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">EQUIPE</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">PROGRESSO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topTasks.map((task, index) => {
                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

                    return (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-center">
                          <span className="text-2xl">{medals[index]}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.project_name}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="text-sm font-semibold text-gray-900">{task.hours_tracked}h</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="text-sm font-semibold text-gray-900">{task.team_size} pessoa(s)</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  task.progress >= 75 ? 'bg-green-500' : task.progress >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{task.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== SEÇÃO 9: DISTRIBUIÇÃO DE STATUS ===== */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Distribuição de Status</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Pizza */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Status das Tarefas</h3>
              {statusDistribution.length > 0 ? (
                <div className="space-y-4">
                  {statusDistribution.map((item) => {
                    const statusColors = {
                      novo: 'bg-gray-400',
                      em_desenvolvimento: 'bg-blue-400',
                      analise_tecnica: 'bg-purple-400',
                      concluido: 'bg-green-400',
                      refaca: 'bg-red-400',
                    };

                    const statusLabels = {
                      novo: 'Novo',
                      em_desenvolvimento: 'Em Desenvolvimento',
                      analise_tecnica: 'Análise Técnica',
                      concluido: 'Concluído',
                      refaca: 'Refaça',
                    };

                    return (
                      <div key={item.status}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${statusColors[item.status]}`} />
                            <span className="text-sm font-medium text-gray-700">{statusLabels[item.status]}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={statusColors[item.status]}
                            style={{ width: `${item.percentage}%`, height: '100%' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Sem dados disponíveis</p>
              )}
            </div>

            {/* Resumo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resumo da Equipe</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total de Tarefas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {statusDistribution.reduce((sum, item) => sum + item.count, 0)}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Taxa de Conclusão</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {Math.round(
                      (statusDistribution.find((s) => s.status === 'concluido')?.percentage || 0)
                    )}%
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Em Desenvolvimento</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {Math.round(
                      (statusDistribution.find((s) => s.status === 'em_desenvolvimento')?.percentage || 0)
                    )}%
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Requerem Ação</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {Math.round(
                      ((statusDistribution.find((s) => s.status === 'refaca')?.percentage || 0) +
                        (statusDistribution.find((s) => s.status === 'analise_tecnica')?.percentage || 0)) /
                        2
                    )}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
