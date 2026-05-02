"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { catalogApi } from "@/app/services/api";
import { useCart } from "@/app/context/CartContext";
import { notFound } from "next/navigation";
import { ProductDetailRes } from "@/app/types/dto/catalog";


export default function ProductPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetailRes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      catalogApi.getProduct(id as string)
        .then(setProduct)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="pt-40 text-center font-mono uppercase tracking-widest animate-pulse">Analyzing Component...</div>;

  if (!product) {
    notFound();
  }

  return (
    <main className="pt-24 max-w-screen-2xl mx-auto px-6 mb-24">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-sm text-on-surface-variant">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-on-surface font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Image */}
        <div className="lg:col-span-7 space-y-6">
          <div style={{height: 500}} className="bg-surface-container-lowest rounded overflow-hidden flex items-center justify-center p-12 border border-outline-variant/10">
            {/* TODO: Image */}
            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
               <span className="material-symbols-outlined text-9xl">image</span>
            </div>
          </div>
        </div>

        {/* Info-pandel (Sticky) */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
          <div className="space-y-4">
            {product && (
              <div className="inline-flex items-center px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-bold tracking-widest uppercase rounded-sm">
                PREMIUM
              </div>
            )}
            <h1 className="text-4xl font-extrabold tracking-tighter text-primary leading-tight">
              {product.name}
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-xl space-y-6 shadow-sm border border-outline-variant/10">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                {product.price > 200 && (
                  <span className="text-sm text-on-surface-variant line-through">
                    ${(product.price + 200).toFixed(2)}
                  </span>
                )}
                <div className="text-5xl font-bold tracking-tight text-primary">
                  ${product.price.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                className="flex-1 cta-gradient text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-[0.98] shadow-lg"
                onClick={() => addItem(product.id, 1)}
              >
                <span className="material-symbols-outlined">add_shopping_cart</span> 
                Add to Cart
              </button>
              <button className="p-4 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">favorite</span>
              </button>
            </div>
            
            <div className="pt-4 border-t border-outline-variant/10 flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                In stock and ready to ship
              </div>
              <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined">local_shipping</span>
                Free express delivery on orders over $500
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}