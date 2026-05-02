'use client';

import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product.id, 1);
  };

  return (
    <div 
      onClick={() => router.push(`/product/${product.id}`)}
      className="cursor-pointer group bg-surface-container-lowest premium-shadow overflow-hidden flex flex-col border border-transparent hover:border-outline-variant/15 transition-all duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-white p-8">
        {/* TODO: IMAGE::src */}
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
          <span className="text-slate-400">Product Image</span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-primary mb-2"><Link href={`/product/${product.id}`}></Link>{product.name}</h3>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</span>
          <button 
            onClick={handleAddToCart}
            className="cta-gradient p-3 rounded-sm text-white hover:shadow-lg transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}