import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  XCircle,
  FileText,
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ActionInsight } from '../../types';

export const ActionsPage: React.FC = () => {
  const { workspace } = useAuth();
  const [insights, setInsights] = useState<ActionInsight[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.getActionInsights();
      setInsights(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.refreshActionEngine();
      setInsights(res);
    } catch (e) {
      alert('Failed to evaluate operations');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.updateActionInsight(id, status);
      setInsights((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: status as any } : i))
      );
    } catch (err: any) {
      alert('Failed to update action insight');
    }
  };

  const filtered = insights.filter((i) => {
    if (filterSeverity === 'ALL') return true;
    return i.severity === filterSeverity;
  });

  const criticalCount = insights.filter((i) => i.severity === 'CRITICAL' && i.status === 'OPEN').length;
  const warningCount = insights.filter((i) => i.severity === 'WARNING' && i.status === 'OPEN').length;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-[#C6A66A]" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
              AI Restaurant Action Engine
            </h2>
          </div>
          <p className="text-sm text-[#737B73] mt-0.5">
            Cross-module intelligence diagnosing kitchen delays, food-waste patterns, pricing conflicts, and unacknowledged guest feedback.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#173D32] hover:bg-[#102C25] text-white flex items-center shadow-luxury transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Evaluating Operational Data...' : 'Re-Evaluate Venue Signals'}
        </button>
      </div>

      {/* SEVERITY BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200">
          <div className="flex items-center justify-between text-red-900 font-bold text-xs uppercase tracking-wider">
            <span>Critical Interventions</span>
            <span className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center font-mono">
              {criticalCount}
            </span>
          </div>
          <p className="text-xs text-red-800 mt-2">
            Service bottlenecks or pending kitchen orders requiring immediate supervisor action.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center justify-between text-amber-900 font-bold text-xs uppercase tracking-wider">
            <span>Operational Warnings</span>
            <span className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center font-mono">
              {warningCount}
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-2">
            Repeated food discards, negative review backlog, or potential batch prep discrepancies.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FAF6ED] border border-[#DCB980]">
          <div className="flex items-center justify-between text-[#8C6F3B] font-bold text-xs uppercase tracking-wider">
            <span>Menu & Allergen Hygiene</span>
            <span className="w-6 h-6 rounded-full bg-[#E8D7B0] flex items-center justify-center font-mono">
              {insights.filter((i) => i.severity === 'OPTIMIZATION' && i.status === 'OPEN').length}
            </span>
          </div>
          <p className="text-xs text-[#737B73] mt-2">
            Dishes requiring dietary allergen confirmation for guest safety grounding.
          </p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center space-x-2 border-b border-[#E7E4DC] pb-2">
        {['ALL', 'CRITICAL', 'WARNING', 'OPTIMIZATION'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterSeverity === sev
                ? 'bg-[#173D32] text-white shadow-sm'
                : 'bg-white border border-[#E7E4DC] text-[#737B73] hover:text-[#202722]'
            }`}
          >
            {sev === 'ALL' ? `All Alerts (${insights.length})` : sev}
          </button>
        ))}
      </div>

      {/* ACTION INSIGHTS CARDS */}
      <div className="space-y-5">
        {filtered.map((item) => {
          const isResolved = item.status === 'RESOLVED';
          const isDismissed = item.status === 'DISMISSED';

          return (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border transition-all ${
                isResolved
                  ? 'bg-gray-50 border-gray-200 opacity-60'
                  : item.severity === 'CRITICAL'
                  ? 'bg-red-50/20 border-red-300 shadow-luxury'
                  : item.severity === 'WARNING'
                  ? 'bg-amber-50/20 border-amber-300 shadow-subtle'
                  : 'bg-white border-[#E7E4DC] shadow-subtle'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Left details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        item.severity === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : item.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#FAF6ED] text-[#8C6F3B] border border-[#DCB980]'
                      }`}
                    >
                      {item.severity}
                    </span>
                    <span className="text-xs font-bold text-[#737B73] uppercase tracking-wider">
                      Module: {item.category}
                    </span>
                    <span className="text-[11px] text-[#737B73]">
                      • {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#173D32]">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#202722] leading-relaxed">
                    {item.explanation}
                  </p>

                  {/* Supporting Evidence Quotes */}
                  {item.supporting_evidence && item.supporting_evidence.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-[#E7E4DC] text-xs space-y-1">
                      <span className="font-bold text-[#173D32] block text-[11px] uppercase tracking-wider">
                        Operational Evidence & Records:
                      </span>
                      {item.supporting_evidence.map((ev: any, idx: number) => (
                        <div key={idx} className="text-[#737B73] italic pl-2 border-l-2 border-[#C6A66A]">
                          {typeof ev === 'string' ? ev : JSON.stringify(ev)}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommended Next Step Box */}
                  <div className="mt-3 p-3.5 rounded-xl bg-[#FAF6ED] border border-[#DCB980] flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 text-[#C6A66A] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-[#8C6F3B] block">
                        Recommended Operational Step:
                      </span>
                      <p className="text-xs text-[#202722] mt-0.5 leading-relaxed font-medium">
                        {item.recommended_next_step}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md font-mono ${
                    isResolved ? 'bg-emerald-100 text-emerald-800' : isDismissed ? 'bg-gray-200 text-gray-700' : 'bg-[#173D32] text-white'
                  }`}>
                    {item.status}
                  </span>

                  {!isResolved && !isDismissed && (
                    <div className="flex sm:flex-col gap-2 w-full mt-2">
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                        className="py-1.5 px-3 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'DISMISSED')}
                        className="py-1.5 px-3 text-xs font-semibold rounded-lg border border-[#E7E4DC] text-[#737B73] hover:bg-[#F8F6F0]"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-16 text-center rounded-2xl bg-white border border-[#E7E4DC]">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#173D32]">
              No active operational bottlenecks
            </h3>
            <p className="text-xs text-[#737B73] mt-1">
              Your kitchen timing, menu consistency, and review responses are currently within optimal thresholds.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
