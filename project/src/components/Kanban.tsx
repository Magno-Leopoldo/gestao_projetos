import { useEffect, useState } from 'react';
import { Project } from '../lib/supabase';
import { Calendar, AlertCircle, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';
import { projectsService } from '../services/projectsService';
import { tasksService } from '../services/tasksService';

type ProjectWithProgress = Project & {
  supervisor_name?: string;
  total_tasks?: number;
  completed_tasks?: number;
  refaca_tasks?: number;
  progress_percentage?: number;
  kanban_status?: 'novo' | 'em_desenvolvimento' | 'analise_tecnica' | 'concluido' | 'refaca';
};

type KanbanColumn = {
  id: string;
  title: string;
  kanban_status: string;
  color: string;
};

const columns: KanbanColumn[] = [
  { id: '1', title: 'Novo', kanban_status: 'novo', color: 'bg-blue-50 border-blue-200' },
  { id: '2', title: 'Em Desenvolvimento', kanban_status: 'em_desenvolvimento', color: 'bg-yellow-50 border-yellow-200' },
  { id: '3', title: 'Análise Técnica', kanban_status: 'analise_tecnica', color: 'bg-purple-50 border-purple-200' },
  { id: '4', title: 'Concluído', kanban_status: 'concluido', color: 'bg-green-50 border-green-200' },
  { id: '5', title: 'Refaça', kanban_status: 'refaca', color: 'bg-red-50 border-red-300 ring-2 ring-red-500 ring-opacity-30' },
];

export default function Kanban() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'full' | 'compact'>('full');

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const response = await projectsService.getAll({ include: 'supervisor,stages' });
      const projectsData = Array.isArray(response) ? response : [];

      // Enriquecer projetos com dados de progresso
      const enrichedProjects = await Promise.all(
        projectsData.map(async (project: any) => {
          try {
            let total_tasks = 0;
            let completed_tasks = 0;
            let refaca_tasks = 0;
            let hasNewTasks = false;
            let hasDevTasks = false;
            let hasAnalysisTasks = false;

            // Se o projeto tem estágios, carregar tarefas
            if (project.stages && Array.isArray(project.stages)) {
              for (const stage of project.stages) {
                const tasksResult = await tasksService.getByStage(stage.id);
                const stageTasks = Array.isArray(tasksResult?.data) ? tasksResult.data : [];

                total_tasks += stageTasks.length;
                completed_tasks += stageTasks.filter(t => t.status === 'concluido').length;
                refaca_tasks += stageTasks.filter(t => t.status === 'refaca').length;

                hasNewTasks = hasNewTasks || stageTasks.some(t => t.status === 'novo');
                hasDevTasks = hasDevTasks || stageTasks.some(t => t.status === 'em_desenvolvimento');
                hasAnalysisTasks = hasAnalysisTasks || stageTasks.some(t => t.status === 'analise_tecnica');
              }
            }

            // Determinar status no kanban baseado nas tarefas
            let kanban_status = 'novo';
            if (refaca_tasks > 0) {
              kanban_status = 'refaca';
            } else if (total_tasks === completed_tasks && total_tasks > 0) {
              kanban_status = 'concluido';
            } else if (hasAnalysisTasks) {
              kanban_status = 'analise_tecnica';
            } else if (hasDevTasks) {
              kanban_status = 'em_desenvolvimento';
            }

            const progress_percentage = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

            return {
              ...project,
              supervisor_name: project.supervisor?.full_name,
              total_tasks,
              completed_tasks,
              refaca_tasks,
              progress_percentage,
              kanban_status,
            };
          } catch (error) {
            console.error(`Erro ao carregar dados do projeto ${project.id}:`, error);
            return {
              ...project,
              total_tasks: 0,
              completed_tasks: 0,
              refaca_tasks: 0,
              progress_percentage: 0,
              kanban_status: 'novo',
            };
          }
        })
      );

      setProjects(enrichedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDragStart(projectId: string) {
    setDraggedProject(projectId);
  }

  async function handleDrop(newStatus: string) {
    if (!draggedProject) return;

    try {
      // Atualizar status do projeto
      await projectsService.update(parseInt(draggedProject), {
        status: newStatus === 'concluido' ? 'completed' : newStatus === 'on_hold' ? 'on_hold' : 'active',
      });

      setProjects((prev) =>
        prev.map((project) =>
          project.id === draggedProject ? { ...project, kanban_status: newStatus as any } : project
        )
      );
    } catch (error) {
      console.error('Error updating project status:', error);
    } finally {
      setDraggedProject(null);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  const getProjectsByKanbanStatus = (status: string) => {
    return projects.filter((project) => project.kanban_status === status);
  };

  const getRiskColor = (progress: number) => {
    if (progress === 100) return 'text-green-600';
    if (progress >= 60) return 'text-green-600';
    if (progress >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 sm:px-6 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                📊 <span className="hidden sm:inline">Kanban de</span> Projetos
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
                <span className="hidden sm:inline">Visualize e gerencie o fluxo completo de seus</span>
                <span className="sm:hidden">Fluxo de</span> projetos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium text-xs sm:text-sm">
                {projects.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="px-3 py-4 sm:px-6 md:px-8 md:py-8">
          {/* Desktop View */}
          <div className="hidden lg:block">
            <div className="flex gap-4 xl:gap-6 min-w-max">
              {columns.map((column) => {
                const columnProjects = getProjectsByKanbanStatus(column.kanban_status);

                return (
                  <div
                    key={column.id}
                    onDrop={() => handleDrop(column.kanban_status)}
                    onDragOver={handleDragOver}
                    className={`${column.color} rounded-2xl border border-opacity-50 backdrop-blur-sm p-5 w-80 xl:w-96 flex-shrink-0 flex flex-col bg-opacity-60 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 border-opacity-50">
                      <div>
                        <h2 className="font-bold text-gray-900 text-base xl:text-lg">{column.title}</h2>
                        <p className="text-xs text-gray-600 mt-0.5">{columnProjects.length} proj{columnProjects.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm font-semibold text-gray-700 text-sm">
                        {columnProjects.length}
                      </div>
                    </div>

                    {/* Projects Container */}
                    <div className="flex-1 space-y-3 xl:space-y-4 overflow-y-auto pr-3" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                  {columnProjects.map((project) => (
                    <div
                      key={project.id}
                      draggable
                      onDragStart={() => handleDragStart(project.id)}
                      className={`bg-white rounded-xl shadow-sm hover:shadow-lg border-2 transition-all transform hover:scale-105 hover:-translate-y-1 cursor-grab active:cursor-grabbing p-4 ${
                        project.kanban_status === 'refaca'
                          ? 'border-red-300 hover:border-red-400'
                          : 'border-gray-200 hover:border-blue-300'
                      } ${draggedProject === project.id ? 'opacity-50 ring-2 ring-blue-400' : ''}`}
                    >
                      {/* Project Title & Status Badge */}
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <h3 className="font-bold text-gray-900 text-sm flex-1 leading-snug pr-2">
                          {project.name}
                        </h3>
                        {project.kanban_status === 'refaca' && (
                          <div className="flex-shrink-0 bg-red-100 rounded-full p-1.5">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          </div>
                        )}
                        {project.kanban_status === 'concluido' && (
                          <div className="flex-shrink-0 bg-green-100 rounded-full p-1.5">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                      </div>

                      {/* Progress Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-700">Progresso</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            project.progress_percentage === 100 ? 'bg-green-100 text-green-700' :
                            project.progress_percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                            project.progress_percentage >= 30 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {project.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              project.progress_percentage === 100 ? 'bg-green-500' :
                              project.progress_percentage >= 60 ? 'bg-blue-500' :
                              project.progress_percentage >= 30 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${project.progress_percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Tasks Stats */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-600">Tarefas</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            {project.completed_tasks}/{project.total_tasks}
                          </span>
                        </div>
                      </div>

                      {/* Supervisor Info */}
                      {project.supervisor_name && (
                        <div className="flex items-center gap-2 mb-3 text-xs">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600 truncate">{project.supervisor_name}</span>
                        </div>
                      )}

                      {/* Footer: Due Date & Risk */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        {project.due_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(project.due_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs font-semibold">
                          {project.progress_percentage >= 75 ? (
                            <><span className="text-green-600">🟢</span><span className="text-green-600">Baixo</span></>
                          ) : project.progress_percentage >= 40 ? (
                            <><span className="text-yellow-600">🟡</span><span className="text-yellow-600">Médio</span></>
                          ) : (
                            <><span className="text-red-600">🔴</span><span className="text-red-600">Alto</span></>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                    {/* Empty State */}
                    {columnProjects.length === 0 && (
                      <div className="flex items-center justify-center py-12 text-center">
                        <div className="text-gray-400">
                          <div className="text-3xl mb-2">📭</div>
                          <p className="text-sm font-medium">Nenhum projeto</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile/Tablet View - Grid 2 colunas */}
          <div className="lg:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {columns.map((column) => {
                const columnProjects = getProjectsByKanbanStatus(column.kanban_status);

                return (
                  <div
                    key={column.id}
                    onDrop={() => handleDrop(column.kanban_status)}
                    onDragOver={handleDragOver}
                    className={`${column.color} rounded-2xl border border-opacity-50 backdrop-blur-sm p-4 sm:p-5 flex flex-col bg-opacity-60 shadow-sm`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 border-opacity-50">
                      <div>
                        <h2 className="font-bold text-gray-900 text-base">{column.title}</h2>
                        <p className="text-xs text-gray-600 mt-0.5">{columnProjects.length} proj{columnProjects.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm font-semibold text-gray-700 text-sm">
                        {columnProjects.length}
                      </div>
                    </div>

                    {/* Projects Container */}
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '50vh' }}>
                      {columnProjects.map((project) => (
                        <div
                          key={project.id}
                          draggable
                          onDragStart={() => handleDragStart(project.id)}
                          className={`bg-white rounded-xl shadow-sm hover:shadow-lg border-2 transition-all p-3 ${
                            project.kanban_status === 'refaca'
                              ? 'border-red-300 hover:border-red-400'
                              : 'border-gray-200 hover:border-blue-300'
                          } ${draggedProject === project.id ? 'opacity-50 ring-2 ring-blue-400' : ''}`}
                        >
                          {/* Project Title & Status Badge */}
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <h3 className="font-bold text-gray-900 text-sm flex-1 leading-snug pr-1">
                              {project.name}
                            </h3>
                            {project.kanban_status === 'refaca' && (
                              <div className="flex-shrink-0 bg-red-100 rounded-full p-1">
                                <AlertCircle className="w-3 h-3 text-red-600" />
                              </div>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-gray-700">Progresso</span>
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                project.progress_percentage === 100 ? 'bg-green-100 text-green-700' :
                                project.progress_percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                                project.progress_percentage >= 30 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {project.progress_percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-300 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  project.progress_percentage === 100 ? 'bg-green-500' :
                                  project.progress_percentage >= 60 ? 'bg-blue-500' :
                                  project.progress_percentage >= 30 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${project.progress_percentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Tasks */}
                          <div className="bg-gray-50 rounded-lg p-2 mb-2 border border-gray-200 text-center">
                            <span className="text-sm font-bold text-gray-900">
                              {project.completed_tasks}/{project.total_tasks} tarefas
                            </span>
                          </div>

                          {/* Risk */}
                          <div className="text-center text-xs font-semibold">
                            {project.progress_percentage >= 75 ? (
                              <span className="text-green-600">🟢 Baixo</span>
                            ) : project.progress_percentage >= 40 ? (
                              <span className="text-yellow-600">🟡 Médio</span>
                            ) : (
                              <span className="text-red-600">🔴 Alto</span>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Empty State */}
                      {columnProjects.length === 0 && (
                        <div className="flex items-center justify-center py-8 text-center">
                          <div className="text-gray-400">
                            <div className="text-2xl mb-2">📭</div>
                            <p className="text-xs font-medium">Vazio</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
