import { useEffect, useState } from 'react';
import { dashboardService } from '../services/dashboardService';
import { FolderOpen, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type DashboardStats = {
  openProjects: number;
  atRiskProjects: number;
  activeUsers: number;
  refacaTasks: number;
  statusDistribution: { status: string; count: number }[];
  recentTasks: Array<Task & { project_name?: string }>;
};

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    openProjects: 0,
    atRiskProjects: 0,
    activeUsers: 0,
    refacaTasks: 0,
    statusDistribution: [],
    recentTasks: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const data = await dashboardService.getStats();

      setStats({
        openProjects: data.open_projects,
        atRiskProjects: data.at_risk_projects,
        activeUsers: data.active_users,
        refacaTasks: data.refaca_tasks,
        statusDistribution: data.status_distribution.map((s: any) => ({
          status: s.status,
          count: s.count,
        })),
        recentTasks: data.recent_tasks || [],
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const statusLabels: Record<string, string> = {
    novo: 'Novo',
    em_desenvolvimento: 'Em Desenvolvimento',
    analise_tecnica: 'Análise Técnica',
    concluido: 'Concluído',
    refaca: 'Refaça',
  };

  const statusColors: Record<string, string> = {
    novo: 'bg-blue-500',
    em_desenvolvimento: 'bg-yellow-500',
    analise_tecnica: 'bg-purple-500',
    concluido: 'bg-green-500',
    refaca: 'bg-red-500',
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral dos projetos e tarefas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projetos em Aberto</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.openProjects}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projetos em Risco</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.atRiskProjects}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 ring-2 ring-red-500 ring-opacity-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tarefas em Refaça</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.refacaTasks}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <RefreshCw className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Status</h2>
          <div className="space-y-3">
            {stats.statusDistribution.map(({ status, count }) => {
              const total = stats.statusDistribution.reduce((sum, s) => sum + s.count, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {statusLabels[status] || status}
                    </span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${statusColors[status] || 'bg-gray-500'} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tarefas Recentes</h2>
          <div className="space-y-3">
            {stats.recentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma tarefa encontrada</p>
            ) : (
              stats.recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${statusColors[task.status] || 'bg-gray-500'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.project_name}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'refaca'
                        ? 'bg-red-100 text-red-700 font-semibold'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {statusLabels[task.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
