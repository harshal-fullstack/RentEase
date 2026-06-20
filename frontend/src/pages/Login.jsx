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
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 relative animate-slide-up">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="glass-premium p-8 rounded-3xl w-full max-w-md relative z-10 border border-slate-250/60 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-4.5 shadow-md">
            <LogIn className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 text-xs mt-1.5 font-semibold">Sign in to your RentEase dashboard</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-250 text-red-750 p-4.5 rounded-2xl text-xs flex items-start space-x-2 mb-6 shadow-sm">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="font-bold leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@rentease.com"
                className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-505 text-[10px] font-bold uppercase tracking-wider mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-slate-800 placeholder-slate-400 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold rounded-xl py-3.5 shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <span>Signing In...</span> : <span>Sign In</span>}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-slate-500 text-xs text-center mt-6.5 font-bold">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 hover:text-brand-555 font-extrabold underline decoration-brand-500/40 transition-colors">
            Sign up here
          </Link>
        </p>

        {/* Autofill Demo Helper */}
        <div className="mt-8 pt-6 border-t border-slate-150">
          <div className="flex items-center space-x-2.5 text-xs text-brand-700 bg-brand-50/60 border border-brand-200 p-3.5 rounded-xl shadow-sm">
            <Info className="h-4 w-4 shrink-0 text-brand-600" />
            <span className="font-bold text-[10px]">Autofill mock seed credentials for testing:</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3.5">
            <button
              onClick={() => handleAutofill('user')}
              className="py-2 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition-all duration-200"
            >
              Autofill User
            </button>
            <button
              onClick={() => handleAutofill('admin')}
              className="py-2 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl transition-all duration-200"
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
