import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    const [products, orders, feedbacks, subscribers] = await Promise.all([
      prisma.product.findMany({
        include: {
          inventory: true,
          category: true,
        },
      }),
      prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.feedback.findMany({
        include: {
          user: true,
        },
      }),
      prisma.newsletter.findMany(),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);

    const lines: string[] = [];

    lines.push("ADMIN ANALYZER REPORT");
    lines.push(`Generated At,${escapeCsv(new Date().toLocaleString())}`);
    lines.push("");

    lines.push("SUMMARY");
    lines.push(`Total Products,${escapeCsv(products.length)}`);
    lines.push(`Total Orders,${escapeCsv(orders.length)}`);
    lines.push(`Total Revenue,${escapeCsv(totalRevenue)}`);
    lines.push(`Total Feedbacks,${escapeCsv(feedbacks.length)}`);
    lines.push(`Total Subscribers,${escapeCsv(subscribers.length)}`);
    lines.push("");

    lines.push("ORDER STATUS");
    lines.push(`Processing,${escapeCsv(orders.filter((o) => String(o.status) === "PROCESSING").length)}`);
    lines.push(`Shipped,${escapeCsv(orders.filter((o) => String(o.status) === "SHIPPED").length)}`);
    lines.push(`Delivered,${escapeCsv(orders.filter((o) => String(o.status) === "DELIVERED").length)}`);
    lines.push(`Cancelled,${escapeCsv(orders.filter((o) => String(o.status) === "CANCELLED").length)}`);
    lines.push("");

    lines.push("TOP PRODUCTS");
    lines.push("Product Name,Quantity Sold");

    const productMap = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items) {
        const name = item.product?.name || item.name || "Unknown Product";
        productMap.set(name, (productMap.get(name) || 0) + Number(item.qty ?? 0));
      }
    }

    const topProducts = Array.from(productMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    for (const item of topProducts) {
      lines.push(`${escapeCsv(item.name)},${escapeCsv(item.qty)}`);
    }

    const csv = lines.join("\n");
    const fileName = `admin-analyzer-report-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Analyzer download error:", error);
    return NextResponse.json(
      { error: "Failed to download analyzer report" },
      { status: 500 }
    );
  }
}