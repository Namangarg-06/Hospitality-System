import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Plus,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Calendar,
  CheckCircle2,
  DollarSign,
  Scale,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FoodWasteRecord, WasteSummary } from '../../types';

export const WastePage: React.FC = () => {
  const { workspace } = useAuth();
  const [records, setRecords] = useState<FoodWasteRecord[]>([]);
  const [summary, setSummary] = useState<WasteSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // New Waste Record Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [wasteForm, setWasteForm] = useState({
    item_name: '',
    is_dish: true,
    quantity: 1.5,
    unit: 'kg',
    reason: 'OVER_PREPARATION',
    estimated_cost: 350.0,
    notes: '',
  });

  const loadWasteData = async () => {
    try {
      setLoading(true);
      const [recs, sum] = await Promise.all([
        api.getWasteRecords(),
        api.getWasteSummary(),
      ]);
      setRecords(recs);
      setSummary(sum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWasteData();
  }, []);

  const handleSaveWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordWaste(wasteForm);
      setShowLogModal(false);
      setWasteForm({
        item_name: '',
        is_dish: true,
        quantity: 1.0,
        unit: 'kg',
        reason: 'OVER_PREPARATION',
        estimated_cost: 250.0,
        notes: '',
      });
      loadWasteData();
    } catch (err: any) {
      alert(err.message || 'Failed to log food waste');
    }
  };

  const currencySymbol = workspace?.currency === 'INR' ? '₹' : '$';

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
            Food-Waste Intelligence & Prevention
          </h2>
          <p className="text-sm text-[#737B73] mt-0.5">
            Track kitchen preparation loss, spoilage, and plate returns to preserve margins and protect ingredient sustainability.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#173D32] hover:bg-[#102C25] text-white flex items-center shadow-luxury shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Log Food Waste
        </button>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <div className="flex items-center justify-between text-[#737B73] text-xs font-semibold uppercase tracking-wider">
            <span>Logged Financial Loss</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-red-900 mt-3">
            {currencySymbol}{summary?.total_waste_cost.toLocaleString() || 0}
          </p>
          <p className="text-xs text-[#737B73] mt-2">
            Cumulative estimated ingredient & prep cost
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <div className="flex items-center justify-between text-[#737B73] text-xs font-semibold uppercase tracking-wider">
            <span>Total Weight Logged</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-[#173D32] mt-3">
            {summary?.total_waste_quantity_kg || 0} kg
          </p>
          <p className="text-xs text-[#737B73] mt-2">
            Across {summary?.total_waste_records || 0} verified shift logs
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#FAF6ED] border border-[#DCB980] shadow-subtle">
          <div className="flex items-center justify-between text-[#8C6F3B] text-xs font-bold uppercase tracking-wider">
            <span>Primary Cause</span>
            <AlertTriangle className="w-4 h-4 text-[#C6A66A]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#173D32] mt-3">
            {summary?.reason_breakdown?.[0]?.reason || 'Over Preparation'}
          </p>
          <p className="text-xs text-[#737B73] mt-2">
            Accounting for {summary?.reason_breakdown?.[0]?.percentage || 0}% of waste value
          </p>
        </div>

      </div>

      {/* REASONS BREAKDOWN & ACTIONABLE RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Reasons Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
          <h3 className="font-serif text-lg font-bold text-[#173D32] mb-1">
            Wastage Breakdown by Category
          </h3>
          <p className="text-xs text-[#737B73] mb-6">
            Identifies process failure points across prep, inventory storage, and dining service.
          </p>

          <div className="space-y-4">
            {summary?.reason_breakdown?.map((item) => (
              <div key={item.reason} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#173D32]">{item.reason}</span>
                  <span className="font-mono text-[#737B73]">
                    {currencySymbol}{item.cost} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F8F6F0] overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className="h-full rounded-full bg-[#173D32]"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Waste Reduction Recommendations */}
        <div className="p-6 rounded-2xl bg-[#FAF6ED]/70 border border-[#DCB980] shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-5 h-5 text-[#C6A66A]" />
              <h3 className="font-serif text-lg font-bold text-[#173D32]">
                Actionable Reduction Directives
              </h3>
            </div>
            <p className="text-xs text-[#737B73] mb-4">
              AI recommendations grounded in historical prep-to-sales velocity.
            </p>

            <div className="space-y-3">
              {summary?.actionable_reduction_recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-[#DCB980]/50 text-xs flex items-start space-x-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#173D32] shrink-0 mt-0.5" />
                  <p className="text-[#202722] leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCB980]/50 text-[11px] text-[#737B73] flex items-center justify-between">
            <span>Directives updated upon every recorded shift.</span>
            <span className="font-semibold text-[#173D32]">Kitchen Intelligence</span>
          </div>
        </div>

      </div>

      {/* RECENT WASTE AUDIT LOGS */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
        <h3 className="font-serif text-lg font-bold text-[#173D32] mb-1">
          Recent Shift Waste Logs
        </h3>
        <p className="text-xs text-[#737B73] mb-4">
          Itemized log of kitchen discards with recorded reasons and supervisor notes.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7E4DC] text-[#737B73] uppercase tracking-wider font-semibold">
                <th className="pb-3">Item / Ingredient</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Reason</th>
                <th className="pb-3">Estimated Cost</th>
                <th className="pb-3">Date & Shift</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-[#F8F6F0]">
                  <td className="py-3 font-semibold text-[#173D32]">{r.item_name}</td>
                  <td className="py-3 font-mono">{r.quantity} {r.unit}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF6ED] text-[#8C6F3B] border border-[#DCB980]">
                      {r.reason.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-[#173D32]">{currencySymbol}{r.estimated_cost}</td>
                  <td className="py-3 text-[#737B73]">
                    {new Date(r.date_time).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-[#737B73] italic">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: LOG FOOD WASTE */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E7E4DC] shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#E7E4DC] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#173D32]">Record Kitchen Food Waste</h3>
              <button onClick={() => setShowLogModal(false)} className="text-[#737B73]"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveWaste} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                  Dish or Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={wasteForm.item_name}
                  onChange={(e) => setWasteForm({ ...wasteForm, item_name: e.target.value })}
                  placeholder="e.g. 24-Hour Dal Simmer, Chicken Tikka Marinade"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={wasteForm.quantity}
                    onChange={(e) => setWasteForm({ ...wasteForm, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                    Unit
                  </label>
                  <select
                    value={wasteForm.unit}
                    onChange={(e) => setWasteForm({ ...wasteForm, unit: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="portions">Portions</option>
                    <option value="liters">Liters (L)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                  Waste Cause *
                </label>
                <select
                  value={wasteForm.reason}
                  onChange={(e) => setWasteForm({ ...wasteForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                >
                  <option value="OVER_PREPARATION">Over-Preparation (Unsold Batch)</option>
                  <option value="SPOILAGE">Storage Spoilage / Temp Excursion</option>
                  <option value="PLATE_WASTE">Customer Plate Return</option>
                  <option value="PREPARATION_ERROR">Kitchen Preparation Error</option>
                  <option value="EXPIRED">Expired Shelf Life</option>
                  <option value="OTHER">Other Operational Waste</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                  Estimated Financial Loss (₹)
                </label>
                <input
                  type="number"
                  step="10"
                  value={wasteForm.estimated_cost}
                  onChange={(e) => setWasteForm({ ...wasteForm, estimated_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={wasteForm.notes}
                  onChange={(e) => setWasteForm({ ...wasteForm, notes: e.target.value })}
                  placeholder="Root cause notes for chef de partie..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#E7E4DC]">
                <button type="button" onClick={() => setShowLogModal(false)} className="px-3 py-1.5 text-xs rounded border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs rounded bg-[#173D32] text-white font-semibold">Log Waste Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
