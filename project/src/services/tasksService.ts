import apiClient from './apiClient';

export const tasksService = {
  // Listar todas as tarefas
  async getAll() {
    const response = await apiClient.get('/tasks');
    return response.data.data;
  },

  // Listar tarefas de uma etapa
  async getByStage(stageId: number) {
    const response = await apiClient.get(`/tasks/stage/${stageId}`);
    return response.data.data;
  },

  // Obter tarefa por ID
  async getById(id: number) {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data.data;
  },

  // Criar tarefa
  async create(stageId: number, data: {
    title: string;
    description?: string;
    estimated_hours: number;
    daily_hours: number;
    priority?: 'low' | 'medium' | 'high';
    due_date?: string;
    assigned_user_ids?: number[];
  }) {
    const response = await apiClient.post(`/tasks/stage/${stageId}`, data);
    return response.data.data;
  },

  // Atualizar tarefa
  async update(id: number, data: Partial<{
    title: string;
    description: string;
    estimated_hours: number;
    daily_hours: number;
    priority: string;
    due_date: string;
  }>) {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data.data;
  },

  // Atualizar status da tarefa
  async updateStatus(id: number, status: string, reason?: string) {
    const response = await apiClient.patch(`/tasks/${id}/status`, { status, reason });
    return response.data.data;
  },

  // Atribuir usuários à tarefa (novo formato com daily_hours por usuário)
  async assignUsers(
    taskId: number,
    assignments: Array<{ user_id: number; daily_hours: number }>
  ) {
    const response = await apiClient.post(`/tasks/${taskId}/assign`, { assignments });
    return response.data;
  },

  // Atualizar daily_hours para um assignment específico
  async updateAssignmentDailyHours(
    taskId: number,
    userId: number,
    dailyHours: number
  ) {
    const response = await apiClient.patch(`/tasks/${taskId}/assign/${userId}`, {
      daily_hours: dailyHours,
    });
    return response.data;
  },

  // Remover usuário da tarefa
  async unassignUser(taskId: number, userId: number) {
    const response = await apiClient.delete(`/tasks/${taskId}/assign/${userId}`);
    return response.data;
  },

  // Deletar tarefa
  async delete(id: number) {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },
};
