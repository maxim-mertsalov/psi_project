'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { orderApi } from "../services/api";
import { OrderSummaryRes } from "../types/dto/order";
import { AuthRes } from "../types/dto/customer";
import { ApiError } from "../types/dto/errors";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<OrderSummaryRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthRes | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("smartbuy-user");
    if (savedUser) setUser(JSON.parse(savedUser));

    orderApi.getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      await orderApi.cancelOrder(orderId);
      const updated = await orderApi.getMyOrders();
      setOrders(updated);
    } catch (err: ApiError | unknown) {
      alert((err as ApiError).message);
    }
  };

  if (loading) return <div className="pt-32 text-center font-bold">Loading your profile...</div>;

  console.log("User profile data:", orders);

  return (
    <div className="bg-surface min-h-screen">
      <main className="pt-24 max-w-screen-2xl mx-auto px-6 flex flex-col md:flex-row gap-12 min-h-[calc(100vh-100px)] pb-24">
        
        {/* Боковая панель (Sidebar) */}
        <aside className="w-full md:w-80 py-8 flex flex-col">
          <div className="mb-10 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
            <div className="w-20 h-20 bg-primary-container text-on-primary-container rounded-2xl mb-6 flex items-center justify-center text-3xl font-bold shadow-inner">
              {user?.name?.charAt(0)}
            </div>
            <h2 className="text-2xl font-extrabold text-primary tracking-tight">{user?.name}</h2>
            <p className="text-sm text-on-surface-variant font-medium mb-1">{user?.email}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60">
              Role: {user?.role}
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-4 px-6 py-4 rounded-xl font-bold transition-all ${
                activeTab === 'orders' 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">inventory_2</span>
              My Orders
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-4 px-6 py-4 rounded-xl font-bold transition-all ${
                activeTab === 'settings' 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">settings</span>
              Account Settings
            </button>
            <Link 
              href="/login" 
              className="flex items-center gap-4 px-6 py-4 rounded-xl font-bold text-error hover:bg-error/5 transition-all mt-4"
            >
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </Link>
          </nav>
        </aside>

        <section className="flex-1 py-8">
          {activeTab === 'orders' ? (
            <>
              <h1 className="text-4xl font-extrabold text-primary mb-12 tracking-tighter">Order History</h1>
              <div className="space-y-6">
                {orders.map((order) => (
                  <div 
                    key={order.orderId} 
                    className="bg-surface-container-lowest p-8 flex flex-col md:flex-row justify-between items-start md:items-center rounded-2xl border border-outline-variant/10 hover:border-primary/20 transition-all group"
                  >
                    <div className="space-y-2 mb-4 md:mb-0">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                          order.status === 'SHIPPED' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-primary-fixed text-on-primary-fixed-variant'
                        }`}>
                          {order.status}
                        </span>
                        <span className="text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-bold text-primary">{order.orderId}</h3>
                      <p className="text-sm text-on-surface-variant">{order.orderNumber} items in this order</p>
                    </div>
                    
                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-2xl font-extrabold text-primary">
                        ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <button onClick={() => handleCancelOrder(order.orderId)} className="p-3 bg-surface-container border border-outline-variant/20 rounded-xl group-hover:bg-primary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-extrabold text-primary mb-12 tracking-tighter">Account Settings</h1>
              <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10 max-w-2xl">
                <p className="text-on-surface-variant">Manage your precision preferences and security settings.</p>
                {/* Profile editing */}
                <div className="mt-8 space-y-4">
                   <button className="px-6 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all">
                     Change Password
                   </button>
                </div>
              </div>
            </>
          )}
        </section>

      </main>
    </div>
  );
}