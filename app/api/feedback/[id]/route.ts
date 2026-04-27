import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    const body = await req.json();

    const updated = await prisma.feedback.update({
      where: { id: numericId },
      data: {
        status: body.status || "READ",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH feedback error:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    await prisma.feedback.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("DELETE feedback error:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}