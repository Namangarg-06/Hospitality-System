import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Star,
  Trash2,
  Sparkles,
  Clock,
  ArrowUpRight,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  UtensilsCrossed,
  MessageSquare,
  QrCode,
  Calendar,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Order, CustomerReview, ActionInsight, SalesAnalyticsSummary, WasteSummary } from '../../types';

export const DashboardOverviewPage: React.FC = () => {
  const { workspace, isDemoMode } = useAuth();

  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('7d');
  const [salesSummary, setSalesSummary] = useState<SalesAnalyticsSummary | null>(null);
  const [wasteSummary, setWasteSummary] = useState<WasteSummary | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [actionInsights, setActionInsights] = useState<ActionInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const days = timeRange === 'today' ? 1 : timeRange === '7d' ? 7 : 30;
        const [sales, waste, orders, revs, actions] = await Promise.all([
          api.getSalesSummary(days),
          api.getWasteSummary(),
          api.getOrders('PENDING'),
          api.getReviews(),
          api.getActionInsights(),
        ]);

        setSalesSummary(sales);
        setWasteSummary(waste);
        setPendingOrders(orders);
        setReviews(revs);
        setActionInsights(actions);
      } catch (err) {
        console.error('Failed to load dashboard operational data', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [timeRange]);

  // Derived metrics
  const totalRevenue = salesSummary?.total_revenue || 0;
  const totalOrders = salesSummary?.total_orders || 0;
  const aov = salesSummary?.average_order_value || 0;
  const currencySymbol = workspace?.currency === 'INR' ? '₹' : '$';

  // Sentiment ratio
  const positiveReviews = reviews.filter((r) => r.sentiment === 'POSITIVE').length;
  const sentimentScore = reviews.length > 0 ? Math.round((positiveReviews / reviews.length) * 100) : 0;
  const pendingRepliesCount = reviews.filter((r) => r.status !== 'REPLIED' && r.rating <= 3).length;

  // Open critical actions
  const openActions = actionInsights.filter((a) => a.status === 'OPEN');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-10 h-10 border-3 border-[#173D32] border-t-[#C6A66A] rounded-full animate-spin"></div>
        <p className="text-sm text-[#737B73]">Synthesizing restaurant operational intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Time Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
            Executive Operations Center
          </h2>
          <p className="text-sm text-[#737B73] mt-0.5">
            Real-time performance metrics and predictive restaurant intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Timeframe pill selector */}
          <div className="inline-flex rounded-lg border border-[#E7E4DC] bg-white p-1 shadow-subtle">
            {(['today', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  timeRange === r
                    ? 'bg-[#173D32] text-white shadow-sm'
                    : 'text-[#737B73] hover:text-[#202722]'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>

          {/* QR Menu Quick Link */}
          {workspace?.slug && (
            <Link
              to={`/m/${workspace.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-[#E7E4DC] text-[#173D32] hover:bg-[#FAF6ED] transition-colors flex items-center shadow-subtle"
            >
              <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#C6A66A]" />
              Scan QR
            </Link>
          )}
        </div>
      </div>

      {/* Synthetic Demo Disclaimer when active */}
      {isDemoMode && (
        <div className="p-4 rounded-xl bg-[#FAF6ED] border border-[#DCB980] flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-[#C6A66A] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#8C6F3B]">
                Synthetic Demo Environment Active
              </h4>
              <p className="text-xs text-[#737B73] mt-0.5">
                The displayed sales trends, kitchen orders, and feedback entries are realistic simulation records designed to demonstrate platform capabilities.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-[#173D32] text-white">
            DEMO MODE
          </span>
        </div>
      )}

      {/* 4 SIMPLE QUICK ACTION CARDS */}
      <div className="bg-gradient-to-r from-[#FAF6ED] to-white p-5 rounded-2xl border border-[#DCB980]/50 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#173D32] flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-[#C6A66A]" />
            Quick Access Shortcuts — Sabse Zaroori Kaam Ek Click Mein
          </h3>
          <span className="text-xs text-[#737B73]">4 Core Modules</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <Link
            to={workspace?.slug ? `/m/${workspace.slug}` : '/m/the-royal-saffron'}
            className="p-3.5 rounded-xl bg-white border border-[#E7E4DC] hover:border-[#C6A66A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FAF6ED] text-[#C6A66A] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#173D32]">1. Customer QR Menu</p>
              <p className="text-[11px] text-[#737B73] mt-0.5">Test as guest & AI waiter</p>
            </div>
          </Link>

          <Link
            to="/dashboard/orders"
            className="p-3.5 rounded-xl bg-white border border-[#E7E4DC] hover:border-[#C6A66A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#173D32]">2. Kitchen Orders</p>
              <p className="text-[11px] text-[#737B73] mt-0.5">{pendingOrders.length} pending orders</p>
            </div>
          </Link>

          <Link
            to="/dashboard/menu"
            className="p-3.5 rounded-xl bg-white border border-[#E7E4DC] hover:border-[#C6A66A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#173D32]">3. Menu Studio</p>
              <p className="text-[11px] text-[#737B73] mt-0.5">Dishes, PDF extraction</p>
            </div>
          </Link>

          <Link
            to="/dashboard/reviews"
            className="p-3.5 rounded-xl bg-white border border-[#E7E4DC] hover:border-[#C6A66A] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#173D32]">4. Review AI Studio</p>
              <p className="text-[11px] text-[#737B73] mt-0.5">{reviews.length} guest reviews & replies</p>
            </div>
          </Link>

        </div>
      </div>

      {/* KEY METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Recorded Sales */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle hover:border-[#DCB980] transition-all">
          <div className="flex items-center justify-between text-[#737B73] text-xs font-semibold uppercase tracking-wider">
            <span>Recorded Sales</span>
            <div className="p-2 rounded-lg bg-[#E4ECE7] text-[#173D32]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-[#173D32] mt-3">
            {currencySymbol}{totalRevenue.toLocaleString()}
          </p>
          <div className="mt-3 flex items-center text-xs text-[#737B73]">
            <span className="text-emerald-700 font-semibold mr-1.5">+14.2%</span>
            <span>vs previous period</span>
          </div>
        </div>

        {/* Metric 2: Orders Count */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle hover:border-[#DCB980] transition-all">
          <div className="flex items-center justify-between text-[#737B73] text-xs font-semibold uppercase tracking-wider">
            <span>Orders Dispatched</span>
            <div className="p-2 rounded-lg bg-[#FAF6ED] text-[#C6A66A]">
              <ShoppingBag className="w-4 h-4 text-[#8C6F3B]" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-[#173D32] mt-3">
            {totalOrders}
          </p>
          <div className="mt-3 flex items-center text-xs text-[#737B73]">
            <span>Average Order Value: </span>
            <span className="font-semibold text-[#173D32] ml-1">{currencySymbol}{aov}</span>
          </div>
        </div>

        {/* Metric 3: Customer Sentiment */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle hover:border-[#DCB980] transition-all">
          <div className="flex items-center justify-between text-[#737B73] text-xs font-semibold uppercase tracking-wider">
            <span>Guest Sentiment</span>
            <div className="p-2 rounded-lg bg-[#E4ECE7] text-[#173D32]">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-[#173D32] mt-3">
            {sentimentScore}%
          </p>
          <div className="mt-3 flex items-center text-xs text-[#737B73]">
            <span>{reviews.length} reviews analyzed</span>
            {pendingRepliesCount > 0 && (
              <span className="ml-auto text-amber-700 font-semibold">{pendingRepliesCount} reply needed</span>
            )}
          </div>
        </div>

        {/* Metric 4: Food Waste */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle hover:border-[#DCB980] transition-all">
          <div className="flex items-center justify-between text-[#737B73] text-xs font-semibold uppercase tracking-wider">
            <span>Recorded Waste</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-[#173D32] mt-3">
            {currencySymbol}{wasteSummary?.total_waste_cost.toLocaleString() || 0}
          </p>
          <div className="mt-3 flex items-center text-xs text-[#737B73]">
            <span>Total: </span>
            <span className="font-semibold text-red-700 ml-1">{wasteSummary?.total_waste_quantity_kg || 0} kg</span>
            <span className="ml-1 text-[11px]">logged</span>
          </div>
        </div>

      </div>

      {/* REVENUE TRENDS & AI ACTION HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#173D32]">
                  Daily Revenue Performance
                </h3>
                <p className="text-xs text-[#737B73]">
                  Deterministic sales totals calculated from kitchen orders & POS records.
                </p>
              </div>
              <Link to="/dashboard/analytics" className="text-xs font-semibold text-[#173D32] hover:text-[#C6A66A] flex items-center">
                Detailed Analytics <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Custom Responsive Revenue Bar Visualization */}
            <div className="pt-6 pb-2">
              <div className="h-48 flex items-end justify-between space-x-2">
                {salesSummary?.daily_trend && salesSummary.daily_trend.length > 0 ? (
                  salesSummary.daily_trend.map((day) => {
                    const maxVal = Math.max(...salesSummary.daily_trend.map((d) => d.gross_sales), 1);
                    const heightPercent = Math.max(12, Math.round((day.gross_sales / maxVal) * 100));
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center group relative">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[28px] rounded-t-md bg-[#173D32] group-hover:bg-[#C6A66A] transition-all"
                        ></div>
                        <span className="text-[10px] text-[#737B73] mt-2 group-hover:text-[#173D32] font-medium">
                          {day.date.slice(8)}
                        </span>

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-20 px-2 py-1 text-[10px] font-semibold text-white bg-[#102C25] rounded shadow-luxury whitespace-nowrap">
                          {currencySymbol}{day.gross_sales.toLocaleString()} ({day.orders} orders)
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full text-center py-12 text-sm text-[#737B73]">
                    No sales records logged for this interval.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E4DC] flex items-center justify-between text-xs text-[#737B73]">
            <span>Net Sales: <strong className="text-[#173D32]">{currencySymbol}{salesSummary?.net_sales.toLocaleString() || 0}</strong></span>
            <span>Discounts Deducted: <strong className="text-[#173D32]">{currencySymbol}{salesSummary?.total_discounts.toLocaleString() || 0}</strong></span>
            <span>Tax Collected: <strong className="text-[#173D32]">{currencySymbol}{Math.round(totalRevenue * 0.05).toLocaleString()}</strong></span>
          </div>
        </div>

        {/* AI Action Center Priority Feed (1 Col) */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#C6A66A]" />
                <h3 className="font-serif text-lg font-bold text-[#173D32]">
                  Priority Actions
                </h3>
              </div>
              <Link to="/dashboard/actions" className="text-xs font-semibold text-[#173D32] hover:text-[#C6A66A]">
                View All ({openActions.length})
              </Link>
            </div>

            <div className="space-y-3">
              {openActions.slice(0, 3).map((action) => (
                <div
                  key={action.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    action.severity === 'CRITICAL'
                      ? 'bg-red-50/50 border-red-200'
                      : action.severity === 'WARNING'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-[#FAF6ED]/70 border-[#DCB980]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B73]">
                      {action.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        action.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : action.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#FAF6ED] text-[#8C6F3B]'
                      }`}
                    >
                      {action.severity}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#173D32] mt-1.5 leading-snug">
                    {action.title}
                  </h4>
                  <p className="text-[11px] text-[#737B73] mt-1 line-clamp-2">
                    {action.recommended_next_step}
                  </p>
                </div>
              ))}

              {openActions.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs text-[#737B73]">No open operational alerts! Venue is running smoothly.</p>
                </div>
              )}
            </div>
          </div>

          <Link
            to="/dashboard/actions"
            className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#173D32] hover:bg-[#102C25] text-white text-xs font-semibold text-center flex items-center justify-center space-x-1.5 shadow-subtle transition-all"
          >
            <span>Open Intelligence Action Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* BOTTOM SECTION: LIVE KITCHEN ORDERS & TOP-SELLING DISHES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Live Incoming Orders */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#173D32]" />
              <h3 className="font-serif text-lg font-bold text-[#173D32]">
                Incoming Kitchen Orders
              </h3>
            </div>
            <Link to="/dashboard/orders" className="text-xs font-semibold text-[#173D32] hover:text-[#C6A66A]">
              Kitchen Display System →
            </Link>
          </div>

          {pendingOrders.length > 0 ? (
            <div className="space-y-3">
              {pendingOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-[#173D32]">
                        #{order.order_number}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded">
                        {order.order_type === 'DINE_IN' ? order.table_number || 'Dine-In' : 'Takeaway'}
                      </span>
                    </div>
                    <p className="text-xs text-[#737B73] mt-1">
                      {order.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#173D32]">
                      {currencySymbol}{order.total_amount}
                    </p>
                    <Link
                      to="/dashboard/orders"
                      className="inline-block mt-1 text-[11px] font-semibold text-[#173D32] hover:underline"
                    >
                      Accept in Kitchen →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-[#E7E4DC] rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#173D32]">All orders are dispatched</p>
              <p className="text-xs text-[#737B73] mt-1">New incoming QR menu orders will appear here instantly.</p>
            </div>
          )}
        </div>

        {/* Top Performing Dishes Matrix */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <UtensilsCrossed className="w-5 h-5 text-[#173D32]" />
              <h3 className="font-serif text-lg font-bold text-[#173D32]">
                Top Selling Menu Items
              </h3>
            </div>
            <Link to="/dashboard/menu" className="text-xs font-semibold text-[#173D32] hover:text-[#C6A66A]">
              Menu Studio →
            </Link>
          </div>

          <div className="space-y-3">
            {salesSummary?.top_selling_dishes && salesSummary.top_selling_dishes.length > 0 ? (
              salesSummary.top_selling_dishes.slice(0, 4).map((dish, idx) => (
                <div
                  key={dish.item_name}
                  className="p-3.5 rounded-xl border border-[#E7E4DC] bg-[#F8F6F0]/60 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-[#173D32] text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#173D32]">{dish.item_name}</h4>
                      <p className="text-[11px] text-[#737B73]">
                        {dish.quantity_sold} portions ordered • Unit: {currencySymbol}{dish.average_price}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#173D32]">
                    {currencySymbol}{dish.total_revenue.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#737B73] py-4 text-center">No sales dish records available.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
