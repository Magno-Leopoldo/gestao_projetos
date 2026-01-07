import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Kanban from './components/Kanban';
import Monitoring from './components/Monitoring';
import ProjectsList from './components/ProjectsList';
import StagesView from './components/StagesView';
import TasksList from './components/TasksList';
import TaskDetail from './components/TaskDetail';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'kanban' | 'projects' | 'monitoring'>(() => {
    if (!profile) return 'projects';
    return profile.role === 'user' ? 'projects' : 'dashboard';
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  return (
    <Router>
      <Routes>
        {/* Pages com Layout - rotas específicas */}
        <Route path="/dashboard" element={<Layout currentPage="dashboard" onPageChange={setCurrentPage}><Dashboard /></Layout>} />
        <Route path="/kanban" element={<Layout currentPage="kanban" onPageChange={setCurrentPage}><Kanban /></Layout>} />
        <Route path="/monitoramento" element={<Layout currentPage="monitoring" onPageChange={setCurrentPage}><Monitoring /></Layout>} />

        {/* Projects Navigation Flow (sem Layout) */}
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/:projectId/stages" element={<StagesView />} />
        <Route path="/projects/:projectId/stages/:stageId/tasks" element={<TasksList />} />
        <Route path="/projects/:projectId/stages/:stageId/tasks/:taskId" element={<TaskDetail />} />

        {/* Default - redirecionar baseado no role */}
        <Route
          path="/"
          element={
            profile?.role === 'user' ? (
              <Navigate to="/projects" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
