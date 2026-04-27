// app/api/admin/reports/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptionsAdmin } from "@/lib/auth-admin";

export const runtime = "nodejs";

type RangeKey = "today" | "7d" | "30d" | "thisMonth" | "custom";
type GroupKey = "hour" | "day";

function isAdminEmail(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (list.length === 0) return true; // dev mode
  return !!email && list.includes(String(email).toLowerCase());
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function toISO(d: Date) {
  return d.toISOString();
}

function parseDateParam(v: string | null) {
  if (!v) return null;
  const dt = new Date(v);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function getRange(req: NextRequest): {
  range: RangeKey;
  from: Date;
  to: Date;
  groupBy: GroupKey;
} {
  const url = new URL(req.url);
  const range = (url.searchParams.get("range") || "7d") as RangeKey;

  const now = new Date();

  if (range === "today") {
    return { range, from: startOfDay(now), to: endOfDay(now), groupBy: "hour" };
  }

  if (range === "thisMonth") {
    return { range, from: startOfMonth(now), to: now, groupBy: "day" };
  }

  if (range === "custom") {
    const fromParam = parseDateParam(url.searchParams.get("from"));
    const toParam = parseDateParam(url.searchParams.get("to"));
    const from = fromParam ? fromParam : new Date(now.getTime() - 7 * 86400000);
    const to = toParam ? toParam : now;

    // if custom is within 2 days, group by hour, else day
    const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));
    return { range, from, to, groupBy: days <= 2 ? "hour" : "day" };
  }

  if (range === "30d") {
    const from = new Date(now.getTime() - 30 * 86400000);
    return { range, from, to: now, groupBy: "day" };
  }

  // default 7d
  const from = new Date(now.getTime() - 7 * 86400000);
  return { range: "7d", from, to: now, groupBy: "day" };
}

