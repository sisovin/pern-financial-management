import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Transactions from './pages/dashboard/Transactions';
import UserSettings from './pages/settings/UserSettings';
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './hooks/useAuth';

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Transactions />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <UserSettings />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Redirect to login or dashboard based on auth status */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      
      {/* Fallback for unknown routes */}
      <Route path="*" element={<div className="text-center p-8">Page not found</div>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="app-container min-h-screen bg-background text-text">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;