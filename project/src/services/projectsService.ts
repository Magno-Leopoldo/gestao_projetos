import apiClient from './apiClient';

export const projectsService = {
  // Listar projetos
  async getAll(params?: { status?: string; search?: string; include?: string }) {
    const response = await apiClient.get('/projects', { params });
    return response.data.data;
  },

  // Obter projeto por ID
  async getById(id: number) {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data.data;
  },

  // Criar projeto
  async create(data: {
    name: string;
    description?: string;
    start_date?: string;
    due_date: string;
  }) {
    const response = await apiClient.post('/projects', data);
    return response.data.data;
  },

  // Atualizar projeto
  async update(id: number, data: Partial<{
    name: string;
    description: string;
    status: string;
    start_date: string;
    due_date: string;
  }>) {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data.data;
  },

  // Deletar projeto
  async delete(id: number) {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },

  // Calcular risco do projeto
  async getRisk(id: number) {
    const response = await apiClient.get(`/projects/${id}/risk`);
    return response.data.data;
  },
};
