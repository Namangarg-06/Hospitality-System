import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowRight, Building, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantType, setRestaurantType] = useState('Fine Dining');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
        restaurant_name: restaurantName,
        restaurant_type: restaurantType,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
          Create Restaurant Workspace
        </h2>
        <p className="mt-1 text-sm text-[#737B73]">
          Start managing your dining operations with NG DineAI
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#E7E4DC] shadow-luxury space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#202722] mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737B73]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-[#E7E4DC] bg-white text-[#202722] focus:outline-none focus:ring-2 focus:ring-[#173D32] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#202722] mb-1.5">
                Work Email Address
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
                  placeholder="gm@restaurant.com"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-[#E7E4DC] bg-white text-[#202722] focus:outline-none focus:ring-2 focus:ring-[#173D32] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#202722] mb-1.5">
                Restaurant Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737B73]">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g. The Saffron Lounge"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-[#E7E4DC] bg-white text-[#202722] focus:outline-none focus:ring-2 focus:ring-[#173D32] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#202722] mb-1.5">
                Establishment Type
              </label>
              <select
                value={restaurantType}
                onChange={(e) => setRestaurantType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#E7E4DC] bg-white text-[#202722] focus:outline-none focus:ring-2 focus:ring-[#173D32] focus:border-transparent transition-all"
              >
                <option value="Fine Dining">Fine Dining & Contemporary</option>
                <option value="Boutique Cafe">Boutique Cafe & Bistro</option>
                <option value="Hotel Dining">Hotel & Resort Outlet</option>
                <option value="Cloud Kitchen">Cloud Kitchen / Delivery Hub</option>
                <option value="Chain Restaurant">Multi-Outlet Dining Chain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#202722] mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737B73]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-[#E7E4DC] bg-white text-[#202722] focus:outline-none focus:ring-2 focus:ring-[#173D32] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#173D32] hover:bg-[#102C25] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#173D32] shadow-luxury transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Workspace...' : 'Initialize Restaurant Workspace'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#E7E4DC] text-center text-xs text-[#737B73]">
            <span>Already registered? </span>
            <Link to="/login" className="font-semibold text-[#173D32] hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
