import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

type User = {
  id: number;
  email: string;
  full_name: string;
  role: 'user' | 'supervisor' | 'admin';
  avatar_url?: string;
};

type AuthContextType = {
  user: User | null;
  profile: User | null; // Manter compatibilidade com código existente
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está autenticado ao carregar
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const savedUser = authService.getCurrentUser();
      const hasToken = authService.isAuthenticated();

      if (savedUser && hasToken) {
        // Tentar obter dados atualizados do usuário
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
          // Se falhar, usar dados salvos
          setUser(savedUser);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    try {
      setLoading(true);
      const response = await authService.register({ email, password, full_name: fullName });
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user, // Manter compatibilidade
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
