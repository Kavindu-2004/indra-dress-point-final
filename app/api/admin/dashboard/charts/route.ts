import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RangeKey = "today" | "7d" | "30d" | "thisMonth" | "custom";

function getDateRange(
  range: RangeKey,
  fromParam?: string | null,
  toParam?: string | null
) {
  const now = new Date();
  let from = new Date();
  let to = new Date();

  if (range === "today") {
    from = new Date();
    from.setHours(0, 0, 0, 0);

    to = new Date();
    to.setHours(23, 59, 59, 999);
  } else if (range === "7d") {
    from = new Date();
    from.setDate(now.getDate() - 6);
    from.setHours(0, 0, 0, 0);

    to = new Date();
    to.setHours(23, 59, 59, 999);
  } else if (range === "30d") {
    from = new Date();
    from.setDate(now.getDate() - 29);
    from.setHours(0, 0, 0, 0);

    to = new Date();
    to.setHours(23, 59, 59, 999);
  } else if (range === "thisMonth") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    from.setHours(0, 0, 0, 0);

    to = new Date();
    to.setHours(23, 59, 59, 999);
  } else if (range === "custom" && fromParam && toParam) {
    from = new Date(fromParam);
    from.setHours(0, 0, 0, 0);

    to = new Date(toParam);
    to.setHours(23, 59, 59, 999);
  } else {
    from = new Date();
    from.setDate(now.getDate() - 6);
    from.setHours(0, 0, 0, 0);

    to = new Date();
    to.setHours(23, 59, 59, 999);
  }

  return { from, to };
}

function buildBuckets(
  range: RangeKey,
  from: Date,
  to: Date
): { key: string; label: string }[] {
  const buckets: { key: string; label: string }[] = [];

  if (range === "today") {
    for (let h = 0; h < 24; h++) {
      buckets.push({
        key: String(h),
        label: `${String(h).padStart(2, "0")}:00`,
      });
    }
    return buckets;
  }

  if (range === "7d" || range === "30d" || range === "custom") {
    const current = new Date(from);

    while (current <= to) {
      const key = `${current.getFullYear()}-${String(
        current.getMonth() + 1
      ).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

      const label = current.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      buckets.push({ key, label });
      current.setDate(current.getDate() + 1);
    }

    return buckets;
  }

  const year = from.getFullYear();
  const month = from.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= lastDay; day++) {
    const d = new Date(year, month, day);

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;

    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    buckets.push({ key, label });
  }

  return buckets;
}

function getBucketKey(date: Date, range: RangeKey) {
  if (range === "today") {
    return String(date.getHours());
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const range = (searchParams.get("range") || "7d") as RangeKey;
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const { from, to } = getDateRange(range, fromParam, toParam);
    const buckets = buildBuckets(range, from, to);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const salesMap = new Map<string, number>();
    const ordersMap = new Map<string, number>();
    const productMap = new Map<string, number>();

    for (const bucket of buckets) {
      salesMap.set(bucket.key, 0);
      ordersMap.set(bucket.key, 0);
    }

    for (const order of orders) {
      const created = new Date(order.createdAt);
      const bucketKey = getBucketKey(created, range);

      const total = Number((order as any).totalAmount ?? order.total ?? 0);

      salesMap.set(bucketKey, (salesMap.get(bucketKey) || 0) + total);
      ordersMap.set(bucketKey, (ordersMap.get(bucketKey) || 0) + 1);

      for (const item of (order as any).items || []) {
        const productName =
          item?.product?.name || item?.product?.title || "Other";

        const qty = Number(
          item?.quantity ??
            item?.qty ??
            item?.count ??
            item?.productQty ??
            1
        );

        productMap.set(productName, (productMap.get(productName) || 0) + qty);
      }
    }

    const salesData = buckets.map((bucket) => ({
      label: bucket.label,
      sales: salesMap.get(bucket.key) || 0,
    }));

    const ordersData = buckets.map((bucket) => ({
      label: bucket.label,
      orders: ordersMap.get(bucket.key) || 0,
    }));

    const topProducts = Array.from(productMap.entries())
      .map(([name, value]) => ({
        name,
        value: Number(value) || 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return NextResponse.json({
      salesData,
      ordersData,
      topProducts,
    });
  } catch (error) {
    console.error("Dashboard charts error:", error);
    return NextResponse.json(
      {
        salesData: [],
        ordersData: [],
        topProducts: [],
      },
      { status: 200 }
    );
  }
}