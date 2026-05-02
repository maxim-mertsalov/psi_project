'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <main className="pt-32 pb-24 px-6 max-w-screen-2xl mx-auto text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
          shopping_basket
        </span>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-on-surface-variant mb-8">Looks like you haven't added any precision components yet.</p>
        <Link href="/" className="px-8 py-3 bg-primary text-white font-bold rounded-lg inline-block">
          Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-24 px-6 max-w-screen-2xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2">Shopping Cart</h1>
        <p className="text-on-surface-variant">Review your selection of precision-engineered components.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Список товаров */}
        <div className="flex-grow space-y-8">
          <div className="bg-surface-container-low overflow-hidden rounded-xl border border-outline-variant/10">
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 border-b border-outline-variant/10 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {cart.map((item) => (
              <div key={item.itemId} className="grid grid-cols-1 md:grid-cols-12 gap-6 px-8 py-8 items-center bg-surface-container-lowest border-b border-outline-variant/5 last:border-0">
                {item.priceChanged && (
                <div className="absolute -top-2 left-6 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  Price Updated: Now ${item?.currentUnitPrice?.toFixed(2)}
                </div>
              )}
                <div className="md:col-span-6 flex items-center gap-6">
                  <div className="w-24 h-24 bg-surface-container-high rounded-lg overflow-hidden flex-shrink-0 relative">
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary leading-tight">{item.productName}</h3>
                    <p className="text-sm text-on-surface-variant mb-2 font-mono">SKU: {item.productId}</p>
                    <button 
                      onClick={() => removeItem(item.itemId)}
                      className="text-xs font-bold text-error uppercase tracking-tighter flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Remove
                    </button>
                  </div>
                </div>

                <div className="md:col-span-3 flex justify-center">
                  <div className="flex items-center border border-outline-variant/30 rounded-lg bg-surface">
                    <button 
                      onClick={() => updateQuantity(item.itemId, -1)}
                      className="p-2 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.itemId, 1)}
                      className="p-2 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
                </div>

                {/* Total price */}
                <div className="md:col-span-3 text-right">
                  <div className="text-xl font-bold text-primary">
                    ${(item.lineTotal.toFixed(2))}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    ${item.currentUnitPrice.toFixed(2)} per unit
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary of order */}
        <aside className="w-full lg:w-96">
          <div className="bg-surface-container-high p-8 rounded-2xl sticky top-24 border border-outline-variant/10 shadow-sm">
            <h2 className="text-xl font-bold text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-end">
                <span className="font-bold text-primary">Total</span>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-primary">
                    ${totalPrice.toFixed(2)}
                  </div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Including VAT</p>
                </div>
              </div>
            </div>

            <Link 
              href="/checkout" 
              className="block w-full py-5 bg-primary text-white font-bold text-center rounded-xl hover:opacity-95 transition-all active:scale-[0.98] shadow-lg mb-4"
            >
              Proceed to Checkout
            </Link>
            
            <Link 
              href="/" 
              className="block w-full py-3 text-primary font-bold text-center text-sm hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}