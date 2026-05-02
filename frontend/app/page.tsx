"use client";

import ProductCard from "@/app/components/ui/ProductCard";
import { useEffect, useState } from "react";
import { catalogApi } from "./services/api";
import { GetProductsQuery, ProductSummaryRes } from "./types/dto/catalog";
import { useSearchParams } from 'next/navigation'


export default function HomePage() {
  const [products, setProducts] = useState<ProductSummaryRes[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams()
 
  const q = searchParams.get('q')

  const [query, setQuery] = useState<GetProductsQuery>({
    q: q || undefined,
    available: "true",
    minPrice: undefined,
    maxPrice: undefined
  });

  useEffect(() => {
    catalogApi.getProducts(query)
      .then((p) => setProducts(p.filter(pr => pr.stockAvailable > 0 && pr.available)))
      .catch(console.error)
      .finally(() => {
        setLoading(false)
      });
  }, [query]);

  if (loading) return <div className="pt-32 text-center font-bold">Loading precision hardware...</div>;

  console.log("Fetched products:", products);


  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const minPrice = formData.get("min_price") as string;
    const maxPrice = formData.get("max_price") as string;

    if (minPrice && minPrice !== "0") setQuery({...query, minPrice: parseFloat(minPrice)}) ;
    if (maxPrice && maxPrice !== "0") setQuery({...query, maxPrice: parseFloat(maxPrice)});

    setLoading(true);
    catalogApi.getProducts(query)
      .then((p) => setProducts(p.filter(pr => pr.stockAvailable > 0 && pr.available)))
      .catch(console.error)
      .finally(() => {
        setLoading(false)
      });
  };

  return (
    <main className="pt-24 pb-24 max-w-screen-2xl mx-auto px-6">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 h-fit sticky top-24 shrink-0 pr-4">
          <form onSubmit={handleFilterSubmit} className="bg-surface-container-low p-6 rounded-lg">
             <h2 className="text-lg font-bold text-slate-900 mb-4">Filter Catalog</h2>
             <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Min Price ($)</label>
                <input name="min_price" type="number" step="0.01" className="w-full bg-surface-container-low border-none py-4 px-4 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0.00"/>
            </div>
            <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Max Price ($)</label>
                <input name="max_price" type="number" step="0.01" className="w-full bg-surface-container-low border-none py-4 px-4 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0.00"/>
            </div>
            <div className="mt-5">
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg active:scale-[0.98] transition-all">
                Apply Filters
              </button>
            </div>

          </form>
        </aside>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Smartphones & Laptops</h1>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {products.map((product: ProductSummaryRes) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}