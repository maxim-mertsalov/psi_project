'use client';

import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { totalItems } = useCart();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();


  useEffect(() => {
    const savedUser = localStorage.getItem("smartbuy-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smartbuy-auth-token");
    localStorage.removeItem("smartbuy-user");
    setUser(null);
    window.location.href = "/";
  };

  const handleOnChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }

  const handleOnKeyDownSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
      router.refresh();
      window.location.reload();
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass-header shadow-sm border-b border-outline-variant/10">
      <div className="flex items-center justify-between px-6 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-slate-900">
            SmartBuy
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-slate-500 hover:text-slate-700 transition-colors">Categories</Link>
            <Link href="/" className="text-slate-500 hover:text-slate-700 transition-colors">Products</Link>
          </div>
        </div>
        
        <div className="flex-1 max-w-2xl mx-12 hidden lg:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              value={searchQuery}
              onChange={handleOnChangeSearch}
              onKeyDown={handleOnKeyDownSearch}
              type="text"
              placeholder="Search for precision electronics..." 
              className="w-full bg-surface-container-highest border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary-container text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="p-2 hover:bg-slate-50 rounded-full relative transition-all active:scale-95">
            <span className="material-symbols-outlined">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-lg transition-colors">
                <span className="material-symbols-outlined">account_circle</span>
                <span className="text-sm font-bold text-primary">{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="text-xs font-bold text-on-surface-variant hover:text-error uppercase">Exit</button>
            </div>
          ) : (
            <Link href="/login" className="p-2 hover:bg-slate-50 rounded-full">
              <span className="material-symbols-outlined">login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}