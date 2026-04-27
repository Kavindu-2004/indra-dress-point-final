import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const header = [
      "Order ID",
      "Order Number",
      "Customer Name",
      "Customer Email",
      "Phone",
      "Address",
      "City",
      "Postal Code",
      "Status",
      "Subtotal",
      "Shipping",
      "Total",
      "Tracking Number",
      "Tracking URL",
      "Items Count",
      "Items Qty",
      "Items",
      "Created At",
    ];

    const rows = orders.map((order) => {
      const itemsCount = order.items.length;
      const itemsQty = order.items.reduce((sum, item) => sum + item.qty, 0);

      const itemsText = order.items
        .map((item) => {
          const productName = item.product?.name || item.name || "Item";
          return `${productName} x${item.qty}`;
        })
        .join(" | ");

      return [
        order.id,
        order.orderNumber,
        order.customerName || "",
        order.customerEmail || "",
        order.phone || "",
        order.address || "",
        order.city || "",
        order.postalCode || "",
        order.status,
        order.subtotal,
        order.shipping,
        order.total,
        order.trackingNumber || "",
        order.trackingUrl || "",
        itemsCount,
        itemsQty,
        itemsText,
        new Date(order.createdAt).toLocaleString(),
      ];
    });

    const csv = [
      header.join(","),
      ...rows.map((row) => row.map((value) => escapeCsv(value)).join(",")),
    ].join("\n");

    const fileName = `orders-report-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download orders report error:", error);
    return NextResponse.json(
      { error: "Failed to download orders report" },
      { status: 500 }
    );
  }
}