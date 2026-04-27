"use client";

import Link from "next/link";
import { useEffect, useState } from "react";


type Announcement = {
  id: number; // ✅ Prisma Int id
  title: string;
  message: string;
  page: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState<"home" | "new-arrivals">("home");
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  function normalize(row: any): Announcement {
    return {
      id: Number(row?.id),
      title: String(row?.title ?? ""),
      message: String(row?.message ?? ""),
      page: String(row?.page ?? "home"),
      isActive: Boolean(row?.isActive ?? row?.active ?? true),
      startsAt: row?.startsAt ?? null,
      endsAt: row?.endsAt ?? null,
      createdAt: row?.createdAt ?? new Date().toISOString(),
    };
  }

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      const list = Array.isArray(json) ? json.map(normalize) : [];
      setItems(list);
    } catch {
      setErr("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setErr("");
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          page,
          isActive, // ✅ this is what backend saves
          startsAt: startsAt ? new Date(startsAt).toISOString() : null,
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        }),
      });

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) throw new Error("Create failed");

      setTitle("");
      setMessage("");
      setStartsAt("");
      setEndsAt("");
      setIsActive(true);

      await load();
    } catch {
      setErr("Failed to create announcement.");
    }
  }

  async function toggleActive(a: Announcement) {
    setErr("");
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: a.id,
          isActive: !a.isActive,
        }),
      });

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) throw new Error("Update failed");
      await load();
    } catch {
      setErr("Failed to update announcement.");
    }
  }

  async function remove(id: number) {
    setErr("");
    try {
      const res = await fetch(
        `/api/admin/announcements?id=${encodeURIComponent(String(id))}`,
        { method: "DELETE" }
      );

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!res.ok) throw new Error("Delete failed");
      await load();
    } catch {
      setErr("Failed to delete announcement.");
    }
  }

  return (
    <div className="space-y-6">
      {/* ✅ Header + Dashboard button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Announcements</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create banners/announcements that appear on the store Home page.
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          ← Dashboard
        </Link>
      </div>

      {err && (
        <div className="rounded-2xl border bg-rose-50 text-rose-700 px-4 py-3 text-sm">
          {err}
        </div>
      )}

      <div className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold">Create announcement</div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="w-full border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
            placeholder="Title (e.g., Free Delivery)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="w-full border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black bg-white"
            value={page}
            onChange={(e) => setPage(e.target.value as any)}
          >
            <option value="home">Home page</option>
            <option value="new-arrivals">New Arrivals page</option>
          </select>

          <textarea
            className="md:col-span-2 w-full border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black min-h-[110px]"
            placeholder="Message (e.g., Free delivery above LKR 7000)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div>
            <label className="text-xs text-gray-600">Starts at (optional)</label>
            <input
              type="datetime-local"
              className="mt-1 w-full border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Ends at (optional)</label>
            <input
              type="datetime-local"
              className="mt-1 w-full border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>

          <button
            onClick={create}
            className="md:col-span-2 w-full rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Create
          </button>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="text-sm font-semibold">All announcements</div>
        <div className="text-xs text-gray-600 mt-1">Toggle active to show/hide on site.</div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-600">No announcements yet.</div>
          ) : (
            items.map((a) => (
              <div key={a.id} className="rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{a.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{a.message}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Page: <span className="font-medium">{a.page}</span>
                      {a.startsAt ? ` • Starts: ${new Date(a.startsAt).toLocaleString()}` : ""}
                      {a.endsAt ? ` • Ends: ${new Date(a.endsAt).toLocaleString()}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(a)}
                      className="rounded-full border px-3 py-2 text-xs hover:bg-gray-50"
                    >
                      {a.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => remove(a.id)}
                      className="rounded-full border px-3 py-2 text-xs hover:bg-gray-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}