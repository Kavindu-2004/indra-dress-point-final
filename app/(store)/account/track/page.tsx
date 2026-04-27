"use client";

import { useState } from "react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [searched, setSearched] = useState(false);

  function handleTrack() {
    if (!orderId) return;
    setSearched(true);
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-16 space-y-8">
      <h1 className="text-3xl font-bold">Track Order</h1>
      <p className="text-gray-600">
        Enter your Order ID to check delivery status.
      </p>

      <div className="rounded-2xl border bg-white p-6 space-y-4">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter Order ID (e.g. ORD12345)"
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
        />

        <button
          onClick={handleTrack}
          className="rounded-full bg-black text-white px-6 py-3 text-sm hover:opacity-90"
        >
          Track Order
        </button>
      </div>

      {searched && (
        <div className="rounded-2xl border p-6 bg-gray-50">
          <h2 className="font-semibold mb-2">Order Status</h2>
          <p className="text-sm text-gray-700">
            🚚 Your order is currently <span className="font-medium">Processing</span>.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            (Demo mode — connect real order tracking later.)
          </p>
        </div>
      )}
    </div>
  );
}