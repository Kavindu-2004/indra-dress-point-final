import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import BuyNowButton from "@/components/BuyNowButton";

export const runtime = "nodejs";

function safeParseId(v: unknown) {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : null;
}

export default async function ProductPage({
  params,
}: {
  // ✅ works for both old & new Next versions
  params: { id: string } | Promise<{ id: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = safeParseId(resolvedParams?.id);

  if (!id) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold">Invalid product</h1>
        <p className="text-gray-600 mt-2">Product id is not valid.</p>
      </div>
    );
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true, inventory: true },
  });

  if (!product) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-gray-600 mt-2">No product for id: {id}</p>
      </div>
    );
  }

  // You may also like (same category)
  const related = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    include: { images: true },
    orderBy: { createdAt: "desc" },
    take: 12, // ✅ get enough to safely show 4
  });

  const heroImg = product.images?.[0]?.url ?? null;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 space-y-12">
      {/* Top nav back */}
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to home
        </Link>

        {product.category?.slug && (
          <Link
            href={`/category/${product.category.slug}`}
            className="text-sm text-gray-600 hover:text-black"
          >
            View {product.category.name}
          </Link>
        )}
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT: Gallery */}
        <ProductGallery images={product.images ?? []} />

        {/* RIGHT: Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>

            <div className="mt-3 text-2xl font-semibold">
              Rs {product.price.toLocaleString()}
            </div>

            {product.category?.name && (
              <div className="mt-2 text-sm text-gray-500">
                Category: {product.category.name}
              </div>
            )}
          </div>

          {/* Size (UI only for now) */}
          <div className="space-y-2">
            <div className="text-xs font-semibold tracking-widest text-gray-600 uppercase">
              Select size
            </div>

            <div className="flex flex-wrap gap-2">
              {["XS", "S", "M", "L", "XL"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="px-4 py-2 rounded-lg border text-sm hover:bg-black hover:text-white transition"
                >
                  {s}
                </button>
              ))}
            </div>

            <Link
              href="/size-guide"
              className="inline-block text-sm text-gray-600 hover:text-black underline underline-offset-4"
            >
              Size Chart
            </Link>
          </div>

          {/* Description */}
          {product.description && (
            <div className="rounded-2xl border bg-white p-5">
              <div className="text-xs font-semibold tracking-widest text-gray-600 uppercase">
                Description
              </div>
              <p className="mt-3 text-gray-700 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="space-y-3">
            <AddToCartButton
              id={product.id}
              name={product.name}
              price={product.price}
              image={heroImg}
            />

            <BuyNowButton
              id={product.id}
              name={product.name}
              price={product.price}
              image={heroImg}
            />

            <p className="text-xs text-gray-500">
              Payment gateway (PayHere) will be connected later.
            </p>
          </div>
        </div>
      </div>

      {/* You may also like */}
      {related.length > 0 && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">You may also like</h2>
            <p className="text-gray-600 text-sm mt-2">
              Similar styles from this category
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.slice(0, 4).map((p) => {
              const img = p.images?.[0]?.url ?? null;

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group block"
                >
                  <div className="rounded-2xl border bg-white overflow-hidden">
                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-gray-400 text-sm">
                          Product Image
                        </div>
                      )}

                      {/* ✅ Quick View (ONLY ADDED THIS BLOCK) */}
                      <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200">
                        <div className="w-full rounded-full bg-black text-white text-sm py-2 text-center">
                          Quick view
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="text-sm font-medium group-hover:underline">
                        {p.name}
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        Rs {p.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}