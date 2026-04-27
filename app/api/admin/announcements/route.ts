// app/api/admin/announcements/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptionsAdmin } from "@/lib/auth-admin";

export const runtime = "nodejs";

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
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error("GET /api/admin/announcements error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const title = String(body?.title || "").trim();
    const message = String(body?.message || "").trim();
    const page = String(body?.page || "home").trim().toLowerCase();

    // ✅ Accept both (UI might send active or isActive)
    const isActive = Boolean(body?.isActive ?? body?.active ?? true);

    const startsAt = body?.startsAt ? new Date(body.startsAt) : null;
    const endsAt = body?.endsAt ? new Date(body.endsAt) : null;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message required" },
        { status: 400 }
      );
    }

    const created = await prisma.announcement.create({
      data: { title, message, page, isActive, startsAt, endsAt },
    });

    return NextResponse.json(created);
  } catch (e) {
    console.error("POST /api/admin/announcements error:", e);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const id = Number(body?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { error: "Missing/invalid id" },
        { status: 400 }
      );
    }

    const data: any = {};
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.message !== undefined) data.message = String(body.message).trim();
    if (body.page !== undefined)
      data.page = String(body.page).trim().toLowerCase();

    // ✅ Accept both, store as isActive
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body.active !== undefined) data.isActive = Boolean(body.active);

    if (body.startsAt !== undefined)
      data.startsAt = body.startsAt ? new Date(body.startsAt) : null;
    if (body.endsAt !== undefined)
      data.endsAt = body.endsAt ? new Date(body.endsAt) : null;

    const updated = await prisma.announcement.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /api/admin/announcements error:", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");

    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { error: "Missing/invalid id" },
        { status: 400 }
      );
    }

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/announcements error:", e);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}