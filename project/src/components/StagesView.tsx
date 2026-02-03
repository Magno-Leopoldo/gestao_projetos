import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { projectsService } from '../services/projectsService';
import { stagesService } from '../services/stagesService';
import { tasksService } from '../services/tasksService';
import { useAuth } from '../contexts/AuthContext';
import { Project, ProjectStage } from '../types';
import CreateStageModal from './CreateStageModal';

type SortBy = 'order' | 'name' | 'estimated_hours';

interface StageFilters {
  search?: string;
  type?: 'all' | 'parallel' | 'sequential';
}

const StagesView: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { user, profile } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [allStages, setAllStages] = useState<ProjectStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<StageFilters>({ type: 'all' });
  const [sortBy, setSortBy] = useState<SortBy>('order');

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, sortBy, allStages]);

  const applyFiltersAndSort = () => {
    let filtered = [...allStages];

    // Filtrar por busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (stage) =>
          stage.name.toLowerCase().includes(searchLower) ||
          (stage.description && stage.description.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por tipo
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((stage) => {
        const isParallel = stage.is_parallel === true || stage.is_parallel === 1;
        return filters.type === 'parallel' ? isParallel : !isParallel;
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'estimated_hours':
          return (a.estimated_hours || 0) - (b.estimated_hours || 0);
        case 'order':
        default:
          return (a.order || 0) - (b.order || 0);
      }
    });

    setStages(filtered);
  };

  const loadData = async () => {
    if (!projectId) {
      setError('ID do projeto não encontrado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const projectData = await projectsService.getById(parseInt(projectId));
      setProject(projectData);

      if (projectData.stages) {
        let stagesWithTasks = projectData.stages;

        // ✅ Se é user, carregar tarefas de cada etapa para poder filtrar corretamente
        if (profile?.role === 'user' && user?.id) {
          stagesWithTasks = await Promise.all(
            projectData.stages.map(async (stage: any) => {
              try {
                // Carregar tarefas dessa etapa (que incluem assignees)
                const tasksResult = await tasksService.getByStage(stage.id);
                const tasks = Array.isArray(tasksResult) ? tasksResult : [];

                return {
                  ...stage,
                  tasks: tasks
                };
              } catch (err) {
                console.warn(`Erro ao carregar tarefas da etapa ${stage.id}:`, err);
                return {
                  ...stage,
                  tasks: []
                };
              }
            })
          );

          // Filtrar apenas etapas que têm tarefas onde o usuário está atribuído
          stagesWithTasks = stagesWithTasks.filter((stage: any) => {
            const tasks = Array.isArray(stage.tasks) ? stage.tasks : [];
            return tasks.some((task: any) => {
              // ✅ CORRIGIDO: assignee_ids é uma string "7,8" ou null
              if (!task.assignee_ids) return false;

              const assigneeIds = task.assignee_ids
                .toString()
                .split(',')
                .map((id: string) => parseInt(id.trim()));

              return assigneeIds.includes(user.id);
            });
          });
        }

        setAllStages(stagesWithTasks);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao carregar dados';
      setError(errorMsg);
      console.error('Erro ao carregar projeto:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToTasks = (stageId: number) => {
    navigate(`/projects/${projectId}/stages/${stageId}/tasks`);
  };

  const handleGoBack = () => {
    navigate('/projects');
  };

  const handleCreateStageSuccess = () => {
    // Recarregar dados após criar etapa
    loadData();
  };

  const canCreateStage = profile?.role === 'supervisor' || profile?.role === 'admin';

  // ✅ Gerar ID visual composto para etapas
  const getDisplayId = (pId: number | string, stageId: number): string => {
    return `P${pId}.E${stageId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Projetos</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{project?.name || 'Carregando...'}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project?.name}</h1>
              {project?.description && (
                <p className="text-gray-600">{project.description}</p>
              )}
            </div>

            {canCreateStage && stages.length > 0 && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap ml-4"
              >
                <Plus className="w-5 h-5" />
                <span>Nova Etapa</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Box */}
          <div>
            <input
              type="text"
              placeholder="Buscar etapas por nome ou descrição..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex gap-4 flex-wrap">
            {/* Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, type: 'all' })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filters.type === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilters({ ...filters, type: 'parallel' })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filters.type === 'parallel'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Paralelas
              </button>
              <button
                onClick={() => setFilters({ ...filters, type: 'sequential' })}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filters.type === 'sequential'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Sequenciais
              </button>
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="order">Ordenar por: Ordem</option>
              <option value="name">Ordenar por: Nome</option>
              <option value="estimated_hours">Ordenar por: Horas estimadas</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">❌ {error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!error && stages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{stage.name}</h3>

                  {stage.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {stage.description}
                    </p>
                  )}

                  <div className="space-y-1 text-sm text-gray-500 mb-4">
                    <p className="font-semibold text-blue-600">ID: {getDisplayId(projectId, stage.id)}</p>
                    {stage.estimated_hours && (
                      <p>Horas estimadas: {stage.estimated_hours}h</p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => handleNavigateToTasks(stage.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-2"
                  >
                    <span>Ver Tarefas</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && stages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma etapa encontrada</h3>
            <p className="text-gray-600 mb-6">Este projeto ainda não tem etapas criadas</p>

            {canCreateStage ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Criar Primeira Etapa</span>
              </button>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Apenas supervisores e administradores podem criar etapas.
                </p>
                <button
                  onClick={handleGoBack}
                  className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Voltar para projetos
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal para criar etapa */}
      {projectId && (
        <CreateStageModal
          projectId={parseInt(projectId)}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateStageSuccess}
        />
      )}
    </div>
  );
};

export default StagesView;
