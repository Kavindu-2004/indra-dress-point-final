"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { toPng } from "html-to-image";


import {
  Package,
  ShoppingBag,
  Clock,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
  BarChart3,
  MessageSquare,
  ChevronDown,
  Mail,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type RangeKey = "today" | "7d" | "30d" | "thisMonth" | "custom";

type Product = {
  id: string | number;
  name?: string;
  title?: string;
  price?: number;
  imageUrl?: string;
  image?: string;
  stock?: number;
  createdAt?: string;
};

type Order = {
  id: string | number;
  status?: string;
  total?: number;
  amount?: number;
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
};

type SalesPoint = {
  label: string;
  sales: number;
};

type OrdersPoint = {
  label: string;
  orders: number;
};

type TopProductPoint = {
  name: string;
  value: number;
};

type ChartsResponse = {
  salesData: SalesPoint[];
  ordersData: OrdersPoint[];
  topProducts: TopProductPoint[];
};

function fmtMoney(n: unknown) {
  const num = Number(n ?? 0);
  return num.toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
  });
}

function StatCard({
  label,
  value,
  icon,
  hint,
  href,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
  href?: string;
}) {
  const card = (
    <div className="rounded-3xl border bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm text-gray-600">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </div>
          {hint && <div className="mt-2 text-xs text-gray-500">{hint}</div>}
        </div>
        <div className="rounded-2xl border bg-gray-50 p-3">{icon}</div>
      </div>

      {href && (
        <div className="mt-4 inline-flex items-center text-xs text-gray-700">
          View details <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

function ChartCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ChartRangeSelect({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (value: RangeKey) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RangeKey)}
        className="appearance-none rounded-2xl border bg-white px-4 py-2 pr-10 text-sm hover:bg-gray-50"
      >
        <option value="today">Today</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="thisMonth">This month</option>
        <option value="custom">Custom</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
    </div>
  );
}

const PIE_COLORS = ["#5B5CE2", "#7C83FD", "#60A5FA", "#34D399", "#F59E0B"];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [err, setErr] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<SalesPoint[]>([]);
  const [ordersData, setOrdersData] = useState<OrdersPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductPoint[]>([]);

  const [chartRange, setChartRange] = useState<RangeKey>("7d");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const topProductsChartRef = useRef<HTMLDivElement | null>(null);

  async function loadBase(isRefresh = false) {
    setErr("");
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [pRes, oRes] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/orders", { cache: "no-store" }),
      ]);

      if (pRes.status === 401 || oRes.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const pJson = pRes.ok ? await pRes.json() : [];
      const oJson = oRes.ok ? await oRes.json() : [];

      setProducts(Array.isArray(pJson) ? pJson : pJson?.items ?? []);
      setOrders(Array.isArray(oJson) ? oJson : oJson?.items ?? []);
    } catch {
      setErr("Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadCharts() {
    try {
      setChartsLoading(true);

      let url = `/api/admin/dashboard/charts?range=${chartRange}`;

      if (chartRange === "custom" && fromDate && toDate) {
        url += `&from=${fromDate}&to=${toDate}`;
      }

      const res = await fetch(url, { cache: "no-store" });

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const json: ChartsResponse = res.ok
        ? await res.json()
        : { salesData: [], ordersData: [], topProducts: [] };

      setSalesData(Array.isArray(json.salesData) ? json.salesData : []);
      setOrdersData(Array.isArray(json.ordersData) ? json.ordersData : []);
      setTopProducts(Array.isArray(json.topProducts) ? json.topProducts : []);
    } catch {
      setSalesData([]);
      setOrdersData([]);
      setTopProducts([]);
    } finally {
      setChartsLoading(false);
    }
  }

  async function handleRefresh() {
    await Promise.all([loadBase(true), loadCharts()]);
  }

  async function handleDownloadTopProductsChart() {
    if (!topProductsChartRef.current) return;

    try {
      const dataUrl = await toPng(topProductsChartRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `top-products-chart-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Failed to download top products chart");
    }
  }

  useEffect(() => {
    loadBase(false);
  }, []);

  useEffect(() => {
    if (chartRange === "custom") {
      if (fromDate && toDate) {
        loadCharts();
      } else {
        setSalesData([]);
        setOrdersData([]);
        setTopProducts([]);
        setChartsLoading(false);
      }
      return;
    }

    loadCharts();
  }, [chartRange, fromDate, toDate]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalOrders = orders.length;

    const pendingOrders = orders.filter((o) => {
      const s = String(o.status || "pending").toLowerCase();
      return s.includes("pending") || s.includes("processing");
    }).length;

    const revenue = orders.reduce((sum, o) => {
      const val = o.total ?? o.amount ?? 0;
      return sum + Number(val || 0);
    }, 0);

    return { totalProducts, totalOrders, pendingOrders, revenue };
  }, [products, orders]);

  const safeTopProducts =
    topProducts.length > 0 ? topProducts : [{ name: "No Data", value: 1 }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Overview of products, orders and revenue.
          </p>
          {err && (
            <div className="mt-3 rounded-2xl border bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {err}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <Link
            href="/admin/announcements"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Announcements <ArrowUpRight className="h-4 w-4" />
          </Link>

          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Sales Report <BarChart3 className="h-4 w-4" />
          </Link>

          <Link
            href="/admin/analyzer"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Analyzer <BarChart3 className="h-4 w-4" />
          </Link>

          <Link
            href="/admin/feedback"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            View Feedbacks <MessageSquare className="h-4 w-4" />
          </Link>

          <Link
            href="/admin/newsletter"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Newsletter Subscribers <Mail className="h-4 w-4" />
          </Link>

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Manage Products <ArrowUpRight className="h-4 w-4" />
          </Link>

          <button
            onClick={() =>
              signOut({
                callbackUrl: "/admin/login",
                redirect: true,
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 hover:bg-rose-100"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Products"
          value={loading ? "—" : String(stats.totalProducts)}
          icon={<Package className="h-5 w-5" />}
          hint="All active items"
          href="/admin/products"
        />

        <StatCard
          label="Total Orders"
          value={loading ? "—" : String(stats.totalOrders)}
          icon={<ShoppingBag className="h-5 w-5" />}
          hint="All-time orders"
          href="/admin/orders"
        />

        <StatCard
          label="Pending Orders"
          value={loading ? "—" : String(stats.pendingOrders)}
          icon={<Clock className="h-5 w-5" />}
          hint="Needs action"
          href="/admin/orders"
        />

        <StatCard
          label="Revenue"
          value={loading ? "—" : fmtMoney(stats.revenue)}
          icon={<DollarSign className="h-5 w-5" />}
          hint="Based on order totals"
          href="/admin/reports"
        />
      </div>

      {chartRange === "custom" && (
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div>
              <label className="mb-2 block text-sm text-gray-600">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-xl border bg-white px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-xl border bg-white px-4 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <ChartCard
          title="Sales"
          action={
            <ChartRangeSelect value={chartRange} onChange={setChartRange} />
          }
        >
          <div className="h-[360px]">
            {chartsLoading ? (
              <div className="h-full w-full animate-pulse rounded-2xl bg-gray-50" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => [
                      fmtMoney(Number(value ?? 0)),
                      "Sales",
                    ]}
                  />
                  <Bar dataKey="sales" radius={[8, 8, 0, 0]} fill="#5B5CE2" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Orders"
          action={
            <ChartRangeSelect value={chartRange} onChange={setChartRange} />
          }
        >
          <div className="h-[360px]">
            {chartsLoading ? (
              <div className="h-full w-full animate-pulse rounded-2xl bg-gray-50" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersData}>
                  <CartesianGrid vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip />
                  <Bar dataKey="orders" radius={[8, 8, 0, 0]} fill="#5B5CE2" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Top Products"
          action={
            <div className="flex items-center gap-3">
              <ChartRangeSelect value={chartRange} onChange={setChartRange} />

              <button
                onClick={handleDownloadTopProductsChart}
                className="inline-flex items-center rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                Download Chart
              </button>
            </div>
          }
        >
          <div
            ref={topProductsChartRef}
            className="h-[420px] bg-white rounded-2xl"
          >
            {chartsLoading ? (
              <div className="h-full w-full animate-pulse rounded-2xl bg-gray-50" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={safeTopProducts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="42%"
                    outerRadius={150}
                    fill="#5B5CE2"
                    label
                    paddingAngle={2}
                  >
                    {safeTopProducts.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}