"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type AnalyzerData = {
  summary: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalFeedbacks: number;
    totalSubscribers: number;
    lowStockProducts: number;
  };
  orderStatus: { name: string; value: number }[];
  topProducts: { name: string; qty: number }[];
  lowStockItems: { id: number; name: string; stock: number; category: string }[];
  latestFeedbacks: {
    id: number;
    message: string;
    status: string;
    createdAt: string;
    user?: { name?: string | null; email?: string | null } | null;
  }[];
};

const PIE_COLORS = ["#5B5CE2", "#7C83FD", "#60A5FA", "#34D399"];

function money(n: number) {
  return `Rs ${Number(n || 0).toLocaleString()}`;
}

export default function AdminAnalyzerPage() {
  const [data, setData] = useState<AnalyzerData | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analyzer", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="p-6">Loading analyzer...</div>;
  }

  if (!data) {
    return <div className="p-6">Failed to load analyzer data.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Admin Analyzer</h1>
          <p className="text-gray-600 text-sm mt-1">
            Overall business analysis and insights.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/dashboard"
            className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Link>

          <a
            href="/api/admin/analyzer/download"
            className="rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            Download Analyzer Report
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card title="Products" value={String(data.summary.totalProducts)} />
        <Card title="Orders" value={String(data.summary.totalOrders)} />
        <Card title="Revenue" value={money(data.summary.totalRevenue)} />
        <Card title="Feedbacks" value={String(data.summary.totalFeedbacks)} />
        <Card title="Subscribers" value={String(data.summary.totalSubscribers)} />
        <Card title="Low Stock" value={String(data.summary.lowStockProducts)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-3xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.orderStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={110}
                  label
                >
                  {data.orderStatus.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">Top Products</h2>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="qty" fill="#5B5CE2" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">Low Stock Products</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr className="border-b">
                <th className="py-3">ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3">{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.lowStockItems.length === 0 && (
          <p className="text-sm text-gray-500 mt-4">No low stock products.</p>
        )}
      </div>

      <div className="rounded-3xl border bg-white p-6">
        <h2 className="text-xl font-semibold mb-4">Latest Feedbacks</h2>
        <div className="space-y-3">
          {data.latestFeedbacks.map((item) => (
            <div key={item.id} className="border rounded-2xl p-4">
              <div className="font-medium">
                {item.user?.name || item.user?.email || "User"}
              </div>
              <div className="text-sm text-gray-500 mt-1">{item.status}</div>
              <div className="text-sm mt-2">{item.message}</div>
            </div>
          ))}
        </div>

        {data.latestFeedbacks.length === 0 && (
          <p className="text-sm text-gray-500">No feedbacks found.</p>
        )}
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}