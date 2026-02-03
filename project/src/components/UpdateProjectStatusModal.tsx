import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ProjectStatus } from '../types';
import { projectsService } from '../services/projectsService';

interface UpdateProjectStatusModalProps {
  projectId: number;
  projectName: string;
  currentStatus: ProjectStatus;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'active', label: '🟢 Ativo', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: '🔵 Concluído', color: 'bg-blue-100 text-blue-800' },
  { value: 'on_hold', label: '🟡 Em Espera', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'cancelled', label: '🔴 Cancelado', color: 'bg-red-100 text-red-800' },
];

const UpdateProjectStatusModal: React.FC<UpdateProjectStatusModalProps> = ({
  projectId,
  projectName,
  currentStatus,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [newStatus, setNewStatus] = useState<ProjectStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newStatus === currentStatus) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await projectsService.update(projectId, {
        status: newStatus,
      });

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
          <h2 className="text-xl font-bold text-gray-900">Alterar Status do Projeto</h2>
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
              Projeto: <span className="font-semibold text-gray-900">{projectName}</span>
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecione o novo status:
            </label>

            <div className="space-y-2">
              {STATUS_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={newStatus === option.value ? 'flex items-center p-3 border border-blue-500 rounded-lg cursor-pointer transition-colors bg-blue-50' : 'flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors hover:bg-gray-50'}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={newStatus === option.value}
                    onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${option.color}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Dica:</strong> Esta ação atualizará o status do projeto imediatamente.
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

export default UpdateProjectStatusModal;
