import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

type CleanCartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string | null;
};

function makeOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${y}${m}${day}-${rnd}`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    let sessionUserId = (session?.user as any)?.id || null;
    const sessionEmail = (session?.user as any)?.email
      ? String((session?.user as any)?.email).trim().toLowerCase()
      : null;

    const body = await req.json();

    let {
      customerEmail,
      customerName,
      address,
      apartment,
      city,
      postalCode,
      phone,
      notes,
      items,
    } = body;

    if (sessionEmail) {
      customerEmail = sessionEmail;
    } else {
      customerEmail = String(customerEmail || "").trim().toLowerCase();
    }

    if (!sessionUserId && sessionEmail) {
      const user = await prisma.user.findUnique({
        where: { email: sessionEmail },
        select: { id: true },
      });
      sessionUserId = user?.id ?? null;
    }

    if (!customerEmail || !address || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const cleanItems: CleanCartItem[] = items
      .map((i: any) => {
        const id = Number(i?.id);
        const name = String(i?.name ?? "").trim();
        const price = Number(i?.price ?? 0);
        const qty = Number(i?.qty ?? 0);
        const image = i?.image ? String(i.image) : null;

        return {
          id,
          name,
          price,
          qty,
          image,
        };
      })
      .filter(
        (i: CleanCartItem) =>
          Number.isFinite(i.id) &&
          i.id > 0 &&
          Boolean(i.name) &&
          i.price > 0 &&
          i.qty > 0
      );

    if (cleanItems.length === 0) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    const subtotal = cleanItems.reduce(
      (sum, i) => sum + i.price * i.qty,
      0
    );

    const shipping = 0;
    const total = subtotal + shipping;

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cleanItems) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
          include: {
            inventory: true,
          },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.name}`);
        }

        if (!product.isActive) {
          throw new Error(`${product.name} is not available`);
        }

        const currentStock = product.inventory?.qtyOnHand ?? 0;

        if (currentStock < item.qty) {
          throw new Error(
            `Not enough stock for ${product.name}. Available: ${currentStock}`
          );
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber: makeOrderNumber(),
          status: "PROCESSING",
          userId: sessionUserId,
          customerEmail,
          customerName: customerName ? String(customerName).trim() : null,
          address: String(address).trim(),
          apartment: apartment ? String(apartment).trim() : null,
          city: String(city).trim(),
          postalCode: postalCode ? String(postalCode).trim() : null,
          phone: phone ? String(phone).trim() : null,
          notes: notes ? String(notes).trim() : null,
          subtotal,
          shipping,
          total,
          items: {
            create: cleanItems.map((i) => ({
              productId: i.id,
              name: i.name,
              price: i.price,
              qty: i.qty,
              image: i.image,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cleanItems) {
        await tx.inventory.update({
          where: { productId: item.id },
          data: {
            qtyOnHand: {
              decrement: item.qty,
            },
          },
        });
      }

      return createdOrder;
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("ORDER ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Order failed" },
      { status: 500 }
    );
  }
}