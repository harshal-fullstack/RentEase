import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, Settings, Menu, X, Home as HomeIcon, MapPin } from 'lucide-react';
import { API_URL } from '../config';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cities, setCities] = useState(['All']);
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('rentease_city') || 'All');

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/service-areas`);
        const data = await res.json();
        if (data.success && data.serviceAreas) {
          const activeCities = data.serviceAreas
            .filter((area) => area.isActive)
            .map((area) => area.cityName);
          
          if (!activeCities.includes('All')) {
            activeCities.unshift('All');
          }
          setCities(activeCities);
        }
      } catch (err) {
        console.error('Error fetching service areas:', err);
      }
    };
    fetchCities();
  }, []);

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    localStorage.setItem('rentease_city', city);
    
    if (location.pathname === '/catalog') {
      const searchParams = new URLSearchParams(location.search);
      if (city === 'All') {
        searchParams.delete('city');
      } else {
        searchParams.set('city', city);
      }
      navigate(`/catalog?${searchParams.toString()}`);
    } else {
      navigate(`/catalog?city=${city}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-white font-bold text-lg">RE</span>
              </div>
              <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-700 bg-clip-text text-transparent">
                RentEase
              </span>
            </Link>

            {/* City Selector */}
            <div className="flex items-center space-x-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-700 shadow-sm">
              <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer text-xs sm:text-sm text-gray-805"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'text-cyan-600 bg-cyan-50' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/catalog')
                  ? 'text-cyan-600 bg-cyan-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Catalog
            </Link>

            {isAuthenticated && (
              <Link
                to="/my-rentals"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/my-rentals')
                    ? 'text-cyan-600 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Rentals
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  isActive('/admin')
                    ? 'text-amber-600 bg-amber-50 border border-amber-200'
                    : 'text-gray-600 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all group"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-br from-cyan-500 to-teal-600 text-white font-bold text-xs h-6 w-6 flex items-center justify-center rounded-full shadow-md group-hover:scale-110 transition-transform">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Actions - Desktop */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-gray-900">{user?.name?.split(' ')[0]}</span>
                  <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/') 
                    ? 'text-cyan-600 bg-cyan-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/catalog')
                    ? 'text-cyan-600 bg-cyan-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Catalog
              </Link>

              {isAuthenticated && (
                <Link
                  to="/my-rentals"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/my-rentals')
                      ? 'text-cyan-600 bg-cyan-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  My Rentals
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/admin')
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Admin Dashboard
                </Link>
              )}

              <div className="border-t border-gray-200 pt-4 mt-4">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full btn btn-secondary btn-sm justify-center"
                  >
                    Sign Out
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block btn btn-secondary btn-sm justify-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block btn btn-primary btn-sm justify-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;