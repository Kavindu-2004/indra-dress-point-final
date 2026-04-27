"use client";

import { useEffect, useState } from "react";

type Announcement = {
  id: number;
  title: string;
  message: string;
};

export default function AnnouncementBar() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/announcements", { cache: "no-store" });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    })();
  }, []);

  if (!open) return null;
  if (!items.length) return null;

  // show latest one (or change to show all)
  const a = items[0];

  return (
    <div className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{a.title}</div>
          <div className="text-xs text-gray-600 truncate">{a.message}</div>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="text-xs border rounded-full px-3 py-1 hover:bg-gray-50"
          aria-label="Close announcement"
        >
          Close
        </button>
      </div>
    </div>
  );
}