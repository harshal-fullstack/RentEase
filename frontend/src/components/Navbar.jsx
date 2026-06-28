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
    <header className="sticky top-0 z-50 px-4 md:px-8 py-5 pointer-events-none">
      <nav className="max-w-7xl mx-auto px-6 py-3 rounded-2xl md:rounded-2xl border border-white/10 bg-[#0f172a]/70 backdrop-blur-md shadow-2xl shadow-slate-950/50 flex items-center justify-between pointer-events-auto transition-all duration-350 hover:border-white/15">
        
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="p-2.5 bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 rounded-xl group-hover:scale-105 group-hover:rotate-3 transition-all duration-350 shadow-md shadow-violet-500/10">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-violet-300 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity font-display">
            RentEase
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-950/60 border border-white/5 p-1 rounded-xl">
          <Link
            to="/catalog"
            className={`px-4.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-350 ${
              isActive('/catalog')
                ? 'text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Browse Catalog
          </Link>
          
          {isAuthenticated && (
            <Link
              to="/my-rentals"
              className={`px-4.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-350 flex items-center space-x-1.5 ${
                isActive('/my-rentals')
                  ? 'text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CalendarRange className="h-3.5 w-3.5" />
              <span>My Rentals</span>
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4.5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-350 flex items-center space-x-1.5 ${
                isActive('/admin')
                  ? 'text-violet-300 bg-violet-500/10 border border-violet-500/20'
                  : 'text-violet-400 hover:text-violet-300 hover:bg-violet-500/5'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* User / Cart Actions */}
        <div className="flex items-center space-x-3">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2.5 bg-white/5 hover:bg-white/10 hover:scale-105 rounded-xl text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all duration-350 shadow-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-tr from-violet-500 to-indigo-500 text-white font-black text-[9px] h-4.5 w-4.5 flex items-center justify-center rounded-full shadow-md shadow-violet-500/40 animate-pulse-glow">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Session */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <div className="hidden lg:flex flex-col text-right pr-1">
                <span className="text-xs font-extrabold text-slate-100 leading-none">{user.name}</span>
                <span className="text-[9px] text-violet-400 font-bold tracking-wider uppercase mt-1 leading-none">{user.role}</span>
              </div>
              <div className="p-2 bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 rounded-xl border border-violet-500/25 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 bg-red-950/10 hover:bg-red-950/30 text-red-400 hover:text-red-300 border border-red-950/20 hover:border-red-500/20 rounded-xl transition-all duration-300 flex items-center shadow-sm hover:scale-105"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold tracking-wide text-slate-300 hover:text-white transition-all duration-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-extrabold tracking-wide bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all duration-300"
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
