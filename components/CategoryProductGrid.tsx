"use client";

import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";

type ProductCard = {
  id: number;
  name: string;
  price: number;
  image: string | null;
};

export default function CategoryProductGrid({
  products,
}: {
  products: ProductCard[];
}) {
  if (products.length === 0) {
    return (
      <div className="border rounded-2xl p-10 text-center bg-gray-50">
        <p className="text-gray-700 font-medium">No products found.</p>
        <p className="text-gray-500 text-sm mt-1">
          Try another filter or add products from Admin → Products.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((p) => (
        <div
          key={p.id}
          className="p-card group rounded-2xl border bg-white overflow-hidden"
        >
          <Link href={`/products/${p.id}`} className="block">
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image}
                  alt={p.name}
                  className="p-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="p-img w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Product Image
                </div>
              )}

              <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200">
                <div className="w-full rounded-full bg-black text-white text-sm py-2 text-center">
                  Quick view
                </div>
              </div>
            </div>
          </Link>

          <div className="p-4">
            <Link href={`/products/${p.id}`} className="block">
              <div className="text-sm font-medium hover:underline">
                {p.name}
              </div>
            </Link>

            <div className="mt-1 text-sm font-semibold">
              Rs {Number(p.price).toLocaleString()}
            </div>

            <AddToCartButton
              id={p.id}
              name={p.name}
              price={Number(p.price)}
              image={p.image ?? undefined}
            />
          </div>
        </div>
      ))}
    </div>
  );
}