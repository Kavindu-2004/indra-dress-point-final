"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  createdAt?: string;
  category?: {
    name?: string;
    slug?: string;
  } | null;
  images?: {
    url: string;
  }[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        search,
        category,
        sort,
      });

      const res = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setCategory("");
    setSort("newest");
  }

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort]);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-sm text-gray-600 mt-1">
            Browse and discover all available styles
          </p>
        </div>

        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-black underline underline-offset-4"
        >
          ← Back to home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border px-4 py-3 text-sm"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border px-4 py-3 text-sm"
        >
          <option value="">All Categories</option>
          <option value="New Arrivals">New Arrivals</option>
          <option value="Workwear">Workwear</option>
          <option value="Dresses">Dresses</option>
          <option value="Evening Wear">Evening Wear</option>
          <option value="Accessories">Accessories</option>
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border px-4 py-3 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
        </select>

        <button
          onClick={fetchProducts}
          className="rounded-xl bg-black text-white px-4 py-3 text-sm hover:opacity-90"
        >
          Apply
        </button>

        <button
          onClick={clearFilters}
          className="rounded-xl border px-4 py-3 text-sm hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => {
            const img = product.images?.[0]?.url ?? null;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block"
              >
                <div className="rounded-2xl border bg-white overflow-hidden">
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    {img ? (
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-gray-400 text-sm">
                        Product Image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="text-sm font-medium group-hover:underline">
                      {product.name}
                    </div>

                    {product.category?.name && (
                      <div className="mt-1 text-xs text-gray-500">
                        {product.category.name}
                      </div>
                    )}

                    <div className="mt-2 text-sm font-semibold">
                      Rs {product.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}