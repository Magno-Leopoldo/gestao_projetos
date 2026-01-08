import React from 'react';
import { X, Info, Users, Clock, TrendingUp } from 'lucide-react';

interface Assignee {
  id: number;
  full_name: string;
  daily_hours: number;
}

interface DailyHoursDetailsModalProps {
  isOpen: boolean;
  taskTitle?: string;
  suggestedHours: number;
  assignees: Assignee[];
  onClose: () => void;
}

const DailyHoursDetailsModal: React.FC<DailyHoursDetailsModalProps> = ({
  isOpen,
  taskTitle = 'Tarefa',
  suggestedHours,
  assignees,
  onClose,
}) => {
  if (!isOpen) return null;

  // Calcular total de horas alocadas (garantir que são números)
  const totalAllocated = assignees.reduce((sum, a) => {
    const hours = parseFloat(a.daily_hours) || 0;
    return sum + hours;
  }, 0);

  // Garantir que suggestedHours é número
  const suggested = parseFloat(suggestedHours as any) || 0;

  // Calcular diferença corretamente
  const difference = totalAllocated - suggested;
  const isAbove = difference > 0;
  const isBelow = difference < 0;
  const isEqual = difference === 0;

  // Calcular percentual de uso
  const percentualUsed = suggested > 0 ? (totalAllocated / suggested) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Horas Dedicadas</h2>
            <p className="text-blue-100 text-sm mt-1 truncate">{taskTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white hover:bg-blue-500 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Comparação Visual com Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-gray-700">Sugestão</span>
              </div>
              <span className="text-2xl font-bold text-amber-700">{suggested.toFixed(2)}h</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Alocado</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{totalAllocated.toFixed(2)}h</span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    percentualUsed > 100
                      ? 'bg-red-500'
                      : percentualUsed > 90
                      ? 'bg-orange-500'
                      : percentualUsed > 75
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(percentualUsed, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">
                {percentualUsed.toFixed(0)}% do sugerido
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`p-4 rounded-lg border-2 ${
            isAbove
              ? 'bg-green-50 border-green-200'
              : isBelow
              ? 'bg-orange-50 border-orange-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className="text-center text-sm font-semibold">
              <span className={isAbove ? 'text-green-700' : isBelow ? 'text-orange-700' : 'text-blue-700'}>
                {isAbove
                  ? `✓ +${Math.abs(difference).toFixed(2)}h acima da sugestão`
                  : isBelow
                  ? `⚠ ${difference.toFixed(2)}h abaixo da sugestão`
                  : '✓ Alinhado com a sugestão'}
              </span>
            </p>
          </div>

          {/* Usuários Atribuídos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-gray-900">Usuários ({assignees.length})</p>
            </div>

            {assignees.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-sm text-gray-500">Nenhum usuário atribuído</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {assignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <span className="text-sm font-medium text-gray-700">{assignee.full_name}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {(parseFloat(assignee.daily_hours as any) || 0).toFixed(2)}h
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumo */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">Resumo</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Sugerido</p>
                <p className="text-lg font-bold text-amber-700">{suggested.toFixed(2)}h</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Alocado</p>
                <p className="text-lg font-bold text-blue-600">{totalAllocated.toFixed(2)}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 hover:shadow-lg transition-all active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyHoursDetailsModal;
