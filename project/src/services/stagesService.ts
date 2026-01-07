import apiClient from './apiClient';

export const stagesService = {
  // Listar etapas de um projeto
  async getByProject(projectId: number) {
    const response = await apiClient.get(`/stages/project/${projectId}`);
    return response.data.data;
  },

  // Obter etapa por ID
  async getById(id: number) {
    const response = await apiClient.get(`/stages/${id}`);
    return response.data.data;
  },

  // Criar etapa
  async create(projectId: number, data: {
    name: string;
    description?: string;
    is_parallel?: boolean;
  }) {
    const response = await apiClient.post(`/stages/project/${projectId}`, data);
    return response.data.data;
  },

  // Atualizar etapa
  async update(id: number, data: Partial<{
    name: string;
    description: string;
    is_parallel: boolean;
    order: number;
  }>) {
    const response = await apiClient.put(`/stages/${id}`, data);
    return response.data.data;
  },

  // Deletar etapa
  async delete(id: number) {
    const response = await apiClient.delete(`/stages/${id}`);
    return response.data;
  },
};
