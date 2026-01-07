import apiClient from './apiClient';

export const dashboardService = {
  // Obter estatísticas do dashboard (Supervisor/Admin)
  async getStats() {
    const response = await apiClient.get('/dashboard/stats');
    return response.data.data;
  },

  // Obter minhas tarefas
  async getMyTasks(status?: string) {
    const response = await apiClient.get('/dashboard/my-tasks', {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  },

  // Obter minhas horas alocadas
  async getMyHours() {
    const response = await apiClient.get('/dashboard/my-hours');
    return response.data.data;
  },
};
