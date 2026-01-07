import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { usersService } from '../services/usersService';
import { tasksService } from '../services/tasksService';

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface AssignUsersModalProps {
  taskId: number;
  taskDailyHours?: number; // Sugestão do supervisor
  currentAssignees: User[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignUsersModal: React.FC<AssignUsersModalProps> = ({
  taskId,
  taskDailyHours = 0,
  currentAssignees,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userDailyHours, setUserDailyHours] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      // Inicializar com usuários atualmente atribuídos e suas horas
      setSelectedUserIds(currentAssignees.map(u => u.id));
      // Inicializar horas de cada usuário com a sugestão do supervisor
      const initialHours: Record<number, number> = {};
      currentAssignees.forEach(u => {
        // Se usuário já tem daily_hours, manter; senão usar sugestão
        const userDailyHours = parseFloat((u as any).daily_hours) || taskDailyHours || 0;
        initialHours[u.id] = userDailyHours;
      });
      setUserDailyHours(initialHours);
    }
  }, [isOpen, currentAssignees, taskDailyHours]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const users = await usersService.getAll();
      setAllUsers(users);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao carregar usuários';
      setError(errorMsg);
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        // Novo usuário selecionado - inicializar com sugestão do supervisor
        setUserDailyHours(prevHours => ({
          ...prevHours,
          [userId]: taskDailyHours || 0,
        }));
        return [...prev, userId];
      }
    });
  };

  const handleUserHoursChange = (userId: number, hours: number) => {
    setUserDailyHours(prev => ({
      ...prev,
      [userId]: parseFloat(hours as any) || 0,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar assignments com daily_hours para cada usuário
      const assignments = selectedUserIds.map(userId => ({
        user_id: userId,
        daily_hours: userDailyHours[userId] || taskDailyHours || 0,
      }));

      // Atribuir usuários selecionados COM daily_hours
      if (assignments.length > 0) {
        await tasksService.assignUsers(taskId, assignments);
      }

      // Remover usuários que foram deseleccionados
      const usersToRemove = currentAssignees.filter(u => !selectedUserIds.includes(u.id));
      for (const user of usersToRemove) {
        await tasksService.unassignUser(taskId, user.id);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao atribuir usuários';
      setError(errorMsg);
      console.error('Erro ao atribuir usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = allUsers.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Atribuir Usuários à Tarefa</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Search Box */}
          <div>
            <input
              type="text"
              placeholder="Buscar usuário por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={loading}
            />
          </div>

          {/* Users List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading && filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 text-sm">Carregando usuários...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-gray-600 text-center py-8 text-sm">Nenhum usuário encontrado</p>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                const isCurrentlyAssigned = currentAssignees.some(u => u.id === user.id);

                return (
                  <div
                    key={user.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => handleToggleUser(user.id)}>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {user.role === 'admin' ? '👤 Admin' : user.role === 'supervisor' ? '👨‍💼 Supervisor' : '👤 Usuário'}
                        </span>
                        {isCurrentlyAssigned && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            ✓ Atribuído
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Input de Daily Hours (mostra quando selecionado) */}
                    {isSelected && (
                      <div className="ml-8 flex items-center gap-2 p-3 bg-white rounded border border-blue-200">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Horas/dia:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="8"
                          step="0.5"
                          value={userDailyHours[user.id] || 0}
                          onChange={(e) => handleUserHoursChange(user.id, parseFloat(e.target.value))}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={loading}
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          (sugestão: {taskDailyHours}h)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Summary */}
          {filteredUsers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>{selectedUserIds.length}</strong> usuário(s) selecionado(s) para atribuição
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Salvar Atribuições'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignUsersModal;
