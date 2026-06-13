import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Info } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(redirectPath);
    } else {
      setErrorMsg(result.message || 'Invalid email or password');
    }
  };

  const handleAutofill = (type) => {
    if (type === 'user') {
      setEmail('user@rentease.com');
      setPassword('user123');
    } else {
      setEmail('admin@rentease.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="glass-premium p-8 rounded-3xl w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 mx-auto mb-4">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to your RentEase dashboard</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start space-x-2 mb-6">
            <AlertCircle className="h-5 w-5 mr-1 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@rentease.com"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 text-sm focus:border-brand-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 text-sm focus:border-brand-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-3 shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <span>Signing In...</span> : <span>Sign In</span>}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-gray-400 text-xs text-center mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold underline decoration-brand-500/50">
            Sign up here
          </Link>
        </p>

        {/* Autofill Demo Helper */}
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center space-x-2 text-xs text-brand-300 bg-brand-950/20 border border-brand-500/10 p-3.5 rounded-xl">
            <Info className="h-4 w-4 shrink-0" />
            <span>Click below to autofill mock seed credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              onClick={() => handleAutofill('user')}
              className="py-2 text-xs font-semibold bg-slate-800/40 hover:bg-slate-800/80 text-gray-300 border border-slate-700/50 rounded-lg transition-colors duration-200"
            >
              Autofill User
            </button>
            <button
              onClick={() => handleAutofill('admin')}
              className="py-2 text-xs font-semibold bg-slate-800/40 hover:bg-slate-800/80 text-gray-300 border border-slate-700/50 rounded-lg transition-colors duration-200"
            >
              Autofill Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
