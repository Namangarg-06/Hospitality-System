import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  MessageSquareQuote,
  BarChart3,
  Trash2,
  Sparkles,
  Settings,
  QrCode,
  LogOut,
  Bell,
  ChevronDown,
  Building2,
  AlertTriangle,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const DashboardLayout: React.FC = () => {
  const { user, workspace, role, logout, isDemoMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openActionCount, setOpenActionCount] = useState<number>(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<any[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Fetch quick notification counts & user accessible workspaces
    const fetchCounters = async () => {
      try {
        const [actions, orders, me] = await Promise.all([
          api.getActionInsights().catch(() => []),
          api.getOrders('PENDING').catch(() => []),
          api.getMe().catch(() => ({ workspaces: [] }))
        ]);
        const openInsights = (actions || []).filter((a: any) => a.status === 'OPEN');
        setOpenActionCount(openInsights.length);
        setPendingOrdersCount((orders || []).length);
        if (me?.workspaces) {
          setAvailableWorkspaces(me.workspaces);
        }
      } catch (e) {
        // graceful silence
      }
    };
    fetchCounters();
    const interval = setInterval(fetchCounters, 20000); // 20s poll for live kitchen alerts
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Executive Overview', path: '/dashboard', icon: LayoutDashboard, subtitle: 'Summary & Revenue' },
    { name: 'AI Menu Studio', path: '/dashboard/menu', icon: UtensilsCrossed, subtitle: 'Dishes, Rates & Standee' },
    {
      name: 'Kitchen Orders',
      path: '/dashboard/orders',
      icon: ShoppingBag,
      subtitle: 'Live Food Tickets',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: 'bg-red-500 text-white'
    },
    { name: 'Review Intelligence', path: '/dashboard/reviews', icon: MessageSquareQuote, subtitle: 'Customer Feedback & AI' },
    { name: 'Sales Analytics', path: '/dashboard/analytics', icon: BarChart3, subtitle: 'Kamai & Trends' },
    { name: 'Food Waste Intel', path: '/dashboard/waste', icon: Trash2, subtitle: 'Kitchen Waste Control' },
    {
      name: 'AI Action Engine',
      path: '/dashboard/actions',
      icon: Sparkles,
      subtitle: 'Smart Sujhav',
      badge: openActionCount > 0 ? openActionCount : undefined,
      badgeColor: 'bg-[#C6A66A] text-[#102C25] font-bold'
    },
    { name: 'Workspace Settings', path: '/dashboard/settings', icon: Settings, subtitle: 'Restaurant Profile' },
  ];

  const handleResetDemoData = async () => {
    if (!confirm('Re-seed authentic synthetic records for The Royal Saffron? This will refresh all demo orders, reviews, and menu items.')) return;
    setIsResetting(true);
    try {
      await api.resetDemoData();
      window.location.reload();
    } catch (e) {
      alert('Failed to reset demo data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-[#102C25] text-[#EFECE2] border-r border-[#173D32] shrink-0">
        
        {/* Brand Banner */}
        <div className="h-20 flex items-center px-6 border-b border-[#173D32] justify-between">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#C6A66A] flex items-center justify-center text-[#102C25] font-bold shadow-subtle">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                NG Dine<span className="text-[#C6A66A]">AI</span>
              </span>
              <p className="text-[10px] tracking-widest uppercase text-[#C5D7CC]">
                Operations Suite
              </p>
            </div>
          </Link>
        </div>

        {/* Workspace Switcher Card */}
        <div className="p-3.5 mx-3 my-2 rounded-xl bg-[#173D32]/70 border border-[#2A6354]/40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#2A6354] flex items-center justify-center text-[#C6A66A] shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {workspace?.name || 'The Royal Saffron'}
              </p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] text-[#C5D7CC] uppercase tracking-wider font-medium">
                  {role} Access
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Restaurant Switcher Dropdown */}
          {availableWorkspaces.length > 1 && (
            <div className="mt-2.5 pt-2 border-t border-[#2A6354]/40">
              <label className="block text-[10px] text-[#C5D7CC] mb-1 font-medium">
                Switch Active Restaurant:
              </label>
              <select
                value={workspace?.id?.toString()}
                onChange={(e) => {
                  localStorage.setItem('dineai_workspace_id', e.target.value);
                  window.location.reload();
                }}
                className="w-full px-2 py-1 bg-[#102C25] text-white text-[11px] font-medium rounded border border-[#2A6354] focus:outline-none"
              >
                {availableWorkspaces.map((ws) => (
                  <option key={ws.workspace_id} value={ws.workspace_id.toString()}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Public QR Menu Link */}
          {workspace?.slug && (
            <div className="mt-2 pt-2 border-t border-[#2A6354]/50 flex items-center justify-between">
              <Link
                to={`/m/${workspace.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#DCB980] hover:text-white flex items-center font-medium transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5" />
                Live Customer QR
              </Link>
              <ExternalLink className="w-3 h-3 text-[#C5D7CC]" />
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#173D32] text-[#DCB980] shadow-sm border border-[#2A6354]/60'
                    : 'text-[#C5D7CC] hover:bg-[#173D32]/50 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C6A66A]' : 'text-[#C5D7CC]'}`} />
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold leading-tight truncate">{item.name}</span>
                    <span className="block text-[10px] text-stone-400 font-normal leading-tight truncate">{item.subtitle}</span>
                  </div>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${item.badgeColor || 'bg-brand-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Create Any Restro QR Button */}
          <div className="pt-2 px-1">
            <Link
              to="/qr-generator"
              className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-[#102C25] bg-gradient-to-r from-[#C6A66A] to-[#DCB980] hover:brightness-105 shadow-sm transition-all"
            >
              <QrCode className="w-4 h-4 text-[#102C25] shrink-0" />
              <span>🖨️ Create Any Restro QR</span>
            </Link>
          </div>
        </nav>

        {/* Demo Mode & User Footer */}
        <div className="p-4 border-t border-[#173D32] space-y-3">
          {isDemoMode && (
            <div className="p-2.5 rounded-lg bg-[#FAF6ED]/10 border border-[#C6A66A]/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#DCB980] flex items-center">
                  <Sparkles className="w-3 h-3 mr-1 text-[#C6A66A]" /> Demo Mode Active
                </span>
                <button
                  onClick={handleResetDemoData}
                  disabled={isResetting}
                  title="Reload default demo dataset"
                  className="text-[10px] text-[#C5D7CC] hover:text-white flex items-center"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isResetting ? 'animate-spin' : ''}`} />
                  Reset
                </button>
              </div>
              <p className="text-[10px] text-[#C5D7CC] mt-1 leading-snug">
                Operating with synthetic scenario data for The Royal Saffron.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#C6A66A] text-[#102C25] font-bold text-xs flex items-center justify-center">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-[#C5D7CC] truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#C5D7CC] hover:text-white hover:bg-[#173D32] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-[#E7E4DC] flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#202722] hover:bg-[#F8F6F0]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-serif font-bold text-[#173D32]">
              {workspace?.name || 'The Royal Saffron'}
            </h1>
            {isDemoMode && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                Synthetic Demo Mode
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Action Alert Bell */}
            <Link
              to="/dashboard/actions"
              className="relative p-2 rounded-lg text-[#737B73] hover:text-[#173D32] hover:bg-[#F8F6F0] transition-colors"
              title="Operational Action Alerts"
            >
              <Bell className="w-5 h-5" />
              {openActionCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </Link>

            {/* Create Restro QR Button */}
            <Link
              to="/qr-generator"
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#C6A66A] to-[#DCB980] text-[#102C25] hover:brightness-105 shadow-xs transition-all"
            >
              <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#102C25]" />
              <span>🖨️ Create Restro QR</span>
            </Link>

            {/* Live QR Menu Button */}
            {workspace?.slug && (
              <Link
                to={`/m/${workspace.slug}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FAF6ED] text-[#173D32] border border-[#DCB980] hover:bg-[#F4ECD8] transition-colors shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#C6A66A]" />
                Customer QR Menu
                <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
              </Link>
            )}
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <Outlet />
        </main>

      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-72 max-w-xs bg-[#102C25] text-white flex flex-col h-full z-10">
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#173D32]">
              <span className="font-serif text-lg font-bold">NG DineAI</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-[#C5D7CC]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === item.path ? 'bg-[#173D32] text-[#DCB980]' : 'text-[#C5D7CC]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="block text-xs font-semibold">{item.name}</span>
                      <span className="block text-[10px] text-stone-400">{item.subtitle}</span>
                    </div>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${item.badgeColor || 'bg-brand-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}

              <div className="pt-2">
                <Link
                  to="/qr-generator"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-[#102C25] bg-gradient-to-r from-[#C6A66A] to-[#DCB980]"
                >
                  <QrCode className="w-4 h-4 text-[#102C25]" />
                  <span>🖨️ Create Any Restro QR</span>
                </Link>
              </div>
            </nav>
            <div className="p-4 border-t border-[#173D32]">
              <button
                onClick={() => { logout(); setMobileSidebarOpen(false); }}
                className="w-full py-2 px-3 rounded-lg bg-[#173D32] text-xs font-medium flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
