"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


type Product = {
  id: number;
  name: string;
  description?: string | null;
  price?: number | null;
  category?: { name?: string; slug?: string } | null;
  images?: { url: string }[];
  inventory?: { qtyOnHand: number } | null;
};

const categories = [
  { name: "New Arrivals", slug: "new-arrivals" },
  { name: "Workwear", slug: "workwear" },
  { name: "Dresses", slug: "dresses" },
  { name: "Evening Wear", slug: "evening-wear" },
  { name: "Accessories", slug: "accessories" },
];

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<Product | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to add product");
      return;
    }

    formEl.reset();
    await load();
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product?")) return;

    const res = await fetch(`/api/admin/products?id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Delete failed");
      return;
    }

    await load();
  }

  async function handleDownloadProducts() {
    try {
      setDownloading(true);

      const res = await fetch("/api/admin/products/download", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.text().catch(() => "");
        alert(err || "Failed to download product list");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `products-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while downloading product list");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-gray-600 text-sm">Add products and upload images.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Link>

          <button
            onClick={handleDownloadProducts}
            disabled={downloading}
            className="inline-flex items-center rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
          >
            {downloading ? "Downloading..." : "Download Products"}
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <h2 className="font-semibold mb-4">Add Product</h2>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="text-sm font-medium">Product Name</label>
            <input
              name="name"
              className="mt-1 w-full border rounded-xl px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Price (LKR)</label>
            <input
              name="price"
              type="number"
              min="0"
              className="mt-1 w-full border rounded-xl px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Stock Qty</label>
            <input
              name="stock"
              type="number"
              min="0"
              defaultValue={0}
              className="mt-1 w-full border rounded-xl px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              name="categorySlug"
              className="mt-1 w-full border rounded-xl px-3 py-2"
              required
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              className="mt-1 w-full border rounded-xl px-3 py-2"
              rows={3}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Product Image</label>
            <input
              name="image"
              type="file"
              accept="image/*"
              className="mt-1 w-full"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border rounded-2xl p-6">
        <h2 className="font-semibold mb-4">All Products</h2>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr className="border-b">
                <th className="py-3">Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-3">
                    <div className="w-12 h-12 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center">
                      {p.images?.[0]?.url ? (
                        <img
                          src={p.images[0].url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No</span>
                      )}
                    </div>
                  </td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.category?.name || "No Category"}</td>
                  <td>Rs {Number(p.price ?? 0).toLocaleString()}</td>
                  <td>{p.inventory?.qtyOnHand ?? 0}</td>

                  <td className="text-right space-x-2 py-3">
                    <button
                      className="px-3 py-1 rounded-lg border hover:bg-gray-50"
                      onClick={() => setEditing(p)}
                    >
                      Edit
                    </button>

                    <button
                      className="px-3 py-1 rounded-lg border text-red-600 hover:bg-red-50"
                      onClick={() => deleteProduct(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <p className="text-gray-600 text-sm mt-4">
            No products yet. Add your first product above.
          </p>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Product</h3>
              <button
                className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50"
                onClick={() => setEditing(null)}
              >
                Close
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditLoading(true);

                const fd = new FormData(e.currentTarget);
                fd.set("id", String(editing.id));

                const res = await fetch("/api/admin/products", {
                  method: "PUT",
                  body: fd,
                });

                setEditLoading(false);

                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  alert(err.error || "Update failed");
                  return;
                }

                setEditing(null);
                await load();
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Product Name</label>
                <input
                  name="name"
                  defaultValue={editing.name}
                  className="mt-1 w-full border rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Price (LKR)</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={editing.price ?? 0}
                  className="mt-1 w-full border rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Stock Qty</label>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={editing.inventory?.qtyOnHand ?? 0}
                  className="mt-1 w-full border rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  name="categorySlug"
                  defaultValue={editing.category?.slug || ""}
                  className="mt-1 w-full border rounded-xl px-3 py-2"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  defaultValue={editing.description ?? ""}
                  className="mt-1 w-full border rounded-xl px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">
                  Replace Image (optional)
                </label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="mt-1 w-full"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}