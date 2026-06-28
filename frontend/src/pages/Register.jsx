import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
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
    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const result = await register(name, email, password, role);
    setLoading(false);

    if (result.success) {
      navigate(redirectPath);
    } else {
      setErrorMsg(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-16 relative animate-slide-up">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="bg-gradient-to-b from-[#111827]/70 to-[#0f172a]/95 p-8 md:p-10 rounded-3xl w-full max-w-md relative z-10 shadow-2xl border border-white/10 shadow-violet-950/10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="h-14 w-14 bg-violet-500/10 border border-violet-500/25 rounded-2xl flex items-center justify-center text-violet-400 mx-auto mb-5 shadow-lg shadow-violet-500/5 animate-bounce-slow">
            <UserPlus className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-bold uppercase tracking-wider text-[10px]">Get started with flexible premium rentals</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-955/20 border border-red-500/30 text-red-400 p-4.5 rounded-2xl text-xs flex items-start space-x-2.5 mb-6 shadow-md">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span className="font-extrabold leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-slate-450">
                <User className="h-4 w-4" />
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full glass-input rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 text-sm focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="email">
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
                placeholder="jane@example.com"
                className="w-full glass-input rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 text-sm focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="password">
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
                placeholder="Min 6 characters"
                className="w-full glass-input rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 text-sm focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          {/* Account Type - Dev Only Helper */}
          <div>
            <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-3" htmlFor="role">
              Account Type <span className="text-violet-400 font-bold">(Dev Option)</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#0f172a] border border-white/15 rounded-xl py-3 px-4.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="user" className="bg-[#0f172a] text-white">Standard User (Customer)</option>
              <option value="admin" className="bg-[#0f172a] text-white">Administrator (Manager)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold rounded-xl py-3.5 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-widest"
            >
              {loading ? <span>Creating Account...</span> : <span>Create Account</span>}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <p className="text-slate-400 text-xs text-center mt-7.5 font-bold">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-455 hover:text-violet-300 font-extrabold underline decoration-violet-550/40 transition-colors">
            Sign in here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
