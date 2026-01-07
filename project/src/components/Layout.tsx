import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Kanban, FolderKanban, BarChart3, LogOut, User } from 'lucide-react';

type LayoutProps = {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'kanban' | 'projects' | 'monitoring';
  onPageChange: (page: 'dashboard' | 'kanban' | 'projects' | 'monitoring') => void;
};

export default function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const canAccessDashboard = profile?.role === 'supervisor' || profile?.role === 'admin';
  const canAccessKanban = profile?.role === 'supervisor' || profile?.role === 'admin';
  const canAccessMonitoring = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FolderKanban className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Gestão de Projetos</span>
              </div>

              <div className="flex space-x-1">
                {canAccessDashboard && (
                  <button
                    onClick={() => {
                      onPageChange('dashboard');
                      navigate('/dashboard');
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                      currentPage === 'dashboard'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>
                )}

                {canAccessKanban && (
                  <button
                    onClick={() => {
                      onPageChange('kanban');
                      navigate('/kanban');
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                      currentPage === 'kanban'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Kanban className="w-5 h-5" />
                    <span>Kanban</span>
                  </button>
                )}

                <button
                  onClick={() => navigate('/projects')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition text-gray-700 hover:bg-gray-100`}
                >
                  <FolderKanban className="w-5 h-5" />
                  <span>Projetos</span>
                </button>

                {canAccessMonitoring && (
                  <button
                    onClick={() => { onPageChange('monitoring'); navigate('/monitoramento'); }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                      currentPage === 'monitoring'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Monitoramento</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>

              <button
                onClick={signOut}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
