import apiClient from './apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
      email: string;
      full_name: string;
      role: 'user' | 'supervisor' | 'admin';
      avatar_url?: string;
    };
  };
}

export const authService = {
  // Login
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);

    // Salvar tokens no localStorage
    const { accessToken, refreshToken, user } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  // Registrar
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);

    // Salvar tokens no localStorage
    const { accessToken, refreshToken, user } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  // Obter dados do usuário logado
  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data.data.user;
  },

  // Logout
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Limpar localStorage mesmo se a requisição falhar
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Refresh token
  async refreshToken(refreshToken: string) {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    return accessToken;
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  // Obter usuário do localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // =====================================================
  // ADMIN: Reset de Senha de Usuário
  // =====================================================
  async adminResetUserPassword(userId: number, newPassword: string) {
    const response = await apiClient.put(`/auth/users/${userId}/reset-password`, {
      new_password: newPassword,
    });
    return response.data;
  },
};
