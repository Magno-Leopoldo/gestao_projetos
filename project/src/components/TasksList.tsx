import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskWithMetrics, PaginatedTasksResponse, PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from '../types';
import { tasksService } from '../services/tasksService';
import { projectsService } from '../services/projectsService';
import { stagesService } from '../services/stagesService';
import { useAuth } from '../contexts/AuthContext';
import CreateTaskModal from './CreateTaskModal';

type SortBy = 'order' | 'status' | 'priority' | 'estimated_hours';

interface TaskUser {
  id: number;
  name: string;
}

const TasksList: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, stageId } = useParams<{ projectId: string; stageId: string }>();
  const { profile, user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithMetrics[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [stageName, setStageName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('order');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [availableUsers, setAvailableUsers] = useState<TaskUser[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [tasksPerPage] = useState(20);

  useEffect(() => {
    if (projectId && stageId) {
      loadData(parseInt(projectId), parseInt(stageId));
    }
  }, [projectId, stageId, currentPage]);

  const loadData = async (pId: number, sId: number) => {
    setLoading(true);
    setError(null);
    try {
      // Load project name
      const projectResult = await projectsService.getById(pId);
      setProjectName(projectResult.name);

      // Load stage name
      const stageResult = await stagesService.getById(sId);
      setStageName(stageResult.name);

      // Load tasks with pagination and metrics
      const result: PaginatedTasksResponse = await tasksService.getByStage(sId, {
        page: currentPage,
        limit: tasksPerPage,
        includeMetrics: true
      });

      let filteredTasks = result.data || [];

      // ✅ FILTRO: Se é user, mostrar apenas tarefas onde está atribuído
      if (profile?.role === 'user' && user?.id) {
        filteredTasks = filteredTasks.filter((task: any) => {
          // Agora assignees_array é um array de objetos
          if (!task.assignees_array || !Array.isArray(task.assignees_array)) return false;
          return task.assignees_array.some((assignee: any) => assignee.id === user.id);
        });
      }
      // Se é supervisor ou admin: mostra todas as tarefas

      setTasks(filteredTasks);

      // Atualizar estados de paginação
      setTotalPages(result.pagination.total_pages);
      setTotalTasks(result.pagination.total);

      // ✅ Extrair usuários únicos para o filtro
      const usersMap = new Map<number, TaskUser>();
      filteredTasks.forEach((task: any) => {
        // Agora assignees_array é um array de objetos
        if (task.assignees_array && Array.isArray(task.assignees_array)) {
          task.assignees_array.forEach((assignee: any) => {
            if (!usersMap.has(assignee.id)) {
              usersMap.set(assignee.id, {
                id: assignee.id,
                name: assignee.full_name
              });
            }
          });
        }
      });

      const usersList = Array.from(usersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
      setAvailableUsers(usersList);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao carregar dados';
      setError(errorMsg);
      console.error('Erro ao carregar tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToTaskDetail = (taskId: number) => {
    if (projectId && stageId) {
      navigate(`/projects/${projectId}/stages/${stageId}/tasks/${taskId}`);
    }
  };

  const navigateBack = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/stages`);
    }
  };

  const handleCreateTaskSuccess = () => {
    if (projectId && stageId) {
      loadData(parseInt(projectId), parseInt(stageId));
    }
  };

  const canCreateTask = profile?.role === 'supervisor' || profile?.role === 'admin';

  // ✅ Gerar ID visual composto para tarefas
  const getDisplayId = (pId: string | number, sId: string | number, taskId: number): string => {
    return `P${pId}.E${sId}.T${taskId}`;
  };

  // ✅ NOVO: Filtrar por busca de texto, usuário, status e prioridade, depois ordenar
  const getFilteredAndSortedTasks = () => {
    // 1. Filtrar por texto de busca (título e descrição)
    let filtered = tasks.filter((task) => {
      const searchLower = searchText.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descriptionMatch = task.description?.toLowerCase().includes(searchLower) || false;
      return titleMatch || descriptionMatch;
    });

    // 2. Filtrar por usuário selecionado
    if (selectedUser) {
      filtered = filtered.filter((task) => {
        if (!task.assignees_array || task.assignees_array.length === 0) return false;
        return task.assignees_array.some((assignee) => assignee.id === selectedUser);
      });
    }

    // 3. Filtrar por status selecionado
    if (selectedStatus) {
      filtered = filtered.filter((task) => task.status === selectedStatus);
    }

    // 4. Filtrar por prioridade selecionada
    if (selectedPriority) {
      filtered = filtered.filter((task) => task.priority === selectedPriority);
    }

    // 5. Ordenar
    const sorted = [...filtered];
    switch (sortBy) {
      case 'order':
        return sorted.sort((a, b) => a.order - b.order);
      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return sorted.sort(
          (a, b) =>
            priorityOrder[a.priority as keyof typeof priorityOrder] -
            priorityOrder[b.priority as keyof typeof priorityOrder]
        );
      case 'estimated_hours':
        return sorted.sort((a, b) => b.estimated_hours - a.estimated_hours);
      default:
        return sorted;
    }
  };

  const getRiskIndicator = (task: Task) => {
    if (task.due_date) {
      const daysUntilDue = Math.ceil(
        (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilDue < 0) return { text: 'Atrasado', color: '🔴' };
      if (daysUntilDue <= 3) return { text: 'Crítico', color: '🟠' };
      if (daysUntilDue <= 7) return { text: 'Atenção', color: '🟡' };
      return { text: 'OK', color: '🟢' };
    }
    return null;
  };

  const getStatusColor = (status: TaskStatus) => {
    return STATUS_COLORS[status] || 'gray';
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'gray';
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
            ← Voltar para Etapas
          </button>
          <div className="text-sm text-gray-600">
            <span>Projetos</span>
            <span className="mx-2">/</span>
            <span className="cursor-pointer hover:text-gray-900">{projectName}</span>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-900">{stageName}</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tarefas</h1>
            <p className="text-gray-600">Etapa: {stageName}</p>
          </div>

          {canCreateTask && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Tarefa</span>
            </button>
          )}
        </div>

        {/* 🔍 Search and Filter Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="🔍 Buscar por título ou descrição..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* User Filter */}
            {availableUsers.length > 0 && (
              <div className="min-w-xs">
                <select
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="">👥 Todos os usuários</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="min-w-xs">
              <select
                value={selectedStatus || ''}
                onChange={(e) => setSelectedStatus(e.target.value ? (e.target.value as TaskStatus) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">📋 Todos os status</option>
                <option value="novo">{STATUS_LABELS.novo}</option>
                <option value="em_desenvolvimento">{STATUS_LABELS.em_desenvolvimento}</option>
                <option value="analise_tecnica">{STATUS_LABELS.analise_tecnica}</option>
                <option value="concluido">{STATUS_LABELS.concluido}</option>
                <option value="refaca">{STATUS_LABELS.refaca}</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="min-w-xs">
              <select
                value={selectedPriority || ''}
                onChange={(e) => setSelectedPriority(e.target.value ? (e.target.value as TaskPriority) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="">⚡ Todas as prioridades</option>
                <option value="high">{PRIORITY_LABELS.high}</option>
                <option value="medium">{PRIORITY_LABELS.medium}</option>
                <option value="low">{PRIORITY_LABELS.low}</option>
              </select>
            </div>
          </div>

          {/* Sorting Controls */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 self-center">Ordenar por:</span>
            {(['order', 'status', 'priority', 'estimated_hours'] as SortBy[]).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  sortBy === sort
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {sort === 'order' && 'Ordem'}
                {sort === 'status' && 'Status'}
                {sort === 'priority' && 'Prioridade'}
                {sort === 'estimated_hours' && 'Horas'}
              </button>
            ))}
          </div>

          {/* Active Filters Summary */}
          {(searchText || selectedUser || selectedStatus || selectedPriority) && (
            <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-200">
              📋 Filtros ativos:
              {searchText && <span className="ml-2 font-medium">Busca: &quot;{searchText}&quot;</span>}
              {(searchText || selectedUser || selectedStatus || selectedPriority) && (
                <>
                  {(searchText && selectedUser) || (searchText && selectedStatus) || (searchText && selectedPriority) ? (
                    <span className="mx-1">•</span>
                  ) : null}
                </>
              )}
              {selectedUser && (
                <span className="font-medium">
                  Usuário: {availableUsers.find((u) => u.id === selectedUser)?.name}
                </span>
              )}
              {selectedUser && (selectedStatus || selectedPriority) && <span className="mx-1">•</span>}
              {selectedStatus && (
                <span className="font-medium">
                  Status: {STATUS_LABELS[selectedStatus]}
                </span>
              )}
              {selectedStatus && selectedPriority && <span className="mx-1">•</span>}
              {selectedPriority && (
                <span className="font-medium">
                  Prioridade: {PRIORITY_LABELS[selectedPriority]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">❌ {error}</p>
            <button
              onClick={() => projectId && stageId && loadData(parseInt(projectId), parseInt(stageId))}
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
            <span className="ml-3 text-gray-600">Carregando tarefas...</span>
          </div>
        )}

        {/* Tasks List */}
        {!loading && tasks.length > 0 && (
          <div className="space-y-4">
            {getFilteredAndSortedTasks().map((task) => {
              const riskIndicator = getRiskIndicator(task);
              return (
                <div
                  key={task.id}
                  onClick={() => navigateToTaskDetail(task.id)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl font-bold text-gray-400">{task.order}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                              {getDisplayId(projectId, stageId, task.id)}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Task Info */}
                      <div className="flex flex-wrap gap-2 items-center mt-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium text-white`}
                          style={{
                            backgroundColor:
                              getStatusColor(task.status) === 'blue'
                                ? '#3b82f6'
                                : getStatusColor(task.status) === 'yellow'
                                ? '#eab308'
                                : getStatusColor(task.status) === 'purple'
                                ? '#a855f7'
                                : getStatusColor(task.status) === 'green'
                                ? '#22c55e'
                                : '#ef4444',
                          }}
                        >
                          {STATUS_LABELS[task.status]}
                        </span>

                        <span
                          className={`px-2 py-1 rounded text-xs font-medium text-white`}
                          style={{
                            backgroundColor:
                              getPriorityColor(task.priority) === 'gray'
                                ? '#6b7280'
                                : getPriorityColor(task.priority) === 'blue'
                                ? '#3b82f6'
                                : '#ef4444',
                          }}
                        >
                          {PRIORITY_LABELS[task.priority as keyof typeof PRIORITY_LABELS]}
                        </span>

                        {riskIndicator && (
                          <span className="text-sm font-medium text-gray-700">
                            {riskIndicator.color} {riskIndicator.text}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Content */}
                    <div className="text-right whitespace-nowrap">
                      <div className="mb-3">
                        <p className="text-xs text-gray-600">Horas Estimadas</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {task.estimated_hours}h
                        </p>
                      </div>
                      {task.daily_hours && (
                        <div>
                          <p className="text-xs text-gray-600">Horas/Dia</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {task.daily_hours}h
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignees Section */}
                  {task.assignees_array && task.assignees_array.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Atribuído a:</p>
                      <div className="flex flex-wrap gap-2">
                        {task.assignees_array.map((assignee) => {
                          const collaboratorMetric = task.collaborator_metrics?.find(
                            (cm) => cm.user_id === assignee.id
                          );

                          return (
                            <div
                              key={assignee.id}
                              className="px-3 py-2 bg-gray-100 rounded-lg border border-gray-300"
                            >
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-sm font-medium text-gray-900">
                                  {assignee.full_name}
                                </span>
                                <span className="text-xs text-gray-600">
                                  ({assignee.daily_hours}h/dia)
                                </span>
                              </div>

                              {collaboratorMetric && parseFloat(collaboratorMetric.horas_registradas) > 0 && (
                                <div className="text-xs text-blue-600 font-semibold">
                                  {parseFloat(collaboratorMetric.horas_registradas).toFixed(1)}h registradas
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Total metrics summary */}
                      {task.metrics && parseFloat(task.metrics.total_horas_reais) > 0 && (
                        <div className="mt-2 flex gap-3 text-xs items-center">
                          <span className="text-gray-600">
                            Total: <span className="font-semibold text-gray-900">{parseFloat(task.metrics.total_horas_reais).toFixed(1)}h</span>
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-600">
                            Conclusão: <span className="font-semibold text-blue-600">{parseFloat(task.metrics.taxa_media_percent).toFixed(0)}%</span>
                          </span>
                          {task.metrics.status_risco !== 'NO_PRAZO' && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span className={`font-semibold ${
                                task.metrics.status_risco === 'CRITICO' ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {task.metrics.status_risco === 'CRITICO' ? '🔴 Crítico' : '⚠️ Risco'}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Due Date */}
                  {task.due_date && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Data limite: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-end">
                    <span className="text-blue-600 font-medium text-sm hover:text-blue-800">
                      Ver Detalhes →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && tasks.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>

            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages} ({totalTasks} tarefas)
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima →
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && getFilteredAndSortedTasks().length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">{searchText || selectedUser || selectedStatus || selectedPriority ? '🔍' : '✓'}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchText || selectedUser || selectedStatus || selectedPriority ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa nesta etapa'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchText || selectedUser || selectedStatus || selectedPriority
                ? 'Tente ajustar seus filtros ou critérios de busca'
                : 'Esta etapa não possui tarefas definidas'}
            </p>

            {canCreateTask ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Criar Primeira Tarefa</span>
              </button>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Apenas supervisores e administradores podem criar tarefas.
                </p>
                <button
                  onClick={navigateBack}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Voltar para Etapas
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal para criar tarefa */}
      {stageId && (
        <CreateTaskModal
          stageId={parseInt(stageId)}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateTaskSuccess}
        />
      )}
    </div>
  );
};

export default TasksList;
