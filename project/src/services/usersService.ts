import apiClient from './apiClient';

export const usersService = {
  // Obter todos os usuários
  async getAll() {
    const response = await apiClient.get('/users');
    return response.data.data || response.data;
  },

  // Obter usuários por role
  async getByRole(role: 'user' | 'supervisor' | 'admin') {
    const response = await apiClient.get(`/users?role=${role}`);
    return response.data.data || response.data;
  },

  // Obter um usuário específico
  async getById(id: string) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data || response.data;
  },

  // Obter performance de usuários (para monitoring)
  async getUsersPerformance() {
    const response = await apiClient.get('/users/performance');
    return response.data.data || response.data;
  },

  // Obter performance de supervisores (para monitoring)
  async getSupervisorsPerformance() {
    const response = await apiClient.get('/users/supervisors-performance');
    return response.data.data || response.data;
  },

  // Alterar role de um usuário (admin only)
  async updateRole(userId: number, role: string) {
    const response = await apiClient.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Ativar/desativar um usuário (admin only)
  async toggleActive(userId: number) {
    const response = await apiClient.patch(`/users/${userId}/toggle-active`);
    return response.data;
  },
};
