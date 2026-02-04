import { useEffect, useState } from 'react';
import { Project } from '../lib/supabase';
import { Calendar, AlertCircle, TrendingUp } from 'lucide-react';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kanban</h1>
        <p className="text-gray-600 mt-1">Visualize e gerencie o fluxo de projetos</p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => {
            const columnProjects = getProjectsByKanbanStatus(column.kanban_status);

            return (
              <div
                key={column.id}
                onDrop={() => handleDrop(column.kanban_status)}
                onDragOver={handleDragOver}
                className={`${column.color} rounded-xl border-2 p-4 w-80 flex-shrink-0`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">{column.title}</h2>
                  <span className="bg-white text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {columnProjects.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
                  {columnProjects.map((project) => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={() => handleDragStart(project.id)}
                    className={`bg-white rounded-lg border-2 p-4 cursor-move hover:shadow-md transition ${
                      project.kanban_status === 'refaca' ? 'border-red-400' : 'border-gray-200'
                    } ${draggedProject === project.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm flex-1">
                        📊 {project.name}
                      </h3>
                      {project.kanban_status === 'refaca' && (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Progresso</span>
                        <span className="text-xs font-semibold text-gray-900">
                          {project.progress_percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Tasks Info */}
                    <div className="text-xs text-gray-600 mb-3">
                      <p>Tarefas: {project.completed_tasks} done / {project.total_tasks}</p>
                    </div>

                    {/* Supervisor */}
                    {project.supervisor_name && (
                      <div className="text-xs text-gray-600 mb-2">
                        <p className="font-medium">Supervisor:</p>
                        <p>{project.supervisor_name}</p>
                      </div>
                    )}

                    {/* Due Date */}
                    {project.due_date && (
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(project.due_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}

                    {/* Risk Indicator */}
                    <div className="flex items-center text-xs">
                      <TrendingUp className={`w-3 h-3 mr-1 ${getRiskColor(project.progress_percentage)}`} />
                      <span className={`font-medium ${getRiskColor(project.progress_percentage)}`}>
                        {project.progress_percentage >= 75 ? '🟢 Baixo' : project.progress_percentage >= 40 ? '🟡 Médio' : '🔴 Alto'}
                      </span>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
