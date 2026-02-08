import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import LoginPage from './features/auth/LoginPage';
import CompanyDashboard from './features/dashboard/CompanyDashboard';
import ReviewQueuePage from './features/submissions/ReviewQueuePage';
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
import AccessDenied from './components/AccessDenied';
import AdminDashboardPage from './features/admin/AdminDashboardPage';
import UsersPage from './features/admin/UsersPage';
import CompaniesPage from './features/admin/CompaniesPage';
import AdminStationsPage from './features/admin/StationsPage';
import BulkForwardPage from './features/company/BulkForwardPage';
import AuditQueuePage from './features/oversight/AuditQueuePage';

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
        path="/company/:companyId"
        element={
          <ProtectedRoute>
            <CompanyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/:companyId/queue"
        element={
          <ProtectedRoute>
            <ReviewQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/queue"
        element={
          <ProtectedRoute>
            <ReviewQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/forward"
        element={
          <ProtectedRoute>
            <BulkForwardPage />
          </ProtectedRoute>
        }
      />
      {/* Customs Reviewer Routes */}
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
      {/* New Placeholder Routes */}
      <Route
        path="/audit/map"
        element={
          <ProtectedRoute>
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-aade-primary mb-2">Εθνικός Χάρτης</h2>
              <p className="text-gray-500 italic">Η λειτουργία του χάρτη βρίσκεται υπό κατασκευή.</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit/queue"
        element={
          <ProtectedRoute>
            <AuditQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/users"
        element={
          <ProtectedRoute>
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-aade-primary mb-2">Διαχείριση Χρηστών</h2>
              <p className="text-gray-500 italic">Η διαχείριση χρηστών βρίσκεται υπό κατασκευή.</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-aade-primary mb-2">Ρυθμίσεις Συστήματος</h2>
              <p className="text-gray-500 italic">Οι ρυθμίσεις συστήματος θα υλοποιηθούν σύντομα.</p>
            </div>
          </ProtectedRoute>
        }
      />
      {/* System Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/companies"
        element={
          <ProtectedRoute>
            <CompaniesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stations"
        element={
          <ProtectedRoute>
            <AdminStationsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/access-denied" element={<ProtectedRoute><AccessDenied /></ProtectedRoute>} />
      <Route path="*" element={<ProtectedRoute><AccessDenied /></ProtectedRoute>} />
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

