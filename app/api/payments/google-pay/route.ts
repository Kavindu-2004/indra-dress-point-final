import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function makeOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${y}${m}${day}-${rnd}`;
}

type CleanCartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const paymentData = body?.paymentData;
    const cart = Array.isArray(body?.cart) ? body.cart : [];
    const customer = body?.customer ?? null;
    const amount = Number(body?.amount ?? 0);

    if (!paymentData) {
      return NextResponse.json(
        { error: "Missing Google Pay payment data" },
        { status: 400 }
      );
    }

    if (!cart.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const token =
      paymentData?.paymentMethodData?.tokenizationData?.token ?? null;

    if (!token) {
      return NextResponse.json(
        { error: "Missing Google Pay token" },
        { status: 400 }
      );
    }

    const cleanItems: CleanCartItem[] = cart
      .map((item: any) => {
        const id = Number(item?.id);
        const name = String(item?.name ?? "").trim();
        const price = Number(item?.price ?? 0);
        const qty = Number(item?.qty ?? 0);
        const image = item?.image ? String(item.image) : null;

        return { id, name, price, qty, image };
      })
      .filter(
        (item: CleanCartItem) =>
          Number.isFinite(item.id) &&
          item.id > 0 &&
          item.name &&
          item.price > 0 &&
          item.qty > 0
      );

    if (cleanItems.length === 0) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    const subtotal = cleanItems.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const shipping = 0;
    const total = amount || subtotal + shipping;

    const result = await prisma.$transaction(async (tx) => {
      for (const item of cleanItems) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
          include: { inventory: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.id}`);
        }

        if (!product.isActive) {
          throw new Error(`${product.name} is not available`);
        }

        const currentQty = product.inventory?.qtyOnHand ?? 0;

        if (currentQty < item.qty) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
      }

      const order = await tx.order.create({
        data: {
          orderNumber: makeOrderNumber(),
          status: "PROCESSING",
          customerName: customer?.name || "Google Pay Customer",
          customerEmail: customer?.email || "",
          address: customer?.address || "Google Pay Address",
          apartment: customer?.apartment || null,
          city: customer?.city || "N/A",
          postalCode: customer?.postalCode || null,
          phone: customer?.phone || null,
          notes: "Google Pay order",
          subtotal,
          shipping,
          total,
          items: {
            create: cleanItems.map((item) => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              qty: item.qty,
              image: item.image,
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

      return order;
    });

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId: result.id,
    });
  } catch (error: any) {
    console.error("Google Pay order creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}