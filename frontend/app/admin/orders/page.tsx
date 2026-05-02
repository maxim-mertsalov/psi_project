'use client';

import { orderApi } from '@/app/services/api';
import { OrderSummaryRes } from '@/app/types/dto/order';
import { useEffect, useState } from 'react';

type OrderStatus = "WAITING_FOR_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED" | "CANCELLED" | "ALL";

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<OrderStatus>('ALL');
  const [orders, setOrders] = useState<OrderSummaryRes[]>([]);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.adminGetAllOrders();
      setOrders(data);
    } catch (e) {
      console.error("Failed to fetch orders:", e);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = filter === 'ALL' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'WAITING_FOR_PAYMENT': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'PAID': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'SHIPPED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-primary">Order Management</h1>
          <p className="text-on-surface-variant mt-1">Monitor and process incoming hardware requests.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-surface-container border border-outline-variant/20 rounded-xl font-bold text-primary hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined">download</span>
          Export CSV
        </button>
      </div>

      {/* Фильтры-табы */}
      <div className="flex flex-wrap gap-2 p-1 bg-surface-container-low rounded-2xl w-fit border border-outline-variant/10">
        {(['ALL', 'WAITING_FOR_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'CANCELLED'] as OrderStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              filter === status 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Таблица заказов */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant/10">
              <tr>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Order ID</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Customer</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Amount</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filteredOrders.map((order) => (
                <tr key={order.orderId} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="p-6">
                    <span className="font-bold text-primary">{order.orderId}</span>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{order.orderNumber} items</p>
                  </td>
                  <td className="p-6">
                    <div className="font-medium text-primary">{order.guestEmail}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="font-bold text-primary">${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-primary/5 rounded-lg text-primary transition-colors title='View Details'">
                        <span className="material-symbols-outlined text-xl">visibility</span>
                      </button>
                      <button className="p-2 hover:bg-primary/5 rounded-lg text-primary transition-colors title='Change Status'">
                        <span className="material-symbols-outlined text-xl">edit_square</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="p-20 text-center">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">search_off</span>
            <p className="text-on-surface-variant font-medium">No orders found matching this status.</p>
          </div>
        )}
      </div>
    </div>
  );
}