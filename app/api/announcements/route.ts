import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = (url.searchParams.get("page") || "home").toLowerCase();

    const now = new Date();

    const items = await prisma.announcement.findMany({
      where: {
        page,
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(items);
  } catch (e) {
    console.error("GET /api/announcements error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}