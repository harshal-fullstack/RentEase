import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, AlertCircle, Info } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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
      navigate('/');
    } else {
      setErrorMsg(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="glass-premium p-8 rounded-3xl w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-center text-brand-400 mx-auto mb-4">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="text-gray-400 text-sm mt-1">Get started with flexible rentals</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-950/30 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start space-x-2 mb-6">
            <AlertCircle className="h-5 w-5 mr-1 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <User className="h-4 w-4" />
              </span>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 text-sm focus:border-brand-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>

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
                placeholder="jane@example.com"
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
                placeholder="Min 6 characters"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 text-sm focus:border-brand-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>

          {/* Account Type - Dev Only Helper */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1.5" htmlFor="role">
              Account Type <span className="text-brand-400 text-xs">(Dev Option)</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-3 px-4 text-white text-sm focus:border-brand-500 focus:outline-none transition-colors duration-200"
            >
              <option value="user">Standard User (Customer)</option>
              <option value="admin">Administrator (Manager)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-3 shadow-lg shadow-brand-500/15 hover:shadow-brand-500/25 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? <span>Creating Account...</span> : <span>Create Account</span>}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <p className="text-gray-400 text-xs text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold underline decoration-brand-500/50">
            Sign in here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
