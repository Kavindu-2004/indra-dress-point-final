import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // try get userId from DB (best)
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        // new correct orders
        user?.id ? { userId: user.id } : undefined,
        // old orders saved without userId
        { customerEmail: email },
      ].filter(Boolean) as any,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      currency: true,
      createdAt: true,
    },
  });

  return NextResponse.json(orders);
}