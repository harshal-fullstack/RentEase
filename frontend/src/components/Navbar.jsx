import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, LayoutDashboard, CalendarRange, User, Package, Hammer } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 shadow-xl border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-brand-500/20">
            <Package className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-brand-400 bg-clip-text text-transparent">
            RentEase
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
          <Link
            to="/catalog"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isActive('/catalog')
                ? 'text-white bg-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Browse Catalog
          </Link>
          
          {isAuthenticated && (
            <Link
              to="/my-rentals"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                isActive('/my-rentals')
                  ? 'text-white bg-white/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarRange className="h-4 w-4 mr-1" />
              <span>My Rentals</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-lg text-sm font-medium text-brand-300 hover:text-white hover:bg-brand-500/10 border border-brand-500/20 transition-all duration-200 flex items-center space-x-1 ${
                isActive('/admin') ? 'bg-brand-500/20 text-white border-brand-500/40' : ''
              }`}
            >
              <LayoutDashboard className="h-4 w-4 mr-1" />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </div>

        {/* User / Cart Actions */}
        <div className="flex items-center space-x-4">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2.5 bg-slate-800/50 hover:bg-slate-700/60 rounded-xl text-gray-300 hover:text-white border border-slate-700/30 transition-all duration-200"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-tr from-brand-500 to-indigo-500 text-white font-bold text-xs h-5 w-5 flex items-center justify-center rounded-full scale-100 animate-pulse-glow shadow-md shadow-brand-500/30">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Session */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-gray-400 capitalize">{user.role}</span>
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/30 flex items-center justify-center">
                <User className="h-4 w-4 text-brand-400" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 hover:text-red-300 border border-red-500/10 rounded-xl transition-all duration-200 flex items-center"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 transform active:scale-95 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
