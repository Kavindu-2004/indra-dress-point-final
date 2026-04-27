import AddToCartButton from "@/components/AddToCartButtonWrapper";
import Link from "next/link";
import { prisma } from "@/lib/prisma";



const categories = [
  {
    name: "New Arrivals",
    slug: "new-arrivals",
    image: "/categories/new-arrivals.jpg",
  },
  {
    name: "Workwear",
    slug: "workwear",
    image: "/categories/workwear.jpg",
  },
  {
    name: "Dresses",
    slug: "dresses",
    image: "/categories/dresses.jpg",
  },
  {
    name: "Evening Wear",
    slug: "evening-wear",
    image: "/categories/evening-wear.jpg",
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: "/categories/accessories.jpg",
  },
];

export default async function HomePage() {
  const now = new Date();

  const announcements = await prisma.announcement.findMany({
    where: {
      page: "home",
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 3,
  });

  // Featured Products - deterministic order
  const productsFromDb = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: true },
    take: 4,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  const demoProducts = productsFromDb.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images?.[0]?.url ?? null,
  }));

  // Trending items - deterministic order
  const trendingItems = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: {
      qty: true,
    },
    where: {
      productId: {
        not: null,
      },
    },
    orderBy: [
      {
        _sum: {
          qty: "desc",
        },
      },
      {
        productId: "desc",
      },
    ],
    take: 8,
  });

  const trendingProductIds = trendingItems
    .map((item) => item.productId)
    .filter((id): id is number => id !== null);

  const orderedTrendingProducts =
    trendingProductIds.length > 0
      ? await prisma.product.findMany({
          where: {
            id: {
              in: trendingProductIds,
            },
            isActive: true,
          },
          include: {
            images: true,
          },
          orderBy: [{ id: "desc" }],
        })
      : [];

  const sortedOrderedTrendingProducts = trendingProductIds
    .map((id) => orderedTrendingProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const usedTrendingIds = new Set(
    sortedOrderedTrendingProducts.map((p) => p.id)
  );

  const fallbackTrendingProducts =
    sortedOrderedTrendingProducts.length < 4
      ? await prisma.product.findMany({
          where: {
            isActive: true,
            id: {
              notIn: Array.from(usedTrendingIds),
            },
          },
          include: {
            images: true,
          },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 4 - sortedOrderedTrendingProducts.length,
        })
      : [];

  const trendingProducts = [
    ...sortedOrderedTrendingProducts,
    ...fallbackTrendingProducts,
  ]
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images?.[0]?.url ?? null,
    }));

  return (
    <div className="w-full">
      {announcements.length > 0 && (
        <div className="w-full border-b bg-white">
          <div className="max-w-[1280px] mx-auto px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm font-medium text-gray-900">
              {announcements[0].title}
              <span className="text-gray-600 font-normal">
                {" "}
                — {announcements[0].message}
              </span>
            </div>

            {announcements.length > 1 && (
              <div className="text-xs text-gray-600">
                +{announcements.length - 1} more announcement(s)
              </div>
            )}
          </div>
        </div>
      )}

      <section className="relative w-full h-[75vh] min-h-[500px] overflow-hidden">
        <img
          src="/banner.jpg"
          alt="Indra Dress Point Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 h-full flex items-center">
          <div className="max-w-3xl space-y-6 text-white">
            <p className="text-sm font-medium tracking-widest uppercase">
              INDRA DRESS POINT
            </p>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Designed for confidence.
              <br />
              Styled for you.
            </h1>

            <p className="text-lg text-gray-200">
              Discover new arrivals across dresses, workwear, and accessories.
            </p>

            <div className="flex gap-4 pt-4">
              <Link
                href="/category/new-arrivals"
                className="rounded-full bg-white text-black px-8 py-3 text-sm font-medium hover:opacity-90"
              >
                Shop New Arrivals
              </Link>

              <Link
                href="/category/dresses"
                className="rounded-full border border-white px-8 py-3 text-sm font-medium hover:bg-white hover:text-black transition"
              >
                View Dresses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-8">Shop by Category</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group relative rounded-2xl overflow-hidden h-44"
            >
              <img
                src={c.image}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition" />

              <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center">
                <div className="font-semibold text-lg">{c.name}</div>
                <div className="text-sm opacity-90 mt-1">Explore →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Featured Products</h2>

          <Link
            href="/category/new-arrivals"
            className="text-sm text-gray-600 hover:text-black"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          {demoProducts.map((p) => (
            <div key={p.id} className="group block">
              <div className="p-card rounded-2xl border bg-white overflow-hidden">
                <Link href={`/products/${p.id}`} className="block">
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                  <div className="text-sm font-medium">{p.name}</div>

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
            </div>
          ))}
        </div>
      </section>

      {trendingProducts.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold">Trending Now</h2>
              <p className="text-sm text-gray-500 mt-1">
                Based on most ordered products
              </p>
            </div>

            <Link
              href="/category/new-arrivals"
              className="text-sm text-gray-600 hover:text-black"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {trendingProducts.map((p) => (
              <div key={p.id} className="group block">
                <div className="p-card rounded-2xl border bg-white overflow-hidden">
                  <Link href={`/products/${p.id}`} className="block">
                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="p-img w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          Product Image
                        </div>
                      )}

                      <div className="absolute top-3 left-3 rounded-full bg-black text-white text-xs px-3 py-1">
                        Trending
                      </div>

                      <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-200">
                        <div className="w-full rounded-full bg-black text-white text-sm py-2 text-center">
                          Quick view
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="text-sm font-medium">{p.name}</div>

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
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}