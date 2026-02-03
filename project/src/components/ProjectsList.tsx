import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectStatus, RISK_STATUS_LABELS, RISK_STATUS_COLORS } from '../types';
import { projectsService } from '../services/projectsService';
import { PROJECT_STATUS_LABELS } from '../types';
import Layout from './Layout';

interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
}

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'kanban' | 'projects' | 'monitoring'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({});

  // ✅ Gerar ID visual composto
  const getDisplayId = (projectId: number): string => {
    return `P${projectId}`;
  };

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { status?: string; search?: string } = {};
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      const result = await projectsService.getAll(params);
      setProjects(result || []);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao carregar projetos';
      setError(errorMsg);
      console.error('Erro ao carregar projetos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: ProjectStatus | null) => {
    if (status === null) {
      setFilters({ search: filters.search });
    } else {
      setFilters({ ...filters, status });
    }
  };

  const navigateToStages = (projectId: number) => {
    navigate(`/projects/${projectId}/stages`);
  };

  const getStatusBadgeColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projetos</h1>
          <p className="text-gray-600">Gerenciar e acompanhar seus projetos</p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Box */}
          <div>
            <input
              type="text"
              placeholder="Buscar projetos por nome ou descrição..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleStatusFilter(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !filters.status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => handleStatusFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.status === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => handleStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.status === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Concluídos
            </button>
            <button
              onClick={() => handleStatusFilter('on_hold')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.status === 'on_hold'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Em Espera
            </button>
            <button
              onClick={() => handleStatusFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filters.status === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cancelados
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">❌ {error}</p>
            <button
              onClick={loadProjects}
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
            <span className="ml-3 text-gray-600">Carregando projetos...</span>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{project.name}</h3>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(
                        project.status
                      )}`}
                    >
                      {PROJECT_STATUS_LABELS[project.status]}
                    </span>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Dates */}
                  <div className="mb-4 space-y-2 text-sm text-gray-600">
                    {project.start_date && (
                      <div>
                        <span className="font-medium">Início:</span>{' '}
                        {new Date(project.start_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {project.due_date && (
                      <div>
                        <span className="font-medium">Prazo:</span>{' '}
                        {new Date(project.due_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>

                  {/* Meta Information */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      <p className="font-semibold text-blue-600">ID: {getDisplayId(project.id)}</p>
                      <p>
                        Criado em: {new Date(project.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Button */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => navigateToStages(project.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    Ver Etapas →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum projeto encontrado</h3>
            <p className="text-gray-600">
              {filters.status
                ? 'Nenhum projeto encontrado com este status'
                : 'Comece criando seu primeiro projeto'}
            </p>
            {filters.status && (
              <button
                onClick={() => handleStatusFilter(null)}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todos os projetos
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectsList;
