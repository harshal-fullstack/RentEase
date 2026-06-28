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
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-16 relative animate-slide-up">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="bg-gradient-to-b from-[#111827]/70 to-[#0f172a]/95 p-8 md:p-10 rounded-3xl w-full max-w-md relative z-10 shadow-2xl border border-white/10 shadow-violet-950/10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="h-14 w-14 bg-violet-500/10 border border-violet-500/25 rounded-2xl flex items-center justify-center text-violet-400 mx-auto mb-5 shadow-lg shadow-violet-500/5 animate-bounce-slow">
            <LogIn className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-bold uppercase tracking-wider text-[10px]">Sign in to your RentEase dashboard</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/20 border border-red-500/30 text-red-400 p-4.5 rounded-2xl text-xs flex items-start space-x-2.5 mb-6 shadow-md">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="font-extrabold leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3.5" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-slate-450">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@rentease.com"
                className="w-full glass-input rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 text-sm focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3.5" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-slate-450">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 text-sm focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-xl py-3.5 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-widest"
          >
            {loading ? <span>Signing In...</span> : <span>Sign In</span>}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-slate-400 text-xs text-center mt-7.5 font-bold">
          Don't have an account?{' '}
          <Link to="/register" state={{ from: redirectPath }} className="text-violet-450 hover:text-violet-300 font-extrabold underline decoration-violet-550/40 transition-colors">
            Sign up here
          </Link>
        </p>

        {/* Autofill Demo Helper */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center space-x-2.5 text-xs text-violet-350 bg-violet-950/20 border border-violet-500/20 p-3.5 rounded-xl shadow-inner">
            <Info className="h-4 w-4 shrink-0 text-violet-400" />
            <span className="font-extrabold text-[9px] uppercase tracking-wider">Autofill mock seed credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => handleAutofill('user')}
              className="py-2.5 text-[9px] font-extrabold uppercase tracking-widest bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 rounded-xl transition-all duration-200"
            >
              Autofill User
            </button>
            <button
              onClick={() => handleAutofill('admin')}
              className="py-2.5 text-[9px] font-extrabold uppercase tracking-widest bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 rounded-xl transition-all duration-200"
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
