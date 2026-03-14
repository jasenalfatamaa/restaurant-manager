import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Welcome from './pages/customer/Welcome';
import Menu from './pages/customer/Menu';
import Checkout from './pages/customer/Checkout';
import OrderStatus from './pages/customer/OrderStatus.tsx';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Kitchen from './pages/admin/Kitchen';
import POS from './pages/admin/POS';
import Tables from './pages/admin/Tables';
import MenuManagement from './pages/admin/MenuManagement';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import { Role } from './types';

// Role Based Route Protection
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: Role[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="h-screen flex items-center justify-center text-forest">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === 'cashier') return <Navigate to="/admin/pos" />;
    if (user.role === 'kitchen') return <Navigate to="/admin/kitchen" />;
    return <Navigate to="/admin/dashboard" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-status" element={<OrderStatus />} />

            {/* Admin Auth */}
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<RoleBasedRedirect />} />
              <Route path="dashboard" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><Dashboard /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><Reports /></ProtectedRoute>} />
              <Route path="menu-management" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><MenuManagement /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute allowedRoles={['manager', 'admin']}><Settings /></ProtectedRoute>} />
              <Route path="kitchen" element={<ProtectedRoute allowedRoles={['manager', 'admin', 'kitchen']}><Kitchen /></ProtectedRoute>} />
              <Route path="pos" element={<ProtectedRoute allowedRoles={['manager', 'admin', 'cashier']}><POS /></ProtectedRoute>} />
              <Route path="tables" element={<ProtectedRoute allowedRoles={['manager', 'admin', 'cashier']}><Tables /></ProtectedRoute>} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Helper component to redirect root /admin to appropriate subpage
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'cashier') return <Navigate to="/admin/pos" />;
  if (user.role === 'kitchen') return <Navigate to="/admin/kitchen" />;
  return <Navigate to="/admin/dashboard" />;
}

export default App;
