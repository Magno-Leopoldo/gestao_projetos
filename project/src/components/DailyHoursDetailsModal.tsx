import React from 'react';
import { X, Info } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Horas Dedicadas por Dia</h2>
            <p className="text-sm text-gray-600 mt-1">{taskTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Sugestão do Supervisor */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-900">Sugestão do Supervisor</p>
            </div>
            <p className="text-3xl font-bold text-amber-700">{suggestedHours}h/dia</p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">vs</span>
            </div>
          </div>

          {/* Horas Alocadas pelos Usuários */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Horas Alocadas pelos Usuários:</p>

            {assignees.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Nenhum usuário atribuído</p>
            ) : (
              <div className="space-y-2">
                {assignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700">{assignee.full_name}</span>
                    <span className="font-semibold text-gray-900">
                      {(parseFloat(assignee.daily_hours as any) || 0).toFixed(2)}h
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Alocado */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Total Alocado</p>
            <p className="text-3xl font-bold text-blue-600">{totalAllocated.toFixed(2)}h/dia</p>
            <p className="text-xs text-gray-600 mt-2">
              {assignees.length === 0
                ? 'Nenhum usuário atribuído'
                : `${assignees.length} usuário${assignees.length !== 1 ? 's' : ''} comprometido${assignees.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Comparação */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-2">Comparação:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>
                Sugestão: <strong className="text-amber-700">{suggested.toFixed(2)}h</strong>
              </p>
              <p>
                Alocado: <strong className="text-blue-700">{totalAllocated.toFixed(2)}h</strong>
              </p>
              <p className="pt-2 border-t border-gray-300 mt-2">
                Diferença:{' '}
                <strong
                  className={isAbove ? 'text-green-700' : isBelow ? 'text-orange-700' : 'text-gray-700'}
                >
                  {isAbove
                    ? `+${Math.abs(difference).toFixed(2)}h (acima)`
                    : isBelow
                    ? `${difference.toFixed(2)}h (abaixo)`
                    : 'Igual à sugestão'}
                </strong>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyHoursDetailsModal;
