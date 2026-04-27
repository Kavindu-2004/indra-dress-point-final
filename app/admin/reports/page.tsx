"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";


import {
  ArrowUpRight,
  ChevronDown,
  Download,
  Package,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";

type RangeKey = "today" | "7d" | "30d" | "thisMonth" | "custom";

type KPI = {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
};

type StatusRow = { status: string; orders: number; revenue: number };
type CategoryRow = { category: string; units: number; revenue: number; share: number };

type ReportsResponse = {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    itemsSold: number;
    avgOrderValue: number;
    shippingCollected: number;
    customers: {
      newCustomers: number;
      returningCustomers: number;
    };
  };
  breakdowns: {
    status: StatusRow[];
    categories: CategoryRow[];
  };
};

function money(n: number) {
  return `Rs ${Number(n || 0).toLocaleString()}`;
}

function pct(n: number) {
  return `${Math.round(n)}%`;
}

function KPIChip({ kpi }: { kpi: KPI }) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-600">{kpi.label}</div>
          <div className="mt-2 text-2xl font-semibold">{kpi.value}</div>
          {kpi.hint && (
            <div className="text-xs text-gray-500 mt-1">{kpi.hint}</div>
          )}
        </div>
        <div className="rounded-2xl border bg-gray-50 p-3">{kpi.icon}</div>
      </div>
    </div>
  );
}

function TableShell({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-gray-600 border-b">
          <tr>
            {headers.map((h) => (
              <th key={h} className="py-3 pr-4 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function RangePicker({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RangeKey)}
        className="appearance-none rounded-full border bg-white px-4 py-2 text-sm pr-10 hover:bg-gray-50"
      >
        <option value="today">Today</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="thisMonth">This month</option>
        <option value="custom">Custom</option>
      </select>
      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function DollarIcon() {
  return (
    <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold">
      $
    </div>
  );
}

export default function AdminReportsPage() {
  const [range, setRange] = useState<RangeKey>("7d");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<ReportsResponse | null>(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        let url = `/api/admin/reports?range=${range}`;

        if (range === "custom" && fromDate && toDate) {
          url += `&from=${fromDate}&to=${toDate}`;
        }

        const res = await fetch(url, {
          cache: "no-store",
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }

        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to load reports:", error);
      } finally {
        setLoading(false);
      }
    }

    if (range !== "custom" || (fromDate && toDate)) {
      load();
    } else {
      setData(null);
      setLoading(false);
    }
  }, [range, fromDate, toDate]);

  const handleDownload = async () => {
    try {
      if (range === "custom" && (!fromDate || !toDate)) {
        alert("Please select both From and To dates");
        return;
      }

      setDownloading(true);

      let url = `/api/admin/reports/download?range=${range}`;

      if (range === "custom") {
        url += `&from=${fromDate}&to=${toDate}`;
      }

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to download report");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download =
        range === "custom"
          ? `sales-report-${fromDate}-to-${toDate}.csv`
          : `sales-report-${range}.csv`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  const kpis: KPI[] = useMemo(() => {
    return [
      {
        label: "Total Revenue",
        value: loading ? "—" : money(data?.kpis.totalRevenue ?? 0),
        icon: <DollarIcon />,
      },
      {
        label: "Total Orders",
        value: loading ? "—" : String(data?.kpis.totalOrders ?? 0),
        icon: <ShoppingBag className="w-5 h-5" />,
      },
      {
        label: "Items Sold",
        value: loading ? "—" : String(data?.kpis.itemsSold ?? 0),
        icon: <Package className="w-5 h-5" />,
      },
      {
        label: "Avg Order Value",
        value: loading ? "—" : money(data?.kpis.avgOrderValue ?? 0),
        icon: <ShoppingBag className="w-5 h-5" />,
      },
      {
        label: "Shipping Collected",
        value: loading ? "—" : money(data?.kpis.shippingCollected ?? 0),
        icon: <Truck className="w-5 h-5" />,
      },
      {
        label: "Customers",
        value: loading
          ? "—"
          : `${data?.kpis.customers.newCustomers ?? 0} new • ${
              data?.kpis.customers.returningCustomers ?? 0
            } returning`,
        icon: <Users className="w-5 h-5" />,
      },
    ];
  }, [data, loading]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Sales Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Clean analytics overview for Indra Dress Point
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50 transition"
          >
            Back to Dashboard
            <ArrowUpRight className="w-4 h-4" />
          </Link>

          <RangePicker value={range} onChange={setRange} />

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-sm hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Downloading..." : "Download Report"}
          </button>
        </div>
      </div>

      {range === "custom" && (
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Custom Date Range</h2>

          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-xl border px-4 py-2 text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-xl border px-4 py-2 text-sm bg-white"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpis.map((k) => (
          <KPIChip key={k.label} kpi={k} />
        ))}
      </div>

      <div className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Order Status Breakdown</h2>
        <TableShell headers={["Status", "Orders", "Revenue"]}>
          {data?.breakdowns.status.map((r) => (
            <tr key={r.status} className="border-b">
              <td className="py-3 pr-4 font-medium">{r.status}</td>
              <td className="py-3 pr-4">{r.orders}</td>
              <td className="py-3 pr-4">{money(r.revenue)}</td>
            </tr>
          ))}
        </TableShell>
      </div>

      <div className="rounded-3xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Category Performance</h2>
        <TableShell headers={["Category", "Units", "Revenue", "Share"]}>
          {data?.breakdowns.categories.map((c) => (
            <tr key={c.category} className="border-b">
              <td className="py-3 pr-4 font-medium">{c.category}</td>
              <td className="py-3 pr-4">{c.units}</td>
              <td className="py-3 pr-4">{money(c.revenue)}</td>
              <td className="py-3 pr-4">{pct(c.share)}</td>
            </tr>
          ))}
        </TableShell>
      </div>
    </div>
  );
}