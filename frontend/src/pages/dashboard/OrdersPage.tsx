import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChefHat,
  Filter,
  RefreshCw,
  Phone,
  User,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';

export const OrdersPage: React.FC = () => {
  const { workspace } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders(filterStatus === 'ALL' ? undefined : filterStatus);
      setOrders(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // 10s live kitchen poll
    return () => clearInterval(interval);
  }, [filterStatus]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-900 border border-amber-200">Pending Confirmation</span>;
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-900 border border-blue-200">Accepted</span>;
      case 'PREPARING':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-100 text-purple-900 border border-purple-200">In Kitchen Prep</span>;
      case 'READY':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">Ready to Serve</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-800 border border-gray-200">Fulfilled & Paid</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-100 text-rose-900 border border-rose-200">Rejected / Cancelled</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
            Kitchen Order Display
          </h2>
          <p className="text-sm text-[#737B73] mt-0.5">
            Manage real-time customer orders from digital QR menus and counter requests.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#E7E4DC] text-[#173D32] hover:bg-[#FAF6ED] transition-colors flex items-center shadow-subtle shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Ticket Queue
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#E7E4DC]">
        {['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === st
                ? 'bg-[#173D32] text-white shadow-sm'
                : 'bg-white border border-[#E7E4DC] text-[#737B73] hover:text-[#202722]'
            }`}
          >
            {st === 'ALL' ? 'All Orders' : st}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`card-luxury rounded-2xl overflow-hidden p-5 flex flex-col justify-between border-t-4 ${
                order.status === 'PENDING'
                  ? 'border-t-amber-500 bg-amber-50/10'
                  : order.status === 'PREPARING'
                  ? 'border-t-purple-600 bg-purple-50/10'
                  : order.status === 'READY'
                  ? 'border-t-emerald-600 bg-emerald-50/10'
                  : 'border-t-[#173D32]'
              }`}
            >
              <div>
                {/* Order Top Bar */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#173D32]">
                      #{order.order_number}
                    </span>
                    <p className="text-[11px] text-[#737B73] flex items-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Diner Information */}
                <div className="mt-3.5 pt-3 border-t border-[#E7E4DC] flex items-center justify-between text-xs text-[#202722]">
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-[#737B73]" />
                    <span className="font-semibold">{order.customer_name || 'Guest Diner'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#E4ECE7] text-[#173D32] font-semibold text-[11px]">
                    {order.order_type === 'DINE_IN' ? order.table_number || 'Dine-In' : 'Takeaway'}
                  </span>
                </div>

                {/* Items List */}
                <div className="mt-4 space-y-2 border-t border-[#E7E4DC] pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737B73]">
                    Dishes ({order.items.length})
                  </span>
                  {order.items.map((item) => (
                    <div key={item.id || item.menu_item_id} className="flex items-center justify-between text-xs">
                      <span className="text-[#202722]">
                        <strong className="text-[#173D32] mr-1">{item.quantity}x</strong>
                        {item.item_name}
                      </span>
                      <span className="font-mono text-[#737B73]">₹{item.item_total}</span>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="mt-3 p-2 rounded bg-[#FAF6ED] border border-[#DCB980] text-[11px] text-[#8C6F3B]">
                    <strong>Note:</strong> {order.notes}
                  </div>
                )}
              </div>

              {/* Order Footer & Actions */}
              <div className="mt-5 pt-3 border-t border-[#E7E4DC]">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-[#737B73]">Verified Total</span>
                  <span className="font-serif font-bold text-base text-[#173D32]">
                    ₹{order.total_amount}
                  </span>
                </div>

                {/* Status Progression Controls */}
                <div className="flex space-x-2">
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                        disabled={updatingId === order.id}
                        className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] transition-colors"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                        disabled={updatingId === order.id}
                        className="py-2 px-3 text-xs font-semibold rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {order.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      disabled={updatingId === order.id}
                      className="w-full py-2 text-xs font-semibold rounded-lg bg-purple-700 text-white hover:bg-purple-800 transition-colors flex items-center justify-center space-x-1"
                    >
                      <ChefHat className="w-3.5 h-3.5 mr-1" />
                      <span>Send to Kitchen Prep</span>
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      disabled={updatingId === order.id}
                      className="w-full py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors"
                    >
                      Mark Ready to Serve
                    </button>
                  )}

                  {order.status === 'READY' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      disabled={updatingId === order.id}
                      className="w-full py-2 text-xs font-semibold rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] transition-colors flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span>Complete & Mark Paid</span>
                    </button>
                  )}

                  {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
                    <span className="w-full py-1.5 text-xs text-center text-[#737B73] font-mono">
                      Ticket Closed
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl bg-white border border-[#E7E4DC]">
          <ShoppingBag className="w-12 h-12 text-[#C6A66A] mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-lg font-bold text-[#173D32]">
            No orders found under {filterStatus}
          </h3>
          <p className="text-xs text-[#737B73] mt-1">
            Orders placed via the digital QR menu will appear here in real time.
          </p>
        </div>
      )}

    </div>
  );
};
