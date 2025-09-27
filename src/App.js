import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import ModernSidebar from './components/ModernSidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Users from './pages/Users';
import Profile from './pages/Profile';
import OrderViewer from './pages/OrderViewer';
import PasswordReset from './pages/PasswordReset';
import ChangePassword from './pages/ChangePassword';
import Statistics from './pages/Statistics';
import Sales from './pages/Sales';
import Exports from './pages/Exports';
import Settings from './pages/Settings';
import LoyalCustomers from './pages/LoyalCustomers';
import OnlineOrders from './pages/OnlineOrders';
import ModernShop from './pages/ModernShop';
import PublicHome from './pages/PublicHome';
import DeliveryLogin from './pages/DeliveryLogin';
import DeliveryDashboard from './pages/DeliveryDashboard';
import UserManagement from './pages/UserManagement';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Routes protégées
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

// Routes admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

// Contenu principal
const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin') ||
    [
      '/dashboard','/categories','/products','/stock','/statistics','/sales',
      '/exports','/loyal-customers','/online-orders','/users','/user-management',
      '/profile','/settings','/change-password'
    ].includes(location.pathname);

  return (
    <div className="App">
      {user && isAdminRoute && <ModernSidebar />}
      <main className={user && isAdminRoute ? 'main-content' : ''}>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/order" element={<OrderViewer />} />
          <Route path="/old-shop" element={<ModernShop />} />

          {/* Routes livreurs */}
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />

          {/* Authentification */}
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/admin/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/admin/password-reset" element={<PasswordReset />} />

          {/* Routes protégées */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/loyal-customers" element={<ProtectedRoute><LoyalCustomers /></ProtectedRoute>} />
          <Route path="/online-orders" element={<ProtectedRoute><OnlineOrders /></ProtectedRoute>} />
          <Route path="/exports" element={<ProtectedRoute><Exports /></ProtectedRoute>} />
          <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        </Routes>
      </main>

      <ToastContainer position="top-right" autoClose={5000} theme="light" />
    </div>
  );
};

// Composant racine
const App = () => {
  return (
    <AuthProvider>
      <CompanyProvider>
        <Router>
          <AppContent />
        </Router>
      </CompanyProvider>
    </AuthProvider>
  );
};

export default App;
