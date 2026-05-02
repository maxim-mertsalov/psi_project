'use client';

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkoutApi, paymentApi } from "../services/api";
import { ApiError } from "../types/dto/errors";
import { CheckoutReq } from "../types/dto/checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const { totalPrice } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("smartbuy-user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    const checkoutRequest: CheckoutReq = {
      guestEmail: user?.email || formData.get("email") as string,
      shippingMethod: "STANDARD",
      shippingPrice: 0.00, // Константа для примера
      paymentMethod: "CREDIT_CARD",
      address: {
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        zipCode: formData.get("zip") as string,
        country: formData.get("country") as string
      }
    };

    try {
      const order = await checkoutApi.process(checkoutRequest);
      console.log("Order created:", order.orderId);

      const paymentSession = await paymentApi.initiate(order.orderId);
      
      if (paymentSession.redirectUrl && false) {
        localStorage.setItem('last_order_number', order.orderNumber);
        
        window.location.href = paymentSession.redirectUrl;
      } else {
        router.push(`/confirmation?orderNumber=${order.orderNumber}`);
      }

  } catch (err: ApiError | unknown) {
    alert(`Error during checkout process: ${(err as ApiError).message}`);
  } finally {
    setIsLoading(false);
  }
  };

  return (
    <div className="bg-surface min-h-screen">
      <main className="max-w-screen-xl mx-auto px-6 py-12">
        <form className="grid grid-cols-1 lg:grid-cols-12 gap-12" onSubmit={handleCheckout}>
          
          {/* Левая колонка: Формы */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Contact data */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">contact_mail</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
                {user ? <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Email Address</div>
                    <div className="w-full bg-surface-container-low border-none py-3 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none">
                      {user.email}
                    </div>
                </div> : <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Email Address</label>
                    <input name="email" className="w-full bg-surface-container-low border-none py-3 px-4 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" placeholder="johndoe@email.com"/>
                </div>}
                
              </div>
            </section>

            {/* Adress */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                Shipping Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10">
                <input name="firstName" className="w-full bg-surface-container-low border-none py-3 px-4 rounded-lg" placeholder="First Name"/>
                <input name="lastName" className="w-full bg-surface-container-low border-none py-3 px-4 rounded-lg" placeholder="Last Name"/>
                <input name="street" className="md:col-span-2 w-full bg-surface-container-low border-none py-3 px-4 rounded-lg" placeholder="Street Address & House Number"/>
                <input name="city" className="w-full bg-surface-container-low border-none py-3 px-4 rounded-lg" placeholder="City"/>
                <input name="zip" className="w-full bg-surface-container-low border-none py-3 px-4 rounded-lg" placeholder="ZIP Code"/>
                <input name="country" className="md:col-span-2 w-full bg-surface-container-low border-none py-3 px-4 rounded-lg" placeholder="Country"/>
              </div>
            </section>

            {/* Payment method */}
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Payment Method
              </h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-6 bg-surface-container-lowest border-2 border-primary rounded-2xl cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">credit_card</span>
                    <span className="font-bold">Credit Card</span>
                  </div>
                  <div className="w-4 h-4 rounded-full border-4 border-primary"></div>
                </label>
                <label className="flex items-center justify-between p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl cursor-pointer hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
                    <span className="font-bold text-on-surface-variant">Bank Transfer</span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-outline-variant"></div>
                </label>
              </div>
            </section>
          </div>

          {/* Total. Results */}
          <div className="lg:col-span-4">
            <div className="bg-primary text-white p-8 rounded-3xl sticky top-24 shadow-xl">
              <h3 className="text-lg font-bold mb-8">Order Summary</h3>
              
              <div className="space-y-4 mb-8 text-sm opacity-80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-sm opacity-60">Total Amount</span>
                  <span className="text-3xl font-extrabold">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button 
                disabled={isLoading}
                type="submit"
                className="block w-full bg-white text-primary text-center font-bold py-5 rounded-xl hover:bg-opacity-90 transition-all active:scale-[0.98]"
              >
                {isLoading ? "Processing..." : "Confirm Order"}
              </button>
              
              <p className="text-[10px] text-center mt-6 opacity-40 uppercase tracking-widest leading-relaxed">
                By confirming the order, you agree to our <br/> Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}