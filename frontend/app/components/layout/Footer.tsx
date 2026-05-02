import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-24 bg-slate-50 border-t border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 py-16 max-w-screen-2xl mx-auto">
        {/* Brand Section */}
        <div className="flex flex-col gap-4">
          <span className="font-bold text-slate-900 text-2xl tracking-tighter">
            SmartBuy
          </span>
          <p className="text-sm text-slate-500 leading-relaxed">
            The Precision Curator for high-end electronics. Curated for quality, 
            engineered for efficiency.
          </p>
        </div>

        {/* Shop Navigation */}
        <div className="flex flex-col gap-4">
          <span className="font-bold text-slate-900 text-sm uppercase tracking-widest">
            Shop
          </span>
          <nav className="flex flex-col gap-2">
            <Link 
              href="/category/processors" 
              className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
            >
              Laptops
            </Link>
            <Link 
              href="/category/graphics-cards" 
              className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
            >
              Phones
            </Link>
            <Link 
              href="/category/laptops" 
              className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
            >
              Clocks
            </Link>
          </nav>
        </div>

        {/* Support Section */}
        <div className="flex flex-col gap-4">
          <span className="font-bold text-slate-900 text-sm uppercase tracking-widest">
            Support
          </span>
          <nav className="flex flex-col gap-2">
            <Link 
              href="/policy/shipping" 
              className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
            >
              Shipping Policy
            </Link>
            <Link 
              href="/policy/privacy" 
              className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link 
              href="/terms" 
              className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </nav>
        </div>

        {/* Company Section */}
        <div className="flex flex-col gap-4">
          <span className="font-bold text-slate-900 text-sm uppercase tracking-widest">
            Company
          </span>
          <nav className="flex flex-col gap-2">
            <Link 
              href="/about" 
              className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
            >
              About Us
            </Link>
            <Link 
              href="/contact" 
              className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
            >
              Contact
            </Link>
            <Link 
              href="/admin" 
              className="text-slate-500 hover:text-slate-900 text-sm transition-colors"
            >
              Admin Dashboard
            </Link>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-8 py-8 max-w-screen-2xl mx-auto border-t border-slate-200">
        <p className="text-xs text-slate-400">
          © {currentYear} SmartBuy Precision Curator. All rights reserved.
        </p>
      </div>
    </footer>
  );
}