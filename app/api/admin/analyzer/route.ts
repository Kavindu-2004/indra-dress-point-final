import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: true,
        },
      }),
      prisma.newsletter.findMany(),
    ]);

    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalFeedbacks = feedbacks.length;
    const totalSubscribers = subscribers.length;

    const totalRevenue = orders.reduce((sum, order) => {
      return sum + Number(order.total ?? 0);
    }, 0);

    const orderStatus = [
      {
        name: "PROCESSING",
        value: orders.filter((o) => String(o.status) === "PROCESSING").length,
      },
      {
        name: "SHIPPED",
        value: orders.filter((o) => String(o.status) === "SHIPPED").length,
      },
      {
        name: "DELIVERED",
        value: orders.filter((o) => String(o.status) === "DELIVERED").length,
      },
      {
        name: "CANCELLED",
        value: orders.filter((o) => String(o.status) === "CANCELLED").length,
      },
    ];

    const lowStockItems = products
      .filter((p) => {
        const qty = Number(p.inventory?.qtyOnHand ?? 0);
        const threshold = Number(p.inventory?.lowStockThreshold ?? 0);
        return qty <= threshold;
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.inventory?.qtyOnHand ?? 0,
        category: p.category?.name ?? "",
      }));

    const salesMap = new Map<string, number>();

    for (const order of orders) {
      for (const item of order.items) {
        const name = item.product?.name || item.name || "Unknown Product";
        const qty = Number(item.qty ?? 0);
        salesMap.set(name, (salesMap.get(name) || 0) + qty);
      }
    }

    const topProducts = Array.from(salesMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return NextResponse.json({
      summary: {
        totalProducts,
        totalOrders,
        totalRevenue,
        totalFeedbacks,
        totalSubscribers,
        lowStockProducts: lowStockItems.length,
      },
      orderStatus,
      topProducts,
      lowStockItems,
      latestFeedbacks: feedbacks,
    });
  } catch (error) {
    console.error("Analyzer API error:", error);

    return NextResponse.json(
      {
        summary: {
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalFeedbacks: 0,
          totalSubscribers: 0,
          lowStockProducts: 0,
        },
        orderStatus: [],
        topProducts: [],
        lowStockItems: [],
        latestFeedbacks: [],
      },
      { status: 200 }
    );
  }
}