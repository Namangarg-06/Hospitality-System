import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  ChefHat,
  ShoppingBag,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

export const PublicOrderStatusPage: React.FC = () => {
  const { slug, orderNumber } = useParams<{ slug: string; orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    if (!slug || !orderNumber) return;
    try {
      setLoading(true);
      const res = await api.getPublicOrderStatus(slug, orderNumber);
      setOrder(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000); // 8s live poll
    return () => clearInterval(interval);
  }, [slug, orderNumber]);

  const stages = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
  const currentStageIdx = order ? stages.indexOf(order.status) : 0;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#202722] py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E4DC] shadow-luxury space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-[#E7E4DC] pb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#173D32] text-[#C6A66A] mx-auto flex items-center justify-center font-bold shadow-subtle">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#173D32]">
            Order #{orderNumber}
          </h2>
          <p className="text-xs text-[#737B73]">
            {order?.order_type === 'DINE_IN' ? `${order.table_number || 'Dine-In Table'}` : 'Takeaway Order'}
          </p>
        </div>

        {/* Live Timeline State Machine */}
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-[#173D32]">
            <span>Current Kitchen Status:</span>
            <span className="px-2.5 py-1 rounded bg-[#FAF6ED] text-[#8C6F3B] border border-[#DCB980] font-mono">
              {order?.status}
            </span>
          </div>

          {/* Stepper Progress */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E7E4DC]">
            {[
              { id: 'PENDING', label: 'Order Transmitted to Kitchen', desc: 'Awaiting host verification' },
              { id: 'ACCEPTED', label: 'Accepted by Dining Brigade', desc: 'Order ticket printed in kitchen' },
              { id: 'PREPARING', label: 'Culinary Preparation Underway', desc: 'Crafted fresh on demand' },
              { id: 'READY', label: 'Plated & Ready to Serve', desc: 'Floor captain dispatching to table' },
              { id: 'COMPLETED', label: 'Fulfilled & Concluded', desc: 'Thank you for dining with us' },
            ].map((step, idx) => {
              const isPast = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;

              return (
                <div key={step.id} className="relative flex items-start space-x-3">
                  <div
                    className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isPast || isCurrent
                        ? 'bg-[#173D32] text-white ring-4 ring-[#E4ECE7]'
                        : 'bg-[#E7E4DC] text-[#737B73]'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isCurrent ? 'text-[#173D32]' : isPast ? 'text-[#202722]' : 'text-[#737B73]'}`}>
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-[#737B73] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items Summary */}
        {order?.items && (
          <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#E7E4DC] space-y-2 text-xs">
            <span className="font-bold text-[#173D32] uppercase tracking-wider block text-[10px]">
              Order Summary:
            </span>
            {order.items.map((i) => (
              <div key={i.id} className="flex justify-between">
                <span>{i.quantity}x {i.item_name}</span>
                <span className="font-mono">₹{i.item_total}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-[#E7E4DC] flex justify-between font-bold text-sm text-[#173D32]">
              <span>Verified Total</span>
              <span className="font-serif">₹{order.total_amount}</span>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="pt-2 text-center">
          <Link
            to={`/m/${slug}`}
            className="inline-flex items-center text-xs font-semibold text-[#173D32] hover:text-[#C6A66A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Return to Digital Menu
          </Link>
        </div>

      </div>
    </div>
  );
};
