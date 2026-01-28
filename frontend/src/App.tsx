import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import CompanyDashboard from './features/dashboard/CompanyDashboard';
import CustomsDashboard from './features/dashboard/CustomsDashboard';
import StationDashboard from './features/dashboard/StationDashboard';
import StationHistory from './features/dashboard/StationHistory';
import StationTasks from './features/tasks/StationTasks';
import StationsPage from './features/stations/StationsPage';
import StationDetailPage from './features/stations/StationDetailPage';
import SubmissionsPage from './features/submissions/SubmissionsPage';
import SubmissionDetailPage from './features/submissions/SubmissionDetailPage';
import CreateSubmissionPage from './features/submissions/CreateSubmissionPage';
import TasksPage from './features/tasks/TasksPage';
import TaskDetailPage from './features/tasks/TaskDetailPage';
import CreateTaskPage from './features/tasks/CreateTaskPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role.startsWith('COMPANY_') ? <CompanyDashboard /> :
              user?.role === 'STATION_OPERATOR' ? <StationDashboard /> :
                <CustomsDashboard />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/history"
        element={
          <ProtectedRoute>
            <StationHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/tasks"
        element={
          <ProtectedRoute>
            <StationTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies/:companyId/dashboard"
        element={
          <ProtectedRoute>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stations"
        element={
          <ProtectedRoute>
            <StationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stations/:id"
        element={
          <ProtectedRoute>
            <StationDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submissions"
        element={
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submissions/new"
        element={
          <ProtectedRoute>
            <CreateSubmissionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submissions/:id"
        element={
          <ProtectedRoute>
            <SubmissionDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/new"
        element={
          <ProtectedRoute>
            <CreateTaskPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks/:id"
        element={
          <ProtectedRoute>
            <TaskDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes >
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}



export default App;

