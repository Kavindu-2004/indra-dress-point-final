// app/(store)/category/[slug]/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CategoryProductGrid from "@/components/CategoryProductGrid";

export const runtime = "nodejs";

type SortKey = "newest" | "oldest" | "priceLowHigh" | "priceHighLow";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; filter?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const sort = (resolvedSearchParams?.sort || "newest") as SortKey;
  const filter = resolvedSearchParams?.filter || "";

  if (!slug) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold">Category</h1>
        <p className="text-gray-600 mt-2">Missing category slug.</p>
      </div>
    );
  }

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold">Not found</h1>
        <p className="text-gray-600 mt-2">No category for slug: {slug}</p>
      </div>
    );
  }

  let orderBy: any = { createdAt: "desc" };

  if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (sort === "priceLowHigh") {
    orderBy = { price: "asc" };
  } else if (sort === "priceHighLow") {
    orderBy = { price: "desc" };
  }

  const productsFromDb =
    slug === "new-arrivals"
      ? await prisma.product.findMany({
          where: {
            isActive: true,
            ...(filter
              ? {
                  category: {
                    slug: filter,
                  },
                }
              : {}),
          },
          include: { images: true, category: true, inventory: true },
          orderBy,
          take: 20,
        })
      : await prisma.product.findMany({
          where: { isActive: true, categoryId: category.id },
          include: { images: true, category: true, inventory: true },
          orderBy,
        });

  const products = productsFromDb.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images?.[0]?.url ?? null,
  }));

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="text-gray-600 mt-1">
            {slug === "new-arrivals"
              ? "Latest 20 uploads"
              : "Products in this category"}
          </p>
        </div>

        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Back to Home
        </Link>
      </div>

      <form
        method="GET"
        className="flex flex-col md:flex-row gap-3 md:items-center"
      >
        {slug === "new-arrivals" && (
          <select
            name="filter"
            defaultValue={filter}
            className="rounded-xl border px-4 py-2 text-sm bg-white"
          >
            <option value="">All Categories</option>
            <option value="workwear">Workwear</option>
            <option value="dresses">Dresses</option>
            <option value="evening-wear">Evening Wear</option>
            <option value="accessories">Accessories</option>
          </select>
        )}

        <select
          name="sort"
          defaultValue={sort}
          className="rounded-xl border px-4 py-2 text-sm bg-white"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priceLowHigh">Price: Low to High</option>
          <option value="priceHighLow">Price: High to Low</option>
        </select>

        <button
          type="submit"
          className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
        >
          Apply
        </button>

        {slug === "new-arrivals" && (filter || sort !== "newest") && (
          <Link
            href="/category/new-arrivals"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 text-center"
          >
            Clear
          </Link>
        )}
      </form>

      <CategoryProductGrid products={products} />
    </div>
  );
}