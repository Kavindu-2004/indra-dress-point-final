"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";


type OrderStatus = "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type Order = {
  id: number;
  orderNumber: string;
  status: OrderStatus;

  customerEmail: string;
  customerName?: string | null;

  address: string;
  apartment?: string | null;
  city: string;
  postalCode?: string | null;
  phone?: string | null;
  notes?: string | null;

  subtotal: number;
  shipping: number;
  total: number;

  trackingNumber?: string | null;
  trackingUrl?: string | null;

  createdAt: string;

  items: {
    id: number;
    qty: number;
    price: number;
    name: string;
    image?: string | null;

    product?: {
      id: number;
      name: string;
      images: { url: string }[];
      category: { name: string; slug: string };
    } | null;
  }[];
};

const statusOptions: OrderStatus[] = [
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function money(n: number) {
  return `Rs ${Number(n || 0).toLocaleString()}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/admin/orders", {
      cache: "no-store",
      credentials: "include",
    });

    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setLoading(false);
      alert(err.error || "Failed to load orders");
      setOrders([]);
      setSelected(null);
      return;
    }

    const data = (await res.json().catch(() => [])) as unknown;

    const arr = Array.isArray(data) ? (data as Order[]) : [];
    setOrders(arr);

    if (selected) {
      const refreshed = arr.find((o) => o.id === selected.id) || null;
      setSelected(refreshed);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;

    return orders.filter((o) => {
      return (
        String(o.id).includes(s) ||
        String(o.orderNumber || "").toLowerCase().includes(s) ||
        String(o.customerEmail || "").toLowerCase().includes(s) ||
        String(o.customerName || "").toLowerCase().includes(s) ||
        String(o.phone || "").toLowerCase().includes(s) ||
        String(o.status || "").toLowerCase().includes(s)
      );
    });
  }, [orders, q]);

  async function saveUpdate(
    nextStatus: OrderStatus,
    trackingNumber: string,
    trackingUrl: string
  ) {
    if (!selected) return;
    setSaving(true);

    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        id: selected.id,
        status: nextStatus,
        trackingNumber,
        trackingUrl,
      }),
    });

    setSaving(false);

    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Update failed");
      return;
    }

    await load();
  }

  async function handleDownloadOrders() {
    try {
      setDownloading(true);

      const res = await fetch("/api/admin/orders/download", {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) {
        const err = await res.text().catch(() => "");
        alert(err || "Failed to download orders report");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while downloading orders report");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-gray-600 text-sm">Update order status + tracking.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            ← Back to Dashboard
          </Link>

          <button
            onClick={handleDownloadOrders}
            disabled={downloading}
            className="inline-flex items-center rounded-full bg-black text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60"
          >
            {downloading ? "Downloading..." : "Download Orders"}
          </button>
        </div>
      </div>

      <div className="w-full md:w-96">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search id, orderNumber, email, name, phone, status..."
          className="w-full border rounded-xl px-3 py-2 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 bg-white border rounded-2xl p-4">
          <div className="font-semibold mb-3">All Orders</div>

          <div className="space-y-2 max-h-[70vh] overflow-auto pr-1">
            {loading && <div className="text-sm text-gray-600">Loading...</div>}

            {!loading &&
              filtered.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className={`w-full text-left border rounded-xl p-3 hover:bg-gray-50 ${
                    selected?.id === o.id ? "border-black" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{o.orderNumber}</div>
                    <div className="text-xs px-2 py-1 rounded-full border">
                      {o.status}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {o.customerName || o.customerEmail}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold mt-2">{money(o.total)}</div>
                </button>
              ))}

            {!loading && filtered.length === 0 && (
              <div className="text-sm text-gray-600">No orders found.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white border rounded-2xl p-6">
          {!selected ? (
            <div className="text-gray-600 text-sm">
              Select an order to view details.
            </div>
          ) : (
            <OrderDetails order={selected} saving={saving} onSave={saveUpdate} />
          )}
        </div>
      </div>
    </div>
  );
}

function OrderDetails({
  order,
  saving,
  onSave,
}: {
  order: Order;
  saving: boolean;
  onSave: (
    nextStatus: OrderStatus,
    trackingNumber: string,
    trackingUrl: string
  ) => Promise<void>;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl ?? "");

  useEffect(() => {
    setStatus(order.status);
    setTrackingNumber(order.trackingNumber ?? "");
    setTrackingUrl(order.trackingUrl ?? "");
  }, [order.id, order.status, order.trackingNumber, order.trackingUrl]);

  const itemsTotalQty = order.items.reduce((sum, it) => sum + it.qty, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
        <div>
          <h2 className="text-xl font-bold">{order.orderNumber}</h2>
          <div className="text-sm text-gray-600 mt-1">
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="text-sm font-semibold">{`Total: ${money(order.total)}`}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-2xl p-4 bg-gray-50">
          <div className="text-xs text-gray-600">Customer</div>
          <div className="font-medium mt-1">{order.customerName || "-"}</div>
          <div className="text-sm text-gray-600 mt-1">{order.customerEmail}</div>
          {order.phone && (
            <div className="text-sm text-gray-600 mt-1">{order.phone}</div>
          )}
        </div>

        <div className="border rounded-2xl p-4 bg-gray-50">
          <div className="text-xs text-gray-600">Delivery Address</div>
          <div className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">
            {order.address}
            {order.apartment ? `\n${order.apartment}` : ""}
            {`\n${order.city}`}
            {order.postalCode ? `\n${order.postalCode}` : ""}
          </div>
        </div>
      </div>

      <div className="border rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Items</div>
          <div className="text-sm text-gray-600">{itemsTotalQty} qty</div>
        </div>

        <div className="mt-3 space-y-3">
          {order.items.map((it) => (
            <div
              key={it.id}
              className="flex items-center gap-3 border rounded-xl p-3"
            >
              <div className="w-12 h-12 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center">
                {it.image ? (
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-full h-full object-cover"
                  />
                ) : it.product?.images?.[0]?.url ? (
                  <img
                    src={it.product.images[0].url}
                    alt={it.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No</span>
                )}
              </div>

              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-xs text-gray-500">
                  {it.qty} × Rs {it.price.toLocaleString()}
                  {it.product?.category?.name ? ` • ${it.product.category.name}` : ""}
                </div>
              </div>

              <div className="text-sm font-semibold">
                Rs {(it.qty * it.price).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Order Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="mt-1 w-full border rounded-xl px-3 py-2"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Tracking Number</label>
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="mt-1 w-full border rounded-xl px-3 py-2"
            placeholder="AB123456"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium">Tracking URL</label>
          <input
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            className="mt-1 w-full border rounded-xl px-3 py-2"
            placeholder="https://courier.lk/track/AB123..."
          />
        </div>

        <div className="md:col-span-2">
          <button
            disabled={saving}
            onClick={() => onSave(status, trackingNumber, trackingUrl)}
            className="rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Update"}
          </button>
        </div>
      </div>
    </div>
  );
}