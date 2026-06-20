import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyRentals from './pages/MyRentals';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Wrapper (Requires standard customer login)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">Verifying session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

// Admin Route Wrapper (Requires administrator access)
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-400 text-sm">Verifying admin rights...</span>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-[#0b111e] flex flex-col justify-between text-gray-200">
            <div>
              <Navbar />
              <main>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Catalog />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Customer only protected routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-rentals"
                    element={
                      <ProtectedRoute>
                        <MyRentals />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin only protected routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />

                  {/* Fallback redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
            
            {/* Footer */}
            <footer className="py-8 mt-16 border-t border-white/5 bg-[#070b14] text-center text-xs text-gray-500">
              <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span>© {new Date().getFullYear()} RentEase Platform Inc. All rights reserved.</span>
                <div className="flex space-x-4">
                  <Link to="/catalog" className="hover:text-white transition-colors">Catalog</Link>
                  <span>•</span>
                  <span className="text-brand-400 font-semibold">Simulated Development Environment</span>
                </div>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
