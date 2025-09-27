import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Shop from './pages/Shop';
import OrderViewer from './pages/OrderViewer';
import Home from './pages/Home';
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

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Composant pour les routes admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Composant principal de l'application
const AppContent = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                      location.pathname === '/dashboard' || 
                      location.pathname === '/categories' || 
                      location.pathname === '/products' || 
                      location.pathname === '/stock' || 
                      location.pathname === '/statistics' || 
                      location.pathname === '/sales' || 
                      location.pathname === '/exports' || 
                      location.pathname === '/loyal-customers' || 
                      location.pathname === '/online-orders' || 
                      location.pathname === '/users' || 
                      location.pathname === '/user-management' || 
                      location.pathname === '/profile' || 
                      location.pathname === '/settings' || 
                      location.pathname === '/change-password';

  return (
    <div className="App">
      {user && isAdminRoute && <ModernSidebar />}
      <main className={user && isAdminRoute ? 'main-content' : ''}>
        <Routes>
          {/* Routes publiques - Interface séparée */}
          <Route path="/" element={<PublicHome />} />
          <Route path="/order" element={<OrderViewer />} />
          
          {/* Ancienne interface publique (gardée pour compatibilité) */}
          <Route path="/old-shop" element={<ModernShop />} />
          
          {/* Routes livreurs */}
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
          
          {/* Routes d'authentification admin */}
          <Route 
            path="/admin/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route path="/admin/password-reset" element={<PasswordReset />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          
          {/* Routes protégées */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stock" 
            element={
              <ProtectedRoute>
                <Stock />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/statistics" 
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sales" 
            element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/loyal-customers" 
            element={
              <ProtectedRoute>
                <LoyalCustomers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/online-orders" 
            element={
              <ProtectedRoute>
                <OnlineOrders />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/exports" 
            element={
              <ProtectedRoute>
                <Exports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user-management" 
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/change-password" 
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

// Composant racine avec le contexte d'authentification
const App = () => {
  return (
    <AuthProvider>
      <CompanyProvider>
        <Router basename={process.env.PUBLIC_URL}>
          <AppContent />
        </Router>
      </CompanyProvider>
    </AuthProvider>
  );
};

export default App;
