'use client';

import { catalogApi } from "@/app/services/api";
import { AdminProductUpsertReq } from "@/app/types/dto/catalog";
import { ApiError } from "next/dist/server/api-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload: AdminProductUpsertReq = {
      name: formData.get("name") as string,
      price: parseFloat(formData.get("price") as string),
      categoryId: parseInt(formData.get("categoryId") as string),
      stockQuantity: parseInt(formData.get("stockQuantity") as string),
      available: (formData.get("available") as string) ? true : false,
      description: formData.get("description") as string
    };

    catalogApi.adminCreate(payload)
      .then(() => {
        alert("Product created successfully!");
      })
      .catch((err: ApiError) => {
        alert(`Error creating product: ${err.message}`);
      });

    router.push('/admin/products');
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <Link href="/admin/products" className="text-primary font-bold text-sm flex items-center gap-2 mb-4 hover:underline">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Inventory
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tighter text-primary">Register New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/10 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Product Name</label>
              <input name="name" type="text" required className="w-full bg-surface-container-low border-none py-4 px-4 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Intel Core i9-14900K"/>
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Category</label>
              <select name="categoryId" className="w-full bg-surface-container-low border-none py-4 px-4 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer">
                <option value="0">Telefony</option>
                <option value="1">Notebooky</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Base Price ($)</label>
              <input name="price" type="number" step="0.01" required className="w-full bg-surface-container-low border-none py-4 px-4 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0.00"/>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Initial Stock</label>
              <input name="stockQuantity" type="number" required className="w-full bg-surface-container-low border-none py-4 px-4 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0"/>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">To show?</label>
              <input name="available" type="checkbox" className="bg-surface-container-low border-none py-4 px-4 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="https://..."/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Technical Description</label>
            <textarea name="description" rows={5} className="w-full bg-surface-container-low border-none py-4 px-4 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Enter detailed specifications..."></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/products" className="px-8 py-4 font-bold text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all">
            Cancel
          </Link>
          <button type="submit" className="cta-gradient text-white px-12 py-4 rounded-xl font-bold shadow-xl hover:opacity-95 transition-all active:scale-[0.98]">
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}