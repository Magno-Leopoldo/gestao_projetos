import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TaskStatus, STATUS_LABELS } from '../types';
import { tasksService } from '../services/tasksService';

interface UpdateTaskStatusModalProps {
  taskId: number;
  taskTitle: string;
  currentStatus: TaskStatus;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string; icon: string }[] = [
  { value: 'novo', label: STATUS_LABELS.novo, color: 'bg-blue-100 text-blue-900 border-blue-500', icon: '🔵' },
  { value: 'em_desenvolvimento', label: STATUS_LABELS.em_desenvolvimento, color: 'bg-yellow-100 text-yellow-900 border-yellow-500', icon: '🟡' },
  { value: 'concluido', label: STATUS_LABELS.concluido, color: 'bg-green-100 text-green-900 border-green-500', icon: '🟢' },
  { value: 'refaca', label: STATUS_LABELS.refaca, color: 'bg-red-100 text-red-900 border-red-500', icon: '🔴' },
];

const UpdateTaskStatusModal: React.FC<UpdateTaskStatusModalProps> = ({
  taskId,
  taskTitle,
  currentStatus,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newStatus, setNewStatus] = useState<TaskStatus>(currentStatus);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newStatus === currentStatus) {
      onClose();
      return;
    }

    // Validar razão para "Refaça"
    if (newStatus === 'refaca' && !reason.trim()) {
      setError('É obrigatório informar a razão para mover para "Refaça"');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await tasksService.updateStatus(taskId, newStatus, reason || undefined);
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao atualizar status';
      setError(errorMsg);
      console.error('Erro ao atualizar status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Alterar Status da Tarefa</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 mb-4">
              Tarefa: <span className="font-semibold text-gray-900">{taskTitle}</span>
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecione o novo status:
            </label>

            <div className="space-y-2">
              {STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={newStatus === option.value ? `flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors bg-blue-50 ${option.color}` : 'flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:bg-gray-50'}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={newStatus === option.value}
                    onChange={(e) => {
                      setNewStatus(e.target.value as TaskStatus);
                      setReason(''); // Limpar razão ao mudar status
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className="ml-3">
                    {option.icon} <span className="font-medium">{option.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Razão para Refaça */}
          {newStatus === 'refaca' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Por que está movendo para "Refaça"? *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva brevemente o motivo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                rows={3}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Campo obrigatório para mover para "Refaça"</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Dica:</strong> Esta ação atualizará o status da tarefa imediatamente.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || newStatus === currentStatus}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Atualizando...' : 'Atualizar Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateTaskStatusModal;
