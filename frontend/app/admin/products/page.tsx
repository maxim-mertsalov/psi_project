'use client';

import { catalogApi } from "@/app/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await catalogApi.adminList();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Destroy this component record?')) return;
    try {
      await catalogApi.adminDelete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  console.log("Admin products data:", products);

  if (loading) return <div className="pt-32 text-center font-bold">Loading inventory...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-primary">Products Inventory</h1>
          <p className="text-on-surface-variant mt-1">Manage your precision hardware catalog.</p>
        </div>
        <Link 
          href="/admin/products/add" 
          className="cta-gradient text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-xl active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Add New Product
        </Link>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low border-b border-outline-variant/10">
            <tr>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Product</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Stock</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Price</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-surface-container-low/30 transition-colors">
                <td className="p-6">
                  <div className="font-bold text-primary">{p.name}</div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">{p.category}</div>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.stockQuantity < 5 ? 'bg-error/10 text-error' : 'bg-green-100 text-green-700'}`}>
                    {p.stockQuantity} units {p.available ? 'showed' : 'hidden'}
                  </span>
                </td>
                <td className="p-6 text-right font-bold text-primary">${p.price.toFixed(2)}</td>
                <td className="p-6 text-right space-x-2">
                  <button 
                    onClick={() => router.push(`/admin/products/edit/${p.id}`)}
                    className="p-2 hover:bg-primary/5 rounded-lg text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="p-2 hover:bg-error/5 rounded-lg text-error transition-colors"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}