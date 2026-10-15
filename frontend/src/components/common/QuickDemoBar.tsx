import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  UtensilsCrossed, 
  ChefHat, 
  BrainCircuit, 
  Home, 
  ChevronUp, 
  ChevronDown,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const QuickDemoBar: React.FC = () => {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOwnerClick = async (targetPath = '/dashboard') => {
    if (user) {
      navigate(targetPath);
      return;
    }
    setLoading(true);
    try {
      await loginAsDemo();
      navigate(targetPath);
    } catch (e) {
      console.error('Quick demo login error', e);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#102C25] text-[#C6A66A] shadow-2xl border border-[#C6A66A]/40 hover:bg-[#173D32] transition-all text-xs font-semibold"
        >
          <Sparkles className="w-4 h-4 animate-spin text-[#C6A66A]" />
          <span>⚡ Demo Quick Switcher</span>
          <ChevronUp className="w-3.5 h-3.5 text-white/70" />
        </button>
      </div>
    );
  }

  const isQrMenu = location.pathname.startsWith('/m/');
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <aside aria-label="Demo Navigation Bar" className="sticky top-0 z-50 bg-[#102C25] text-white border-b border-[#C6A66A]/30 shadow-md px-3 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        
        {/* Left Badge */}
        <div className="flex items-center space-x-2">
          <span className="flex items-center px-2.5 py-0.5 rounded-full bg-[#C6A66A]/20 text-[#C6A66A] text-[11px] font-bold tracking-wider uppercase border border-[#C6A66A]/40">
            <Sparkles className="w-3 h-3 mr-1" />
            1-Click Demo
          </span>
          <span className="hidden md:inline text-xs text-stone-300 font-medium">
            Switch View Instantly:
          </span>
        </div>

        {/* Center: Easy Quick-Switch Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          
          {/* Customer View */}
          <button
            onClick={() => navigate('/m/the-royal-saffron')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isQrMenu 
                ? 'bg-[#C6A66A] text-[#102C25] font-bold shadow-sm' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#C6A66A]" />
            <span>📱 Customer QR Menu</span>
            {isQrMenu && <Check className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Owner Dashboard */}
          <button
            disabled={loading}
            onClick={() => handleOwnerClick('/dashboard')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isDashboard && location.pathname === '/dashboard'
                ? 'bg-[#C6A66A] text-[#102C25] font-bold shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>👑 Owner Dashboard</span>
            {loading && <span className="animate-pulse text-[10px]">...</span>}
          </button>

          {/* Kitchen Orders */}
          <button
            disabled={loading}
            onClick={() => handleOwnerClick('/dashboard/orders')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              location.pathname === '/dashboard/orders'
                ? 'bg-[#C6A66A] text-[#102C25] font-bold shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-300" />
            <span>👨‍🍳 Kitchen Orders</span>
          </button>

          {/* AI Action Center */}
          <button
            disabled={loading}
            onClick={() => handleOwnerClick('/dashboard/actions')}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              location.pathname === '/dashboard/actions'
                ? 'bg-[#C6A66A] text-[#102C25] font-bold shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5 text-purple-300" />
            <span>⚡ AI Action Engine</span>
          </button>

          {/* Home Link */}
          <button
            onClick={() => navigate('/')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              location.pathname === '/' 
                ? 'bg-[#C6A66A] text-[#102C25] font-bold' 
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          {user && (
            <span className="hidden lg:inline text-[11px] text-stone-300">
              Logged in: <strong className="text-white">{user.full_name || 'Owner'}</strong>
            </span>
          )}
          <button
            onClick={() => setIsMinimized(true)}
            title="Minimize demo bar"
            className="p-1 rounded text-stone-400 hover:text-white hover:bg-white/10 text-xs"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

      </div>
    </aside>
  );
};
