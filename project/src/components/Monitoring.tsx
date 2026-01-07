import { useEffect, useState } from 'react';
import { Profile } from '../lib/supabase';
import { TrendingUp, TrendingDown, Award, AlertTriangle, User } from 'lucide-react';
import { usersService } from '../services/usersService';
import { projectsService } from '../services/projectsService';
import { tasksService } from '../services/tasksService';

type UserPerformance = {
  user: Profile;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  refacaTasks: number;
  totalHours: number;
  completionRate: number;
};

type SupervisorPerformance = {
  supervisor: Profile;
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
};

export default function Monitoring() {
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [supervisorPerformance, setSupervisorPerformance] = useState<SupervisorPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  async function loadMonitoringData() {
    try {
      // TODO: Backend precisa implementar endpoints de performance
      // GET /api/users/performance - retorna dados de performance dos usuários
      // GET /api/users/supervisors-performance - retorna dados de performance dos supervisores

      // Por enquanto, vamos usar dados mock para não quebrar a interface
      // Quando os endpoints estiverem prontos, descomentar o código abaixo:

      /*
      const usersPerf = await usersService.getUsersPerformance();
      setUserPerformance(usersPerf.data);

      const supervisorsPerf = await usersService.getSupervisorsPerformance();
      setSupervisorPerformance(supervisorsPerf.data);
      */

      // Dados mock temporários
      setUserPerformance([]);
      setSupervisorPerformance([]);

    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Monitoramento</h1>
        <p className="text-gray-600 mt-1">Acompanhe o desempenho da equipe e identifique gargalos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Ranking de Engenheiros</h2>
            <Award className="w-6 h-6 text-yellow-500" />
          </div>

          <div className="space-y-4">
            {userPerformance.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum usuário encontrado</p>
            ) : (
              userPerformance.map((perf, index) => (
                <div
                  key={perf.user.id}
                  className={`p-4 rounded-lg border-2 transition ${
                    index === 0
                      ? 'bg-yellow-50 border-yellow-300'
                      : index === 1
                      ? 'bg-gray-50 border-gray-300'
                      : index === 2
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? 'bg-yellow-500 text-white'
                            : index === 1
                            ? 'bg-gray-400 text-white'
                            : index === 2
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{perf.user.full_name}</p>
                        <p className="text-xs text-gray-500">{perf.user.email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {perf.completionRate >= 80 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : perf.completionRate < 50 ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : null}
                        <span className="text-lg font-bold text-gray-900">
                          {perf.completionRate.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Taxa de conclusão</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{perf.totalTasks}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600">{perf.completedTasks}</p>
                      <p className="text-xs text-gray-600">Concluídas</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-yellow-600">{perf.inProgressTasks}</p>
                      <p className="text-xs text-gray-600">Em progresso</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-red-600">{perf.refacaTasks}</p>
                      <p className="text-xs text-gray-600">Refaça</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Horas trabalhadas</span>
                      <span className="font-semibold text-gray-900">
                        {perf.totalHours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Desempenho de Supervisores</h2>
            <User className="w-6 h-6 text-blue-500" />
          </div>

          <div className="space-y-4">
            {supervisorPerformance.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum supervisor encontrado</p>
            ) : (
              supervisorPerformance.map((perf) => (
                <div
                  key={perf.supervisor.id}
                  className="p-4 rounded-lg border-2 border-gray-200 bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{perf.supervisor.full_name}</p>
                        <p className="text-xs text-gray-500">{perf.supervisor.email}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {perf.completionRate.toFixed(0)}%
                      </span>
                      <p className="text-xs text-gray-500">Conclusão</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{perf.totalProjects}</p>
                      <p className="text-xs text-gray-600">Projetos</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600">{perf.activeProjects}</p>
                      <p className="text-xs text-gray-600">Ativos</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-blue-600">{perf.totalTasks}</p>
                      <p className="text-xs text-gray-600">Tarefas</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600">{perf.completedTasks}</p>
                      <p className="text-xs text-gray-600">Completas</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${perf.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Indicadores de Gargalos</h2>
          <AlertTriangle className="w-6 h-6 text-orange-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-red-50 border-2 border-red-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Tarefas em Refaça</h3>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">
              {userPerformance.reduce((sum, p) => sum + p.refacaTasks, 0)}
            </p>
            <p className="text-sm text-gray-600 mt-2">Requerem atenção imediata</p>
          </div>

          <div className="p-6 rounded-lg bg-yellow-50 border-2 border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Baixo Desempenho</h3>
              <TrendingDown className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {userPerformance.filter((p) => p.completionRate < 50).length}
            </p>
            <p className="text-sm text-gray-600 mt-2">Usuários abaixo de 50%</p>
          </div>

          <div className="p-6 rounded-lg bg-orange-50 border-2 border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Sobrecarga</h3>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {userPerformance.filter((p) => p.inProgressTasks > 5).length}
            </p>
            <p className="text-sm text-gray-600 mt-2">Usuários com mais de 5 tarefas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
