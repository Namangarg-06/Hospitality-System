import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('owner@dineai.com');
    setPassword('DineAI@2026');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 group">
          <div className="w-12 h-12 rounded-xl bg-[#173D32] flex items-center justify-center text-[#C6A66A] shadow-luxury">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#173D32]">
          Sign in to NG DineAI
        </h2>
        <p className="mt-1 text-sm text-[#737B73]">
          Hospitality Intelligence & Operations Suite
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E7E4DC] shadow-luxury space-y-5">
          
          {/* 1-Click Instant Demo Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleInstantLogin}
            className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl text-sm font-bold text-[#102C25] bg-gradient-to-r from-[#C6A66A] to-[#DCB980] hover:brightness-105 shadow-md hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#102C25]" />
            <span>⚡ 1-Click Instant Demo Login (Owner)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-3 text-stone-400 text-xs font-semibold uppercase tracking-wider">Or Sign In Manually</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          {/* Quick Demo Fill Pill */}
          <div className="p-3 rounded-xl bg-[#FAF6ED] border border-[#DCB980]/50 flex items-center justify-between">
            <div className="text-xs text-[#737B73]">
              <span className="font-semibold text-[#8C6F3B]">Demo credentials:</span> owner@dineai.com / DineAI@2026
            </div>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="ml-2 shrink-0 px-2.5 py-1 text-xs font-semibold rounded bg-[#173D32] text-white hover:bg-[#102C25] transition-colors"
            >
              Auto-Fill
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#202722] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737B73]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@restaurant.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-[#E7E4DC] bg-white text-[#202722] focus:outline-none focus:ring-2 focus:ring-[#173D32] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#202722] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737B73]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-[#E7E4DC] bg-white text-[#202722] focus:outline-none focus:ring-2 focus:ring-[#173D32] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#173D32] hover:bg-[#102C25] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#173D32] shadow-luxury transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#E7E4DC] text-center text-xs text-[#737B73]">
            <span>Don't have a restaurant workspace? </span>
            <Link to="/register" className="font-semibold text-[#173D32] hover:underline">
              Create New Workspace
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
