import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";

    let orderBy: any = { createdAt: "desc" };

    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "priceLowHigh") {
      orderBy = { price: "asc" };
    } else if (sort === "priceHighLow") {
      orderBy = { price: "desc" };
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        AND: [
          search
            ? {
                name: {
                  contains: search,
                },
              }
            : {},
          category
            ? {
                category: {
                  name: {
                    contains: category,
                  },
                },
              }
            : {},
        ],
      },
      include: {
        images: true,
        category: true,
      },
      orderBy,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json([], { status: 200 });
  }
}