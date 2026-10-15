import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  Upload,
  Calendar,
  Layers,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SalesAnalyticsSummary } from '../../types';

export const AnalyticsPage: React.FC = () => {
  const { workspace } = useAuth();
  const [days, setDays] = useState<number>(14);
  const [summary, setSummary] = useState<SalesAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // CSV Import State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [uploadingCsv, setUploadingCsv] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesSummary(days);
      setSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCsv(true);
    try {
      const res = await api.importSalesCsv(file);
      alert(res.message);
      setShowCsvModal(false);
      loadAnalytics();
    } catch (err: any) {
      alert(err.message || 'Sales CSV Import failed');
    } finally {
      setUploadingCsv(false);
    }
  };

  const currencySymbol = workspace?.currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
            Sales & Revenue Analytics
          </h2>
          <p className="text-sm text-[#737B73] mt-0.5">
            Deterministic financial reporting derived strictly from database order transactions and verified sales ledger entries.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Days filter */}
          <div className="inline-flex rounded-lg border border-[#E7E4DC] bg-white p-1 shadow-subtle">
            {[7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  days === d
                    ? 'bg-[#173D32] text-white shadow-sm'
                    : 'text-[#737B73] hover:text-[#202722]'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#E7E4DC] text-[#173D32] hover:bg-[#FAF6ED] transition-colors flex items-center shadow-subtle"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Import Sales CSV
          </button>
        </div>
      </div>

      {/* REVENUE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <span className="text-xs font-semibold uppercase text-[#737B73] tracking-wider">Gross Revenue</span>
          <p className="text-3xl font-serif font-bold text-[#173D32] mt-3">
            {currencySymbol}{summary?.total_revenue.toLocaleString() || 0}
          </p>
          <p className="text-xs text-[#737B73] mt-2">
            Interval: {summary?.period_start} to {summary?.period_end}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <span className="text-xs font-semibold uppercase text-[#737B73] tracking-wider">Net Sales (Excl. Tax)</span>
          <p className="text-3xl font-serif font-bold text-[#173D32] mt-3">
            {currencySymbol}{summary?.net_sales.toLocaleString() || 0}
          </p>
          <p className="text-xs text-[#737B73] mt-2">
            Discounts: {currencySymbol}{summary?.total_discounts.toLocaleString() || 0}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <span className="text-xs font-semibold uppercase text-[#737B73] tracking-wider">Total Volume</span>
          <p className="text-3xl font-serif font-bold text-[#173D32] mt-3">
            {summary?.total_orders.toLocaleString() || 0}
          </p>
          <p className="text-xs text-[#737B73] mt-2">
            Dispatched Dining Orders
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#FAF6ED] border border-[#DCB980] shadow-subtle">
          <span className="text-xs font-bold uppercase text-[#8C6F3B] tracking-wider">Average Order Value</span>
          <p className="text-3xl font-serif font-bold text-[#173D32] mt-3">
            {currencySymbol}{summary?.average_order_value || 0}
          </p>
          <p className="text-xs text-[#737B73] mt-2">
            Per-ticket dining expenditure
          </p>
        </div>

      </div>

      {/* DAILY TREND BAR VISUALIZATION */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#173D32]">
              Revenue & Order Volume Cadence
            </h3>
            <p className="text-xs text-[#737B73]">
              Daily aggregation of digital QR orders and reconciled POS records.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-[#737B73]">
            {summary?.daily_trend?.length || 0} Ledger Data Points
          </span>
        </div>

        <div className="h-64 flex items-end justify-between space-x-2 pt-6">
          {summary?.daily_trend?.map((item) => {
            const maxVal = Math.max(...summary.daily_trend.map((d) => d.gross_sales), 1);
            const heightPercent = Math.max(14, Math.round((item.gross_sales / maxVal) * 100));
            return (
              <div key={item.date} className="flex-1 flex flex-col items-center group relative">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[32px] rounded-t-lg bg-[#173D32] group-hover:bg-[#C6A66A] transition-all"
                ></div>
                <span className="text-[10px] text-[#737B73] mt-2 group-hover:text-[#173D32] font-semibold">
                  {item.date.slice(5)}
                </span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block z-30 px-3 py-1.5 text-xs text-white bg-[#102C25] rounded-lg shadow-luxury whitespace-nowrap">
                  <div className="font-bold">{item.date}</div>
                  <div>Sales: {currencySymbol}{item.gross_sales.toLocaleString()}</div>
                  <div>Volume: {item.orders} orders (AOV: {currencySymbol}{item.aov})</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DISH MATRICES: TOP SELLING VS SLOW-MOVING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top-Selling Dishes */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-[#173D32]">
              Best-Selling Signatures
            </h3>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              High Velocity
            </span>
          </div>

          <div className="space-y-3">
            {summary?.top_selling_dishes && summary.top_selling_dishes.length > 0 ? (
              summary.top_selling_dishes.map((dish, idx) => (
                <div
                  key={dish.item_name}
                  className="p-3.5 rounded-xl border border-[#E7E4DC] flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-[#173D32] text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-[#173D32]">{dish.item_name}</h4>
                      <p className="text-[11px] text-[#737B73]">
                        {dish.quantity_sold} portions • Price: {currencySymbol}{dish.average_price}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#173D32]">
                    {currencySymbol}{dish.total_revenue.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#737B73] py-4 text-center">No orders recorded in this interval.</p>
            )}
          </div>
        </div>

        {/* Slow-Moving Dishes */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-[#173D32]">
              Slow-Moving Dishes (Review Candidate)
            </h3>
            <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Needs Attention
            </span>
          </div>

          <div className="space-y-3">
            {summary?.slow_moving_dishes && summary.slow_moving_dishes.length > 0 ? (
              summary.slow_moving_dishes.map((dish) => (
                <div
                  key={dish.item_name}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#173D32]">{dish.item_name}</h4>
                    <p className="text-[11px] text-[#737B73]">
                      Low volume: only {dish.quantity_sold} orders placed.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-900">
                    {currencySymbol}{dish.total_revenue.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#737B73] py-4 text-center">No underperforming dishes identified.</p>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: CSV SALES IMPORT */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E7E4DC] shadow-2xl text-center">
            <h3 className="font-serif text-lg font-bold text-[#173D32]">Import Historical Sales CSV</h3>
            <p className="text-xs text-[#737B73]">
              Upload daily financial CSV containing columns: <code className="bg-[#FAF6ED] px-1 py-0.5 rounded font-mono">date, sales, orders</code>.
            </p>
            <label className="inline-flex items-center px-4 py-2.5 rounded-xl bg-[#173D32] text-white text-xs font-semibold cursor-pointer hover:bg-[#102C25] shadow-luxury">
              <span>{uploadingCsv ? 'Ingesting Sales Records...' : 'Choose Sales CSV'}</span>
              <input type="file" accept=".csv" disabled={uploadingCsv} onChange={handleCsvUpload} className="hidden" />
            </label>
            <div className="pt-2">
              <button onClick={() => setShowCsvModal(false)} className="text-xs text-[#737B73] hover:underline">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
