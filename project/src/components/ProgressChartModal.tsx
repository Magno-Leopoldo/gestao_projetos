import React, { useState, useEffect } from 'react';
import { X, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { timeEntriesService } from '../services/timeEntriesService';

interface ProgressChartModalProps {
  isOpen: boolean;
  taskId: number;
  taskTitle?: string;
  suggestedHours?: number | string;
  assignees?: any[];
  onClose: () => void;
}

const ProgressChartModal: React.FC<ProgressChartModalProps> = ({
  isOpen,
  taskId,
  taskTitle = 'Tarefa',
  suggestedHours = 0,
  assignees = [],
  onClose,
}) => {
  // Garantir que suggestedHours é número
  const suggestedHoursNum = parseFloat(suggestedHours as any) || 0;

  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'custom' | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<number | undefined>(undefined);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Carregar dados do gráfico
  const loadChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: any = {
        period: period === 'custom' ? 'custom' : period,
      };

      if (selectedUser) {
        filters.user_id = selectedUser;
      }

      if (period === 'custom' && customStartDate && customEndDate) {
        filters.start_date = customStartDate;
        filters.end_date = customEndDate;
      }

      const result = await timeEntriesService.getTaskProgressChart(taskId, filters);

      if (result.success && result.data) {
        setChartData(result.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do gráfico:', err);
      setError('Erro ao carregar dados do gráfico');
    } finally {
      setLoading(false);
    }
  };

  // Recarregar ao mudar filtros
  useEffect(() => {
    if (isOpen) {
      loadChartData();
    }
  }, [isOpen, period, selectedUser, customStartDate, customEndDate, taskId]);

  if (!isOpen) return null;

  const formatDateForDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Tooltip customizado em português
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      try {
        const data = payload[0].payload;

        // Validações de segurança para garantir que os dados existem
        if (!data) {
          console.warn('⚠️ CustomTooltip: data é null/undefined');
          return null;
        }

        const horasReais = parseFloat(data.horasReais) || 0;
        const horasSugeridas = parseFloat(data.horasSugeridas) || 0;
        const diferenca = horasReais - horasSugeridas;
        const percentual = horasSugeridas > 0 ? ((horasReais / horasSugeridas) * 100).toFixed(1) : '0.0';
        const temBreakdown = data.users && Array.isArray(data.users) && data.users.length > 0;

        // Debug
        console.log('✅ CustomTooltip renderizando:', { data, horasReais, horasSugeridas, temBreakdown });

        return (
          <div className="bg-white rounded-lg shadow-2xl p-4 border border-gray-200 max-w-xs z-50">
            <p className="font-bold text-gray-900 mb-3 text-sm capitalize">
              {data.data ? formatDateFull(data.data) : 'Data desconhecida'}
            </p>
            <div className="space-y-2">
              <p className="text-blue-600 text-sm font-semibold">
                🔵 Horas Reais: <span className="font-bold">{horasReais.toFixed(2)}h</span>
              </p>
              <p className="text-green-600 text-sm font-semibold">
                🟢 Sugestão: <span className="font-bold">{horasSugeridas.toFixed(2)}h</span>
              </p>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <p className={`text-sm font-semibold flex items-center gap-2 ${
                  diferenca >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  📊 Diferença: <span className="font-bold">{diferenca > 0 ? '+' : ''}{diferenca.toFixed(2)}h</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {percentual}% da meta {diferenca >= 0 ? '✅' : '⚠️'}
                </p>
              </div>

              {/* Breakdown por usuário (quando em modo "Todos") */}
              {temBreakdown && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-xs font-bold text-gray-700 mb-2">👥 Detalhamento por Usuário:</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {data.users.map((user: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                        <span className="text-gray-700">{user.name || 'Desconhecido'}</span>
                        <span className="font-bold text-blue-600">{(parseFloat(user.horas) || 0).toFixed(2)}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      } catch (error) {
        console.error('❌ Erro ao renderizar CustomTooltip:', error);
        return null;
      }
    }
    return null;
  };

  // Processar dados para agregação (quando em modo "Todos")
  const processedData = (() => {
    // Verificar se precisa agregar (múltiplos usuários por dia)
    const needsAggregation = selectedUser === undefined && chartData.length > 0 && chartData[0]?.user_id;

    console.log('📊 Processamento de dados:', {
      selectedUser,
      needsAggregation,
      chartDataLength: chartData.length,
      firstItem: chartData[0],
    });

    let resultData: any[] = [];

    if (needsAggregation) {
      // Mode: Breakdown por usuário - agregar para gráfico, mas manter detalhes
      const aggregated = Object.values(
        chartData.reduce((acc: any, item: any) => {
          const date = item.data;

          if (!acc[date]) {
            acc[date] = {
              data: date,
              horasReais: 0,
              horasSugeridas: parseFloat(item.horasSugeridas) || 0,
              users: [],
            };
          }

          const horasReais = parseFloat(item.horasReais) || 0;
          acc[date].horasReais += horasReais;

          // Adicionar informação do usuário
          if (item.user_id && item.user_name) {
            acc[date].users.push({
              name: item.user_name,
              horas: horasReais,
              user_id: item.user_id,
            });
          }

          return acc;
        }, {})
      ).sort((a: any, b: any) => a.data.localeCompare(b.data));

      // ✅ IMPORTANTE: Normalizar dados agregados para garantir compatibilidade com Recharts
      resultData = aggregated.map((item: any) => ({
        data: String(item.data),
        horasReais: parseFloat(item.horasReais) || 0,
        horasSugeridas: parseFloat(item.horasSugeridas) || 0,
        users: Array.isArray(item.users) ? item.users : [],
      }));

      console.log('✅ Dados agregados:', resultData.slice(0, 3));
    } else {
      // Mode: Sem breakdown (filtrado por usuário ou dados já agregados)
      resultData = chartData.map((item: any) => ({
        data: String(item.data),
        horasReais: parseFloat(item.horasReais) || 0,
        horasSugeridas: parseFloat(item.horasSugeridas) || 0,
        users: Array.isArray(item.users) ? item.users : [],
      }));

      console.log('✅ Dados sem agregação:', resultData.slice(0, 3));
    }

    return resultData;
  })();

  // Debug final
  console.log('🎯 Final - ProgressChart', {
    selectedUser,
    chartDataLength: chartData.length,
    processedDataLength: processedData.length,
    processedDataFirst: processedData[0],
    formattedDataLength: 0, // será definido abaixo
  });

  // Calcular estatísticas (após processedData ser definido)
  const stats = {
    totalDias: processedData.length,
    totalHoras: processedData.reduce((sum: number, d: any) => sum + d.horasReais, 0),
    mediaHoras:
      processedData.length > 0
        ? (processedData.reduce((sum: number, d: any) => sum + d.horasReais, 0) / processedData.length).toFixed(2)
        : '0.00',
    maxHoras: processedData.length > 0 ? Math.max(...processedData.map((d: any) => d.horasReais)).toFixed(2) : '0.00',
  };

  const formattedData = processedData.map((d: any) => ({
    ...d,
    dataDisplay: formatDateForDisplay(d.data),
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <TrendingUp className="w-6 h-6" />
              Evolução das Horas
            </h2>
            <p className="text-purple-100 text-sm mt-1">{taskTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-100 hover:text-white hover:bg-purple-500 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* Filtros */}
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-8 border border-gray-200 space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Filtros</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              {/* Botões de Período */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">Período:</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {(['all', 'today', 'week', 'month', 'custom'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
                        period === p
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {p === 'all'
                        ? 'Todos'
                        : p === 'today'
                        ? 'Hoje'
                        : p === 'week'
                        ? 'Semana'
                        : p === 'month'
                        ? 'Mês'
                        : 'Customizado'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Pickers (Custom) */}
              {period === 'custom' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">De:</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Até:</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </>
              )}

              {/* Filtro de Usuário */}
              {assignees.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usuário:</label>
                  <select
                    value={selectedUser || ''}
                    onChange={(e) => setSelectedUser(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Todos</option>
                    {assignees.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Estatísticas */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-2">Dias</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalDias}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-2">Total</p>
                <p className="text-3xl font-bold text-green-900">{stats.totalHoras.toFixed(2)}h</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <p className="text-xs text-purple-700 font-bold uppercase tracking-wider mb-2">Média</p>
                <p className="text-3xl font-bold text-purple-900">{stats.mediaHoras}h</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                <p className="text-xs text-orange-700 font-bold uppercase tracking-wider mb-2">Máximo</p>
                <p className="text-3xl font-bold text-orange-900">{stats.maxHoras}h</p>
              </div>
            </div>
          )}

          {/* Gráfico */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="p-8 bg-gray-50 rounded-lg text-center border border-gray-200">
              <p className="text-gray-600 font-medium">Nenhum dado disponível para este período</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <ResponsiveContainer width="100%" height={550}>
                <LineChart
                  key={`chart-${selectedUser || 'todos'}-${period}`}
                  data={formattedData}
                  margin={{ top: 20, right: 120, left: 20, bottom: 20 }}
                  onMouseMove={(state: any) => {
                    if (state?.isTooltipActive) {
                      console.log('🖱️ Hover ativo:', state?.activeTooltipIndex);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="dataDisplay"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Horas', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ strokeDasharray: '3 3', stroke: '#9ca3af' }}
                    wrapperStyle={{ outline: 'none', zIndex: 1000 }}
                    contentStyle={{ outline: 'none', zIndex: 1000 }}
                    isAnimationActive={false}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <ReferenceLine
                    y={suggestedHoursNum}
                    stroke="#10b981"
                    strokeDasharray="5 5"
                    name="Sugestão"
                    label={{
                      value: `Sugestão: ${suggestedHoursNum.toFixed(2)}h`,
                      position: 'insideRight',
                      offset: -10,
                      fill: '#10b981',
                      fontSize: 12,
                      fontWeight: 'bold',
                      backgroundColor: '#f0fdf4',
                      padding: 4,
                      borderRadius: 4,
                      border: '1px solid #10b981',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="horasReais"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 6, cursor: 'pointer' }}
                    activeDot={{ r: 8, cursor: 'pointer' }}
                    name="Horas Reais"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legenda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-3 h-3 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
              <span className="text-blue-900">
                <strong>Linha Azul:</strong> Horas reais trabalhadas por dia
              </span>
            </div>
            <div className="flex items-start gap-4 p-5 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-1 bg-green-600 mt-2 flex-shrink-0"></div>
              <span className="text-green-900">
                <strong>Linha Verde (tracejado):</strong> Horas sugeridas ({suggestedHoursNum.toFixed(2)}h)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-slate-50 border-t-2 border-gray-200 p-8">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 hover:shadow-lg transition-all active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressChartModal;
