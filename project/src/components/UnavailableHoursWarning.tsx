import React from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface UnavailableHoursWarningProps {
  userName: string;
  currentHours: number;
  requestedHours: number;
  availableHours: number;
  onProceed: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Componente de aviso quando usuário não tem horas disponíveis
 * Mostra detalhes da alocação e permite que supervisor proceda mesmo assim
 */
const UnavailableHoursWarning: React.FC<UnavailableHoursWarningProps> = ({
  userName,
  currentHours,
  requestedHours,
  availableHours,
  onProceed,
  onCancel,
  isLoading = false,
}) => {
  const totalHours = currentHours + requestedHours;
  const isOverLimit = totalHours > 8;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-amber-50 border-b-2 border-amber-500 p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <h2 className="text-lg font-bold text-amber-900">Horas Insuficientes</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Mensagem Principal */}
          <div>
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">{userName}</span> já possui horas alocadas em outras tarefas.
            </p>
            <p className="text-sm text-gray-600">
              Atribuir essa tarefa deixará o usuário <span className="font-semibold text-red-600">sobrecarregado</span>.
            </p>
          </div>

          {/* Status Visual */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Horas atuais:</span>
              <span className="text-sm font-semibold text-gray-900">{currentHours}h/dia</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Horas solicitadas:</span>
              <span className="text-sm font-semibold text-blue-600">+ {requestedHours}h/dia</span>
            </div>
            <div className="border-t border-gray-300 pt-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total:</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                  {totalHours}h/dia
                </span>
                {isOverLimit ? (
                  <XCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
            </div>
          </div>

          {/* Aviso */}
          {isOverLimit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">
                <span className="font-semibold">❌ Limite excedido:</span> Total de {totalHours}h/dia ultrapassa o limite legal de 8h/dia.
              </p>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <span className="font-semibold">ℹ️ Informação:</span> Você pode prosseguir mesmo assim, mas o supervisor deve estar ciente de que o usuário ficará sobrecarregado.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            ✕ Cancelar
          </button>
          <button
            onClick={onProceed}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? '⏳ Processando...' : '⚠️ Prosseguir Mesmo Assim'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnavailableHoursWarning;
