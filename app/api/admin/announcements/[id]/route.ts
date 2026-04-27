import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).role !== "ADMIN") return null;
  return token;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: paramId } = await ctx.params;

  const id = String(paramId || "").trim();
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();

  const data: any = {};

  if (body.title !== undefined) data.title = String(body.title).trim();
  if (body.message !== undefined) data.message = String(body.message).trim();
  if (body.page !== undefined) {
    data.page = String(body.page).trim().toLowerCase();
  }

  if (body.isActive !== undefined) {
    data.isActive = Boolean(body.isActive);
  }

  if (body.startsAt !== undefined) {
    data.startsAt = body.startsAt ? new Date(body.startsAt) : null;
  }

  if (body.endsAt !== undefined) {
    data.endsAt = body.endsAt ? new Date(body.endsAt) : null;
  }

  const row = await prisma.announcement.update({
    where: { id: Number(id) },
    data,
  });

  return NextResponse.json(row);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: paramId } = await ctx.params;

  const id = String(paramId || "").trim();
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await prisma.announcement.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ ok: true });
}