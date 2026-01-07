import React, { useState, useEffect } from 'react';
import { usersService } from '../services/usersService';
import { authService } from '../services/authService';
import { User } from '../types';
import { Key, AlertCircle, CheckCircle, X } from 'lucide-react';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal de reset de senha
  const [resetModal, setResetModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
    userEmail: string;
    newPassword: string;
  }>({
    isOpen: false,
    userId: null,
    userName: '',
    userEmail: '',
    newPassword: '',
  });

  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getAll();
      setUsers(data || []);
    } catch (err: any) {
      setError('Erro ao carregar usuários');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openResetModal = (user: User) => {
    setResetModal({
      isOpen: true,
      userId: user.id,
      userName: user.full_name,
      userEmail: user.email,
      newPassword: '',
    });
  };

  const closeResetModal = () => {
    setResetModal({
      isOpen: false,
      userId: null,
      userName: '',
      userEmail: '',
      newPassword: '',
    });
  };

  const handleResetPassword = async () => {
    if (!resetModal.userId || !resetModal.newPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (resetModal.newPassword.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    setResetting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authService.adminResetUserPassword(
        resetModal.userId,
        resetModal.newPassword
      );

      setSuccess(
        `✅ Senha de ${resetModal.userName} resetada com sucesso!\n\n` +
        `Nova senha: ${resetModal.newPassword}\n\n` +
        `⚠️ Compartilhe com o usuário de forma segura`
      );

      // Fechar modal após 2 segundos
      setTimeout(() => {
        closeResetModal();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Erro ao resetar senha';
      setError(errorMsg);
    } finally {
      setResetting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      user: 'Usuário',
      supervisor: 'Supervisor',
      admin: 'Administrador',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      user: 'bg-blue-100 text-blue-800',
      supervisor: 'bg-yellow-100 text-yellow-800',
      admin: 'bg-red-100 text-red-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
        <p className="text-gray-600 mt-1">Resetar senhas e gerenciar permissões</p>
      </div>

      {/* Error Message */}
      {error && !resetModal.isOpen && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Erro</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && !resetModal.isOpen && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-800 font-medium">Sucesso</p>
            <p className="text-green-700 text-sm mt-1 whitespace-pre-line">{success}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Users Table */}
      {!loading && users.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => openResetModal(user)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs"
                    >
                      <Key className="w-4 h-4" />
                      Resetar Senha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum usuário encontrado</p>
        </div>
      )}

      {/* Modal de Reset de Senha */}
      {resetModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Resetar Senha</h3>
              </div>
              <button
                onClick={closeResetModal}
                disabled={resetting}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Usuário</p>
                <p className="text-sm text-gray-600 mt-1">{resetModal.userName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{resetModal.userEmail}</p>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={resetModal.newPassword}
                  onChange={(e) =>
                    setResetModal({ ...resetModal, newPassword: e.target.value })
                  }
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  disabled={resetting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {resetModal.newPassword.length === 0
                    ? 'Digite a nova senha'
                    : resetModal.newPassword.length < 6
                    ? `${6 - resetModal.newPassword.length} caracteres faltando`
                    : '✅ Senha válida'}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ Importante:</strong> Compartilhe a nova senha com o usuário de forma segura. Não reutilize esta senha para outros usuários.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeResetModal}
                disabled={resetting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetting || resetModal.newPassword.length < 6}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Resetando...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Resetar Senha
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
