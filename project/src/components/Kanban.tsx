import { useEffect, useState } from 'react';
import { Task, Profile } from '../lib/supabase';
import { Clock, User, AlertCircle } from 'lucide-react';
import { tasksService } from '../services/tasksService';

type TaskWithDetails = Task & {
  assignees?: Profile[];
  project_name?: string;
};

type KanbanColumn = {
  id: string;
  title: string;
  status: Task['status'];
  color: string;
};

const columns: KanbanColumn[] = [
  { id: '1', title: 'Novo', status: 'novo', color: 'bg-blue-50 border-blue-200' },
  { id: '2', title: 'Em Desenvolvimento', status: 'em_desenvolvimento', color: 'bg-yellow-50 border-yellow-200' },
  { id: '3', title: 'Análise Técnica', status: 'analise_tecnica', color: 'bg-purple-50 border-purple-200' },
  { id: '4', title: 'Concluído', status: 'concluido', color: 'bg-green-50 border-green-200' },
  { id: '5', title: 'Refaça', status: 'refaca', color: 'bg-red-50 border-red-300 ring-2 ring-red-500 ring-opacity-30' },
];

export default function Kanban() {
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const response = await tasksService.getAll();
      const tasksData = response || [];

      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDragStart(taskId: string) {
    setDraggedTask(taskId);
  }

  async function handleDrop(newStatus: Task['status']) {
    if (!draggedTask) return;

    try {
      await tasksService.updateStatus(draggedTask, newStatus);

      setTasks((prev) =>
        prev.map((task) =>
          task.id === draggedTask ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setDraggedTask(null);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  const getTasksByStatus = (status: Task['status']) => {
    return tasks.filter((task) => task.status === status);
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
        <p className="text-gray-600 mt-1">Visualize e gerencie o fluxo de tarefas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status);

          return (
            <div
              key={column.id}
              onDrop={() => handleDrop(column.status)}
              onDragOver={handleDragOver}
              className={`${column.color} rounded-xl border-2 p-4 min-h-[600px]`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{column.title}</h2>
                <span className="bg-white text-gray-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={`bg-white rounded-lg border-2 p-4 cursor-move hover:shadow-md transition ${
                      task.status === 'refaca' ? 'border-red-400' : 'border-gray-200'
                    } ${draggedTask === task.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight flex-1">
                        {task.title}
                      </h3>
                      {task.status === 'refaca' && (
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 ml-2" />
                      )}
                    </div>

                    {task.project_name && (
                      <p className="text-xs text-gray-500 mb-3">{task.project_name}</p>
                    )}

                    {task.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimated_hours}h</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </div>

                    {task.assignees && task.assignees.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 3).map((assignee, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center"
                              title={assignee.full_name}
                            >
                              <User className="w-3 h-3 text-blue-600" />
                            </div>
                          ))}
                        </div>
                        {task.assignees.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{task.assignees.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
