import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './components/auth/LoginPage';
import SchoolDashboard from './components/school/SchoolDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import HomePage from './components/common/HomePage';
import GetStartedPage from './components/common/GetStartedPage';
import RegisterInfoPage from './components/common/RegisterInfoPage';
import { UserType } from './types';
import ProtectedRoute from './components/common/ProtectedRoute';
import GuardDashboard from './components/guard/GuardDashboard';
import TeacherPortal from './components/teacher/TeacherPortal';
import BusDashboard from './components/bus/BusDashboard';
import AgentProfilePage from './components/common/AgentProfilePage';
import AcademicWorkDashboard from './components/academic/AcademicWorkDashboard';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // This function is for redirecting a user who is already logged in
  const getDashboardRedirect = () => {
    if (!user) return "/login"; // Should not happen if called correctly, but a safeguard.
    switch (user.type) {
      case UserType.School:
        return "/school";
      case UserType.Student:
        return "/student";
      case UserType.Guard:
        return "/guard";
      case UserType.Bus:
        return "/bus";
      case UserType.AcademicWork:
        return "/academic-work";
      case UserType.SuperAdmin:
        return "/portal-admin-console";
      default:
        return "/login";
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/get-started" element={<GetStartedPage />} />
      <Route path="/register-info" element={<RegisterInfoPage />} />
      <Route path="/teacher-portal" element={<TeacherPortal />} />
      <Route path="/agent/:agentId" element={<AgentProfilePage />} />
      <Route
        path="/login"
        element={
          !user ? <LoginPage /> : <Navigate to={getDashboardRedirect()} />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/school"
        element={
          <ProtectedRoute requiredUserType={UserType.School}>
            <SchoolDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredUserType={UserType.Student}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guard"
        element={
          <ProtectedRoute requiredUserType={UserType.Guard}>
            <GuardDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bus"
        element={
          <ProtectedRoute requiredUserType={UserType.Bus}>
            <BusDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic-work"
        element={
          <ProtectedRoute requiredUserType={UserType.AcademicWork}>
            <AcademicWorkDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal-admin-console"
        element={
          <ProtectedRoute requiredUserType={UserType.SuperAdmin}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <div className="min-h-screen bg-base-200 dark:bg-gray-900 text-neutral dark:text-gray-200">
            <AppRoutes />
          </div>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;