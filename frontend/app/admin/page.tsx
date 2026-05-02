'use client';

import Link from "next/link";

const STATS = [
  { label: 'Total Revenue', value: '$1,001', icon: 'payments', trend: '+100%', color: 'text-primary' },
  { label: 'Active Orders', value: '2', icon: 'shopping_cart', trend: 'Processing', color: 'text-secondary' },
  { label: 'Low Stock Alerts', value: '1', icon: 'warning', trend: 'Action required', color: 'text-error' },
  { label: 'New Customers', value: '3', icon: 'group', trend: '+18%', color: 'text-primary' },
];

const RECENT_ALERTS = [
  { id: 1, msg: 'Macbook Super Pro Max 1 is running low on stock (2 units left)', type: 'warning' },
  { id: 2, msg: 'New order #SB-99285 received from John Doe', type: 'info' },
  { id: 3, msg: 'System backup completed successfully', type: 'success' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-primary">System Overview</h1>
          <p className="text-on-surface-variant mt-1">Welcome back, Admin. Here is what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/products/add" 
            className="cta-gradient text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-[0.98] transition-all text-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-surface-container-low ${stat.color}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                stat.trend.includes('+') ? 'bg-green-100 text-green-700' : 'bg-surface-container text-on-surface-variant'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{stat.label}</p>
              <p className="text-3xl font-extrabold text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">notifications_active</span>
            System Alerts
          </h2>
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 divide-y divide-outline-variant/5 overflow-hidden">
            {RECENT_ALERTS.map((alert) => (
              <div key={alert.id} className="p-6 flex items-center gap-4 hover:bg-surface-container-low/20 transition-colors">
                <span className={`material-symbols-outlined ${
                  alert.type === 'warning' ? 'text-error' : alert.type === 'success' ? 'text-green-600' : 'text-primary'
                }`}>
                  {alert.type === 'warning' ? 'error' : alert.type === 'success' ? 'check_circle' : 'info'}
                </span>
                <p className="text-sm font-medium text-primary flex-1">{alert.msg}</p>
                <button className="text-xs font-bold text-on-surface-variant hover:text-primary uppercase tracking-widest">
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-primary">Quick Navigation</h2>
          <div className="bg-primary text-white p-8 rounded-3xl shadow-xl space-y-6">
            <p className="text-sm opacity-80 leading-relaxed">
              Manage your hardware catalog or review pending customer orders from the main terminal.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/admin/products" className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-center font-bold transition-all">
                Manage Inventory
              </Link>
              <Link href="/admin/orders" className="w-full py-3 bg-white text-primary rounded-xl text-center font-bold transition-all shadow-lg">
                Pending Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}