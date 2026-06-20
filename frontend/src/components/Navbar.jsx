import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, LayoutDashboard, CalendarRange, User, Package } from 'lucide-react';

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
    <header className="sticky top-0 z-50 px-4 md:px-8 py-4 pointer-events-none">
      <nav className="glass max-w-7xl mx-auto px-6 py-3.5 rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-lg shadow-slate-200/30 flex items-center justify-between pointer-events-auto transition-all duration-300">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="p-2 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-brand-500/20">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-brand-600 to-indigo-650 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            RentEase
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-100/80 border border-slate-200/50 p-1 rounded-xl">
          <Link
            to="/"
            className={`px-4.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
              isActive('/')
                ? 'text-white bg-gradient-to-r from-brand-600 to-indigo-600 shadow-md shadow-brand-500/10'
                : 'text-slate-650 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Browse Catalog
          </Link>
          
          {isAuthenticated && (
            <Link
              to="/my-rentals"
              className={`px-4.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-1.5 ${
                isActive('/my-rentals')
                  ? 'text-white bg-gradient-to-r from-brand-600 to-indigo-600 shadow-md shadow-brand-500/10'
                  : 'text-slate-655 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CalendarRange className="h-3.5 w-3.5" />
              <span>My Rentals</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center space-x-1.5 ${
                isActive('/admin')
                  ? 'text-brand-700 bg-brand-50 border border-brand-200 shadow'
                  : 'text-brand-600 hover:text-brand-700 hover:bg-brand-50/50'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* User / Cart Actions */}
        <div className="flex items-center space-x-3.5">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2.5 bg-slate-105 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-905 border border-slate-200/60 hover:border-slate-250 transition-all duration-200"
          >
            <ShoppingCart className="h-4.5 w-4.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-tr from-brand-500 to-indigo-500 text-white font-black text-[10px] h-4.5 w-4.5 flex items-center justify-center rounded-full shadow-md shadow-brand-500/30 scale-100 animate-pulse-glow">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Session */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2.5">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-none">{user.name}</span>
                <span className="text-[10px] text-slate-450 font-semibold tracking-wide uppercase mt-1 leading-none">{user.role}</span>
              </div>
              <div className="p-2 bg-brand-500/5 rounded-xl border border-brand-500/10 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-brand-500" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 bg-red-50 hover:bg-red-100 text-red-550 hover:text-red-650 border border-red-200 rounded-xl transition-all duration-200 flex items-center"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold tracking-wide text-slate-600 hover:text-slate-900 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4.5 py-2 text-xs font-bold tracking-wide bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 active:scale-95 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </nav>
    </header>
  );
};

export default Navbar;
