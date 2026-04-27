import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    const header = [
      "Feedback ID",
      "User ID",
      "User Name",
      "User Email",
      "Message",
      "Status",
      "Created At",
      "Updated At",
    ];

    const rows = feedbacks.map((feedback) => [
      feedback.id,
      feedback.userId,
      feedback.user?.name || "",
      feedback.user?.email || "",
      feedback.message || "",
      feedback.status || "",
      new Date(feedback.createdAt).toLocaleString(),
      new Date(feedback.updatedAt).toLocaleString(),
    ]);

    const csv = [
      header.join(","),
      ...rows.map((row) => row.map((value) => escapeCsv(value)).join(",")),
    ].join("\n");

    const fileName = `feedback-report-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download feedback report error:", error);
    return NextResponse.json(
      { error: "Failed to download feedback report" },
      { status: 500 }
    );
  }
}