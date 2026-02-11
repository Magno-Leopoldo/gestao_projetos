// =====================================================
// TIPOS GLOBAIS - Sistema de Gestão de Projetos
// =====================================================

// =====================================================
// ENUMS
// =====================================================

export type UserRole = 'user' | 'supervisor' | 'admin';

export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';

export type TaskStatus = 'novo' | 'em_desenvolvimento' | 'analise_tecnica' | 'concluido' | 'refaca';

export type TaskPriority = 'low' | 'medium' | 'high';

export type ProjectRiskStatus = 'ON_TRACK' | 'WARNING' | 'AT_RISK' | 'DELAYED' | 'NO_DEADLINE';

// =====================================================
// MODELOS DE DADOS
// =====================================================

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  supervisor_id?: number;
  start_date?: string; // ISO date string
  due_date?: string; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface ProjectStage {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  order: number;
  is_parallel: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  stage_id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  estimated_hours: number;
  daily_hours: number;
  priority: TaskPriority;
  order: number;
  due_date?: string;
  latest_refacao_reason?: string | null;
  latest_refacao_changed_by?: string | null;
  latest_refacao_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskStatusHistoryEntry {
  id: number;
  task_id: number;
  from_status: TaskStatus | null;
  to_status: TaskStatus;
  reason: string | null;
  changed_by: number;
  changed_by_name: string;
  changed_at: string;
}

export interface TaskAssignment {
  id: number;
  task_id: number;
  user_id: number;
  assigned_at: string;
}

export interface TimeEntry {
  id: number;
  task_id: number;
  user_id: number;
  hours: number;
  date: string; // ISO date string
  notes?: string;
  created_at: string;
}

// =====================================================
// TIPOS ESTENDIDOS (Com Relacionamentos)
// =====================================================

export interface UserWithStats extends User {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  refaca_tasks: number;
  total_daily_hours: number;
  total_logged_hours: number;
}

export interface ProjectWithSupervisor extends Project {
  supervisor?: User;
}

export interface ProjectWithDetails extends ProjectWithSupervisor {
  stages: StageWithTasks[];
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  risk_status?: ProjectRiskStatus;
  estimated_completion_date?: string;
}

export interface StageWithTasks extends ProjectStage {
  tasks: TaskWithAssignees[];
}

export interface TaskWithAssignees extends Task {
  assignees: User[];
}

export interface TaskAssigneeWithMetrics {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  daily_hours: number;
}

export interface TaskWithMetrics extends Task {
  assignee_ids?: string; // Para compatibilidade
  assignees?: string; // Para compatibilidade (string)
  assignees_array?: TaskAssigneeWithMetrics[]; // Novo formato
  metrics?: {
    total_horas_reais: number;
    total_colaboradores: number;
    taxa_media_percent: number;
    status_risco: 'NO_PRAZO' | 'RISCO' | 'CRITICO';
  };
  collaborator_metrics?: Array<{
    user_id: number;
    full_name: string;
    horas_registradas: number;
    taxa_progresso_user: number;
  }>;
}

export interface PaginatedTasksResponse {
  data: TaskWithMetrics[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface TaskWithDetails extends TaskWithAssignees {
  project_id: number;
  project_name: string;
  stage_name: string;
  supervisor?: User;
  time_entries: TimeEntry[];
  total_logged_hours: number;
  progress_percentage: number;
  metrics?: TaskMetrics;
  collaborator_metrics?: CollaboratorMetrics[];
}

// =====================================================
// TIME ENTRIES (NOVO - FASE 3)
// =====================================================

export type TimeEntryStatus = 'running' | 'paused' | 'stopped';

export interface TimeEntrySession {
  id: number;
  task_id: number;
  user_id: number;
  start_time: string; // ISO DateTime
  pause_time?: string;
  resume_time?: string;
  end_time?: string;
  duration_minutes?: number;
  duration_hours?: number;
  duration_total_seconds?: number; // Total de segundos de trabalho (mais preciso)
  paused_minutes?: number; // Total de minutos pausado
  paused_total_seconds?: number; // Total de segundos pausado (mais preciso)
  pause_count?: number; // Quantas vezes foi pausado
  status: TimeEntryStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskMetrics {
  data_inicio_real?: string;
  total_horas_reais: number;
  total_colaboradores: number;
  taxa_media_percent: number;
  dias_necessarios?: number;
  fim_real_estimado?: string;
  dias_diferenca?: number;
  status_risco: 'NO_PRAZO' | 'RISCO' | 'CRITICO';
}

export interface CollaboratorMetrics {
  task_id: number;
  user_id: number;
  full_name: string;
  estimated_hours: number;
  daily_hours: number;
  horas_estimadas_user: number;
  horas_registradas: number;
  taxa_progresso_user: number;
  dias_trabalho: number;
  status_user: 'SEM_INICIAR' | 'EM_PROGRESSO' | 'CONCLUIDO';
}

export interface DayStatusSummary {
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
  paused_session?: {
    task_id: number;
    task_title: string;
    session_id: number;
    paused_at: string;
    duration_so_far: number;
  } | null;
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
}

export interface TimeEntryValidation {
  can_start: boolean;
  completed_hours_today: number;
  available_hours: number;
  max_hours: number;
  active_sessions: number;
  warning_level: 'low' | 'medium' | 'high';
}

// =====================================================
// CALENDÁRIO (FASE 6)
// =====================================================

export interface CalendarAllocation {
  id: number;
  task_id: number;
  user_id: number;
  allocation_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  notes?: string;
  task_title: string;
  task_status: TaskStatus;
  priority: TaskPriority;
  project_name: string;
  project_id: number;
  stage_name: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: CalendarAllocation;
}

export interface UnallocatedTask {
  task_id: number;
  task_title: string;
  project_name: string;
  project_id: number;
  stage_name: string;
  priority: TaskPriority;
  status: TaskStatus;
  daily_hours: number;
  estimated_hours: number;
  total_allocated_minutes: number;
  remaining_minutes: number;
}

export interface DailySummary {
  total_allocated_minutes: number;
  total_allocated_hours: number;
  max_hours: number;
  remaining_hours: number;
  allocations_count: number;
}

// =====================================================
// DTOs (Data Transfer Objects) - Para APIs
// =====================================================

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Projects
export interface CreateProjectRequest {
  name: string;
  description?: string;
  start_date?: string;
  due_date: string;
  supervisor_id?: number;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  start_date?: string;
  due_date?: string;
}

// Stages
export interface CreateStageRequest {
  project_id: number;
  name: string;
  description?: string;
  is_parallel?: boolean;
}

export interface UpdateStageRequest {
  name?: string;
  description?: string;
  is_parallel?: boolean;
  order?: number;
}

// Tasks
export interface CreateTaskRequest {
  stage_id: number;
  title: string;
  description?: string;
  estimated_hours: number;
  daily_hours: number;
  priority?: TaskPriority;
  due_date?: string;
  assigned_user_ids?: number[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  estimated_hours?: number;
  daily_hours?: number;
  priority?: TaskPriority;
  due_date?: string;
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
  reason?: string; // Obrigatório ao mover para "refaca"
}

// Task Assignments
export interface AssignUsersRequest {
  user_ids: number[];
}

export interface AssignmentValidationResult {
  user_id: number;
  user_name: string;
  success: boolean;
  reason?: string;
  current_hours?: number;
  available_hours?: number;
}

// Time Entries
export interface CreateTimeEntryRequest {
  task_id: number;
  hours: number;
  date: string;
  notes?: string;
}

// =====================================================
// RESPOSTAS DA API
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: ValidationError[];
}

// =====================================================
// DASHBOARD & MONITORING
// =====================================================

export interface DashboardStats {
  open_projects: number;
  at_risk_projects: number;
  active_users: number;
  refaca_tasks: number;
  status_distribution: StatusDistribution[];
  recent_tasks: TaskWithDetails[];
}

export interface StatusDistribution {
  status: TaskStatus;
  count: number;
  percentage: number;
}

export interface ProjectRiskInfo {
  project_id: number;
  project_name: string;
  defined_due_date: string;
  estimated_completion_date: string;
  risk_status: ProjectRiskStatus;
  sequential_days: number;
  parallel_days: number;
  total_estimated_days: number;
  days_until_due: number;
}

export interface UserPerformance {
  user: User;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  refaca_tasks: number;
  total_estimated_hours: number;
  total_logged_hours: number;
  efficiency_percentage: number; // (estimated / logged) * 100
  refaca_rate_percentage: number; // (refaca / total) * 100
  completion_rate_percentage: number; // (completed / total) * 100
  variance_hours: number; // logged - estimated
}

export interface TeamPerformance {
  team_name: string;
  total_members: number;
  total_projects: number;
  completed_projects: number;
  projects_on_time: number;
  average_efficiency: number;
  total_refaca_rate: number;
}

export interface SupervisorPerformance {
  supervisor: User;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  projects_at_risk: number;
  success_rate_percentage: number;
  refaca_rate_percentage: number;
  average_project_duration_days: number;
}

// =====================================================
// KANBAN
// =====================================================

export interface KanbanColumn {
  status: TaskStatus;
  label: string;
  tasks: TaskWithDetails[];
  count: number;
  color: string;
}

export interface KanbanBoard {
  columns: KanbanColumn[];
  total_tasks: number;
}

// =====================================================
// VALIDAÇÕES E REGRAS DE NEGÓCIO
// =====================================================

export interface DailyHoursValidation {
  is_valid: boolean;
  current_hours: number;
  requested_hours: number;
  total_hours: number;
  available_hours: number;
  max_hours: number;
  task_breakdown: TaskHoursBreakdown[];
}

export interface TaskHoursBreakdown {
  task_id: number;
  task_title: string;
  daily_hours: number;
}

export interface StatusTransitionValidation {
  is_valid: boolean;
  from_status: TaskStatus;
  to_status: TaskStatus;
  user_role: UserRole;
  reason?: string;
}

// =====================================================
// FILTROS E ORDENAÇÃO
// =====================================================

export interface ProjectFilters {
  status?: ProjectStatus;
  supervisor_id?: number;
  search?: string;
  risk_status?: ProjectRiskStatus;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_user_id?: number;
  project_id?: number;
  stage_id?: number;
  search?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

// =====================================================
// CONSTANTES E HELPERS
// =====================================================

export const STATUS_LABELS: Record<TaskStatus, string> = {
  novo: 'Novo',
  em_desenvolvimento: 'Em Desenvolvimento',
  analise_tecnica: 'Análise Técnica',
  concluido: 'Concluído',
  refaca: 'Refaça',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  novo: 'blue',
  em_desenvolvimento: 'yellow',
  analise_tecnica: 'purple',
  concluido: 'green',
  refaca: 'red',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'gray',
  medium: 'blue',
  high: 'red',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Usuário',
  supervisor: 'Supervisor',
  admin: 'Administrador',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: 'Ativo',
  completed: 'Concluído',
  on_hold: 'Em Espera',
  cancelled: 'Cancelado',
};

export const RISK_STATUS_LABELS: Record<ProjectRiskStatus, string> = {
  ON_TRACK: 'No Prazo',
  WARNING: 'Atenção',
  AT_RISK: 'Em Risco',
  DELAYED: 'Atrasado',
  NO_DEADLINE: 'Sem Prazo',
};

export const RISK_STATUS_COLORS: Record<ProjectRiskStatus, string> = {
  ON_TRACK: 'green',
  WARNING: 'yellow',
  AT_RISK: 'orange',
  DELAYED: 'red',
  NO_DEADLINE: 'gray',
};

// =====================================================
// MATRIZ DE TRANSIÇÃO DE STATUS
// =====================================================

export const STATUS_TRANSITIONS: Record<
  TaskStatus,
  Partial<Record<TaskStatus, UserRole[]>>
> = {
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
  concluido: {
    // Status final - sem transições
  },
  refaca: {
    em_desenvolvimento: ['user', 'supervisor', 'admin'],
  },
};

// =====================================================
// TYPE GUARDS
// =====================================================

export function isUser(role: UserRole): boolean {
  return role === 'user';
}

export function isSupervisor(role: UserRole): boolean {
  return role === 'supervisor';
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

export function isSupervisorOrAdmin(role: UserRole): boolean {
  return role === 'supervisor' || role === 'admin';
}

export function isRefacaTask(task: Task): boolean {
  return task.status === 'refaca';
}

export function isCompletedTask(task: Task): boolean {
  return task.status === 'concluido';
}

export function isActiveProject(project: Project): boolean {
  return project.status === 'active';
}

// =====================================================
// HELPERS DE VALIDAÇÃO
// =====================================================

export function canTransitionStatus(
  userRole: UserRole,
  fromStatus: TaskStatus,
  toStatus: TaskStatus
): boolean {
  const allowedRoles = STATUS_TRANSITIONS[fromStatus]?.[toStatus];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}

export function calculateTaskDays(estimatedHours: number, dailyHours: number): number {
  if (dailyHours <= 0) return 0;
  return Math.ceil(estimatedHours / dailyHours);
}

export function calculateProgress(logged: number, estimated: number): number {
  if (estimated <= 0) return 0;
  return Math.min(Math.round((logged / estimated) * 100), 100);
}

export function calculateEfficiency(estimated: number, logged: number): number {
  if (logged <= 0) return 0;
  return Math.round((estimated / logged) * 100);
}

export function isProjectAtRisk(riskStatus: ProjectRiskStatus): boolean {
  return riskStatus === 'AT_RISK' || riskStatus === 'DELAYED';
}

export function formatHours(hours: number): string {
  return `${hours.toFixed(1)}h`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
}
