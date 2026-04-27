import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isFinite(id))
      : [];

    if (ids.length === 0) {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        isActive: true,
        price: true,
        inventory: {
          select: {
            qtyOnHand: true,
          },
        },
      },
    });

    const result = products.map((p) => ({
      id: p.id,
      stock: p.inventory?.qtyOnHand ?? 0,
      price: p.price ?? 0,
      isActive: p.isActive,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cart stock fetch error:", error);
    return NextResponse.json([], { status: 200 });
  }
}