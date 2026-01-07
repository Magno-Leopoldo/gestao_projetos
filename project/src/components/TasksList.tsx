import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Task, TaskStatus, PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from '../types';
import { tasksService } from '../services/tasksService';
import { projectsService } from '../services/projectsService';
import { stagesService } from '../services/stagesService';
import { useAuth } from '../contexts/AuthContext';
import CreateTaskModal from './CreateTaskModal';

type SortBy = 'order' | 'status' | 'priority' | 'estimated_hours';

const TasksList: React.FC = () => {
  const navigate = useNavigate();
  const { projectId, stageId } = useParams<{ projectId: string; stageId: string }>();
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [stageName, setStageName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('order');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (projectId && stageId) {
      loadData(parseInt(projectId), parseInt(stageId));
    }
  }, [projectId, stageId]);

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

      // Load tasks
      const tasksResult = await tasksService.getByStage(sId);
      setTasks(tasksResult || []);
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
    // Recarregar dados após criar tarefa
    console.log('📋 handleCreateTaskSuccess chamado - recarregando tarefas');
    if (projectId && stageId) {
      console.log(`🔄 Carregando tarefas para stage: ${stageId}`);
      loadData(parseInt(projectId), parseInt(stageId));
    } else {
      console.warn('⚠️ projectId ou stageId ausente!', { projectId, stageId });
    }
  };

  const canCreateTask = profile?.role === 'supervisor' || profile?.role === 'admin';

  const getSortedTasks = () => {
    const sorted = [...tasks];
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

        {/* Sorting Controls */}
        <div className="mb-6 flex gap-2 flex-wrap">
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
            {getSortedTasks().map((task) => {
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
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
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

                  {/* Due Date */}
                  {task.due_date && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        Data limite: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">ID: {task.id}</span>
                    <span className="text-blue-600 font-medium text-sm hover:text-blue-800">
                      Ver Detalhes →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && tasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-600 mb-6">Esta etapa não possui tarefas definidas</p>

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
