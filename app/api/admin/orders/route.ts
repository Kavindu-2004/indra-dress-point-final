// app/api/admin/orders/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptionsAdmin } from "@/lib/auth-admin";

export const runtime = "nodejs";

const ALLOWED = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type AllowedStatus = (typeof ALLOWED)[number];

function isAdminEmail(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // DEV MODE: if not set, allow
  if (list.length === 0) return true;

  return !!email && list.includes(email.toLowerCase());
}

async function requireAdmin() {
  const session = await getServerSession(authOptionsAdmin);
  if (!isAdminEmail(session?.user?.email)) return null;
  return session;
}

export async function GET(_req: NextRequest) {
  try {
    const ok = await requireAdmin();
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: { include: { images: true, category: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (e: any) {
    console.error("ADMIN GET ORDERS ERROR:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to load orders" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const ok = await requireAdmin();
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const id = Number(body?.id);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Missing/invalid order id" }, { status: 400 });
    }

    const statusRaw = String(body?.status || "").toUpperCase();
    const status = (ALLOWED.includes(statusRaw as AllowedStatus)
      ? (statusRaw as AllowedStatus)
      : null);

    if (!status) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const trackingNumber =
      typeof body?.trackingNumber === "string" ? body.trackingNumber.trim() : null;

    const trackingUrl =
      typeof body?.trackingUrl === "string" ? body.trackingUrl.trim() : null;

    const existing = await prisma.order.findUnique({
      where: { id },
      select: { shippedAt: true, deliveredAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const data: any = {
      status,
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || null,
    };

    // set timestamps only once
    if (status === "SHIPPED" && !existing.shippedAt) data.shippedAt = new Date();
    if (status === "DELIVERED" && !existing.deliveredAt) data.deliveredAt = new Date();

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: { include: { images: true, category: true } },
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("ADMIN UPDATE ORDER ERROR:", e);
    return NextResponse.json(
      { error: e?.message || "Update failed" },
      { status: 500 }
    );
  }
}