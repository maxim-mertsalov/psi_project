'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string>("");

  const { clearCart } = useCart();

  const user = localStorage.getItem("smartbuy-user");

  useEffect(() => {
    const num = searchParams.get("orderNumber") || localStorage.getItem('last_order_number');
    if (num) {
      setOrderNumber(num);
      if (localStorage.getItem('smartbuy-session-id')) {
        localStorage.removeItem('smartbuy-session-id');
        clearCart();
      }
    }
  }, [searchParams, clearCart]);

  
  return (
    <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
        <span className="material-symbols-outlined text-5xl text-primary">verified</span>
      </div>

      <h1 className="text-5xl font-extrabold tracking-tighter text-primary mb-4">
        Transaction Complete
      </h1>
      
      <p className="text-on-surface-variant text-lg mb-12 max-w-lg">
        The hardware procurement process has been initiated. Your order is now being synchronized with our logistics terminal.
      </p>

      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-8 mb-12 w-full max-w-md">
        <div className="text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">
            Reference Number
          </span>
          <span className="text-xl font-mono font-bold text-primary">
            {orderNumber || "PROCESSING..."}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        { user && <Link href="/profile" className="px-10 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all">
          Track in Dashboard
        </Link> }
        
        <Link href="/" className="px-10 py-4 bg-surface-container text-primary font-bold rounded-xl hover:bg-surface-container-high transition-all">
          Back to Store
        </Link>
      </div>
    </main>
  );
}