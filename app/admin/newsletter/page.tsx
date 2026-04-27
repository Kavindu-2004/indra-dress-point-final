"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


type Subscriber = {
  id: number;
  email: string;
  createdAt: string;
};

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSubscribers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/newsletter", {
        cache: "no-store",
      });
      const data = await res.json();
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load subscribers:", error);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscribers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-600 mt-1">
            View all newsletter emails collected from the site
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/newsletter/send"
            className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            Send Newsletter
          </Link>

          <Link
            href="/admin/dashboard"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
          Loading subscribers...
        </div>
      ) : subscribers.length === 0 ? (
        <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
          No subscribers yet.
        </div>
      ) : (
        <div className="rounded-2xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">{subscriber.id}</td>
                  <td className="px-4 py-3">{subscriber.email}</td>
                  <td className="px-4 py-3">
                    {new Date(subscriber.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}