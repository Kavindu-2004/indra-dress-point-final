import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const subscribers = await prisma.newsletter.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Failed to fetch subscribers:", error);
    return NextResponse.json([], { status: 200 });
  }
}