"use client";

import { useState } from "react";

export default function DownloadOrdersButton() {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/orders/download");

      if (!res.ok) {
        alert("Failed to download orders report");
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
      alert("Something went wrong while downloading");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="rounded-full bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-60"
    >
      {loading ? "Downloading..." : "Download Orders"}
    </button>
  );
}