function fmtLabel(d: Date, groupBy: GroupKey) {
  if (groupBy === "hour") {
    // 09:00, 12:00...
    const h = String(d.getHours()).padStart(2, "0");
    return `${h}:00`;
  }
  // Mon, Tue... OR 2026-03-01 style?
  // Keep stable & easy: yyyy-mm-dd
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function bucketKey(d: Date, groupBy: GroupKey) {
  if (groupBy === "hour") {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
  }
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function sumNumber(n: any) {
  return Number(n || 0);
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptionsAdmin);

    if (!isAdminEmail(session?.user?.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { from, to, groupBy, range } = getRange(req);

    // ✅ Pull orders (with items) in range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      select: {
        id: true,
        status: true,
        total: true,
        shipping: true,
        createdAt: true,
        customerEmail: true,
        customerName: true,
        city: true,
        items: {
          select: {
            id: true,
            qty: true,
            price: true,
            name: true,
            productId: true,
            product: {
              select: {
                id: true,
                name: true,
                category: { select: { name: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5000, // safety guard (increase if you need)
    });

    // --------------------
    // KPIs
    // --------------------
    const totalRevenue = orders.reduce((s, o) => s + sumNumber(o.total), 0);
    const totalOrders = orders.length;
    const shippingCollected = orders.reduce((s, o) => s + sumNumber(o.shipping), 0);

    const itemsSold = orders.reduce((s, o) => {
      const q = o.items.reduce((a, it) => a + sumNumber(it.qty), 0);
      return s + q;
    }, 0);

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Customers (basic: new vs returning within this range)
    const byEmail = new Map<string, { orders: number; spent: number; name: string; city: string }>();
    for (const o of orders) {
      const email = String(o.customerEmail || "").trim().toLowerCase();
      if (!email) continue;
      const cur = byEmail.get(email) || {
        orders: 0,
        spent: 0,
        name: o.customerName || "",
        city: o.city || "",
      };
      cur.orders += 1;
      cur.spent += sumNumber(o.total);
      if (!cur.name && o.customerName) cur.name = o.customerName;
      if (!cur.city && o.city) cur.city = o.city;
      byEmail.set(email, cur);
    }
    const newCustomers = Array.from(byEmail.values()).filter((x) => x.orders === 1).length;
    const returningCustomers = Array.from(byEmail.values()).filter((x) => x.orders >= 2).length;

    // --------------------
    // Series (revenue/orders/items) grouped by hour or day
    // --------------------
    const revenueBuckets = new Map<string, { label: string; value: number; sort: number }>();
    const ordersBuckets = new Map<string, { label: string; value: number; sort: number }>();
    const itemsBuckets = new Map<string, { label: string; value: number; sort: number }>();

    for (const o of orders) {
      const dt = new Date(o.createdAt);
      const key = bucketKey(dt, groupBy);

      const sort = groupBy === "hour"
        ? new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours()).getTime()
        : new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();

      const label = fmtLabel(dt, groupBy);

      // revenue
      const r = revenueBuckets.get(key) || { label, value: 0, sort };
      r.value += sumNumber(o.total);
      revenueBuckets.set(key, r);

      // orders count
      const oc = ordersBuckets.get(key) || { label, value: 0, sort };
      oc.value += 1;
      ordersBuckets.set(key, oc);

      // items sold
      const itQty = o.items.reduce((a, it) => a + sumNumber(it.qty), 0);
      const ic = itemsBuckets.get(key) || { label, value: 0, sort };
      ic.value += itQty;
      itemsBuckets.set(key, ic);
    }

    const seriesRevenue = Array.from(revenueBuckets.values())
      .sort((a, b) => a.sort - b.sort)
      .map(({ label, value }) => ({ label, value }));

    const seriesOrders = Array.from(ordersBuckets.values())
      .sort((a, b) => a.sort - b.sort)
      .map(({ label, value }) => ({ label, value }));

    const seriesItems = Array.from(itemsBuckets.values())
      .sort((a, b) => a.sort - b.sort)
      .map(({ label, value }) => ({ label, value }));

    // --------------------
    // Status breakdown
    // --------------------
    const statusMap = new Map<string, { status: string; orders: number; revenue: number }>();
    for (const o of orders) {
      const s = String(o.status || "PROCESSING").toUpperCase();
      const cur = statusMap.get(s) || { status: s, orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += sumNumber(o.total);
      statusMap.set(s, cur);
    }
    const statusBreakdown = Array.from(statusMap.values()).sort((a, b) => b.orders - a.orders);

    // --------------------
    // Top products (units + revenue from order items)
    // --------------------
    const productMap = new Map<
      string,
      { key: string; name: string; category: string; units: number; revenue: number }
    >();

    for (const o of orders) {
      for (const it of o.items) {
        const key = it.productId ? `pid:${it.productId}` : `name:${it.name}`;
        const name = it.product?.name || it.name || "Unknown";
        const category = it.product?.category?.name || "Uncategorized";
        const cur =
          productMap.get(key) || { key, name, category, units: 0, revenue: 0 };
        cur.units += sumNumber(it.qty);
        cur.revenue += sumNumber(it.qty) * sumNumber(it.price);
        // keep latest known
        if (!cur.name && name) cur.name = name;
        if (!cur.category && category) cur.category = category;
        productMap.set(key, cur);
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(({ name, category, units, revenue }) => ({ name, category, units, revenue }));

    // --------------------
    // Category performance
    // --------------------
    const catMap = new Map<string, { category: string; units: number; revenue: number }>();
    let totalCatRevenue = 0;

    for (const p of Array.from(productMap.values())) {
      const cat = p.category || "Uncategorized";
      const cur = catMap.get(cat) || { category: cat, units: 0, revenue: 0 };
      cur.units += p.units;
      cur.revenue += p.revenue;
      catMap.set(cat, cur);
      totalCatRevenue += p.revenue;
    }

    const categoryPerformance = Array.from(catMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((c) => ({
        ...c,
        share: totalCatRevenue > 0 ? (c.revenue / totalCatRevenue) * 100 : 0,
      }));

    // --------------------
    // Top customers
    // --------------------
    const topCustomers = Array.from(byEmail.entries())
      .map(([email, v]) => ({
        name: v.name || "-",
        email,
        orders: v.orders,
        spent: v.spent,
        city: v.city || "-",
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10);

    // --------------------
    // Sales by city
    // --------------------
    const cityMap = new Map<string, { city: string; orders: number; revenue: number }>();
    for (const o of orders) {
      const city = String(o.city || "Unknown").trim() || "Unknown";
      const cur = cityMap.get(city) || { city, orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += sumNumber(o.total);
      cityMap.set(city, cur);
    }
    const salesByCity = Array.from(cityMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 15);

    // ✅ Final response
    return NextResponse.json({
      meta: {
        range,
        from: toISO(from),
        to: toISO(to),
        groupBy,
      },

      kpis: {
        totalRevenue,
        totalOrders,
        itemsSold,
        avgOrderValue,
        shippingCollected,
        customers: {
          newCustomers,
          returningCustomers,
          totalUnique: byEmail.size,
        },
      },

      series: {
        revenue: seriesRevenue,
        orders: seriesOrders,
        itemsSold: seriesItems,
      },

      breakdowns: {
        status: statusBreakdown,
        categories: categoryPerformance,
      },

      tables: {
        topProducts,
        topCustomers,
        salesByCity,
      },
    });
  } catch (e: any) {
    console.error("ADMIN REPORTS ERROR:", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}