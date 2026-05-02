'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { name: 'Products', href: '/admin/products', icon: 'inventory_2' },
    { name: 'Orders', href: '/admin/orders', icon: 'shopping_cart_checkout' },
  ];

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-outline-variant/10 flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">
          SmartBuy <span className="text-on-surface-variant font-medium text-sm ml-2 uppercase tracking-widest italic">Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
          <span className="text-sm font-bold text-primary">System Admin</span>
        </div>
      </nav>

      <div className="flex pt-20 h-full flex-1">
        {/* Sidebar */}
        <aside className="w-64 hidden lg:flex flex-col sticky top-20 h-[calc(100vh-80px)] bg-surface-container-lowest border-r border-outline-variant/10 p-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}