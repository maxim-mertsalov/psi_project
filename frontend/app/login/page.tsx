'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "../services/api";
import { ApiError } from "next/dist/server/api-utils";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const data = await authApi.login({ email, password });
      
      localStorage.setItem("smartbuy-auth-token", data.token);
      localStorage.setItem("smartbuy-user", JSON.stringify({
        name: data.name,
        role: data.role,
        email: data.email
      }));

      if (data.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/profile');
      }
      
      router.refresh(); 
    } catch (err: ApiError | unknown) {
      setError((err as ApiError).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <main className="pt-24 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-outline-variant/15 overflow-hidden rounded-2xl border border-outline-variant/10 shadow-sm">
          
          {/* Sign In */}
          <section className="bg-surface-container-lowest p-10 md:p-16">
            <h2 className="text-3xl font-extrabold text-primary mb-8 tracking-tight">Sign In</h2>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm font-bold">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Email Address
                </label>
                <input 
                  name="email"
                  type="email" 
                  required
                  className="w-full px-4 py-4 bg-surface-container-low border border-transparent focus:border-primary/20 focus:bg-white rounded-lg outline-none transition-all"
                  placeholder="johndoe@email.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Password
                </label>
                <input 
                  name="password"
                  type="password" 
                  required
                  className="w-full px-4 py-4 bg-surface-container-low border border-transparent focus:border-primary/20 focus:bg-white rounded-lg outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-5 rounded-xl hover:opacity-95 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : "Sign In"}
              </button>
              
              <div className="text-center">
                <Link href="/forgot-password" hidden className="text-sm text-on-surface-variant hover:text-primary underline underline-offset-4">
                  Forgot password?
                </Link>
              </div>
            </form>
          </section>

          {/* New Customer */}
          <section className="bg-surface-container-low p-10 md:p-16 flex flex-col justify-center">
            <div className="max-w-sm">
              <h2 className="text-3xl font-extrabold text-primary mb-6 tracking-tight">New Customer?</h2>
              <p className="text-on-surface-variant leading-relaxed mb-10 text-lg">
                Join SmartBuy for a tailored engineering experience. Track your orders, save precision components, and get early access to technical releases.
              </p>
              <Link 
                href="/register" 
                className="block w-full border-2 border-primary text-primary py-4 px-8 font-bold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-[0.98] text-center"
              >
                Create Account
              </Link>
            </div>
            
            {/* Advantages */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-lg">verified</span>
                Expert Support
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-lg">history</span>
                Order Tracking
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}