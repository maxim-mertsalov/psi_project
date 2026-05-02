'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "../services/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const first_name = formData.get("name") as string;
    const last_name = formData.get("last_name") as string;
    const name = `${first_name} ${last_name}`;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Registering user:", { name, email });

    try {
      const data = await authApi.register({ name, email, password });
      
      localStorage.setItem("smartbuy-auth-token", data.token);
      localStorage.setItem("smartbuy-user", JSON.stringify({
        name: data.name,
        role: data.role,
        email: data.email
      }));

      router.push('/profile');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <main className="pt-24 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-outline-variant/15 overflow-hidden rounded-2xl border border-outline-variant/10 shadow-sm">
          
          {/* Create account */}
          <section className="bg-surface-container-lowest p-10 md:p-16">
            <h2 className="text-3xl font-extrabold text-primary mb-2 tracking-tight">Create Account</h2>
            <p className="text-on-surface-variant mb-8">Start your professional procurement journey.</p>

            {error && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm font-bold">
                {error}
              </div>
            )}
            
            <form className="space-y-5" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">First Name</label>
                  <input name="name" type="text" required className="w-full px-4 py-4 bg-surface-container-low border border-transparent focus:border-primary/20 focus:bg-white rounded-lg outline-none transition-all" placeholder="John"/>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Last Name</label>
                  <input name="last_name" type="text" required className="w-full px-4 py-4 bg-surface-container-low border border-transparent focus:border-primary/20 focus:bg-white rounded-lg outline-none transition-all" placeholder="Doe"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Email Address</label>
                <input name="email" type="email" required className="w-full px-4 py-4 bg-surface-container-low border border-transparent focus:border-primary/20 focus:bg-white rounded-lg outline-none transition-all" placeholder="johndoe@email.com"/>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Password</label>
                <input name="password" type="password" required className="w-full px-4 py-4 bg-surface-container-low border border-transparent focus:border-primary/20 focus:bg-white rounded-lg outline-none transition-all" placeholder="••••••••"/>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-bold py-5 rounded-xl hover:opacity-95 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : "Create Account"}
              </button>
            </form>
          </section>

          {/* Right side. Info. Login */}
          <section className="bg-surface-container-low p-10 md:p-16 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold text-primary mb-6 tracking-tight">Already a member?</h2>
            <p className="text-on-surface-variant leading-relaxed mb-10 text-lg">
              Sign in to access your saved configurations, order history, and technical support dashboard.
            </p>
            <Link 
              href="/login" 
              className="w-full border-2 border-primary text-primary py-4 px-8 font-bold rounded-xl hover:bg-primary hover:text-white transition-all active:scale-[0.98] text-center"
            >
              Sign In to My Account
            </Link>

            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                <span className="material-symbols-outlined text-primary">security</span>
                Enterprise-grade data protection
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                Real-time logistics tracking
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}