import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const now = new Date();
    let from = new Date();
    let to = new Date(now);

    if (range === "today") {
      from = new Date();
      from.setHours(0, 0, 0, 0);

      to = new Date();
      to.setHours(23, 59, 59, 999);
    } else if (range === "7d") {
      from.setDate(now.getDate() - 7);
    } else if (range === "30d") {
      from.setDate(now.getDate() - 30);
    } else if (range === "thisMonth") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date();
      to.setHours(23, 59, 59, 999);
    } else if (range === "custom") {
      if (!fromParam || !toParam) {
        return NextResponse.json(
          { error: "From and To dates are required for custom range" },
          { status: 400 }
        );
      }

      from = new Date(fromParam);
      from.setHours(0, 0, 0, 0);

      to = new Date(toParam);
      to.setHours(23, 59, 59, 999);
    } else {
      from.setDate(now.getDate() - 7);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const header = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Total Amount",
      "Status",
      "Created At",
    ];

    const rows = orders.map((order) => [
      order.id,
      order.user?.name || "N/A",
      order.user?.email || "N/A",
      order.total ?? 0,
      order.status || "N/A",
      new Date(order.createdAt).toLocaleString(),
    ]);

    const csv = [
      header.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const fileName =
      range === "custom" && fromParam && toParam
        ? `sales-report-${fromParam}-to-${toParam}.csv`
        : `sales-report-${range}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download report error:", error);
    return NextResponse.json(
      { error: "Failed to download report" },
      { status: 500 }
    );
  }
}