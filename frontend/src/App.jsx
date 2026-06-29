import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-cyan-500 border-r-cyan-500 animate-spin"></div>
        </div>
        <span className="text-gray-500 text-sm">Verifying session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-cyan-500 border-r-cyan-500 animate-spin"></div>
        </div>
        <span className="text-gray-500 text-sm">Verifying admin rights...</span>
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
          <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
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

                {/* Admin routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Premium Footer */}
            <footer className="bg-white border-t border-gray-200 mt-24">
              <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-5 gap-8 mb-12">
                  {/* Brand */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">RE</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">RentEase</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Premium furniture and appliances on your terms. Rent, extend, or return whenever you want.
                    </p>
                  </div>

                  {/* Links */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Product</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><a href="/catalog" className="hover:text-cyan-600 transition">Browse</a></li>
                      <li><a href="/" className="hover:text-cyan-600 transition">How It Works</a></li>
                      <li><a href="/catalog?category=Furniture" className="hover:text-cyan-600 transition">Furniture</a></li>
                      <li><a href="/catalog?category=Appliances" className="hover:text-cyan-600 transition">Appliances</a></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Support</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><a href="/" className="hover:text-cyan-600 transition">Contact</a></li>
                      <li><a href="/" className="hover:text-cyan-600 transition">FAQ</a></li>
                      <li><a href="/" className="hover:text-cyan-600 transition">Returns</a></li>
                      <li><a href="/" className="hover:text-cyan-600 transition">Track Order</a></li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Legal</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><a href="/" className="hover:text-cyan-600 transition">Privacy</a></li>
                      <li><a href="/" className="hover:text-cyan-600 transition">Terms</a></li>
                      <li><a href="/" className="hover:text-cyan-600 transition">Cookies</a></li>
                    </ul>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between">
                  <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} RentEase Platform. All rights reserved.
                  </p>
                  <p className="text-gray-500 text-sm mt-4 md:mt-0">
                    Made with care for flexible living ✨
                  </p>
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