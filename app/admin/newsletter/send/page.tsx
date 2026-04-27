"use client";

import Link from "next/link";
import { useState } from "react";

export default function SendNewsletterPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  async function handleSend() {
    try {
      setSending(true);
      setResult("");

      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(
          data.message
            ? `${data.message} (${data.totalRecipients} recipients)`
            : "Newsletter sent successfully"
        );
        setSubject("");
        setMessage("");
      } else {
        setResult(data.error || "Failed to send newsletter");
      }
    } catch (error) {
      console.error(error);
      setResult("Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Send Newsletter</h1>
          <p className="text-sm text-gray-600 mt-1">
            Send updates and promotions to all subscribers
          </p>
        </div>

        <Link
          href="/admin/dashboard"
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="rounded-2xl border bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter newsletter subject"
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your newsletter message"
            rows={8}
            className="w-full rounded-xl border px-4 py-3 text-sm"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={sending}
          className="rounded-xl bg-black text-white px-5 py-3 text-sm hover:opacity-90 disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send Newsletter"}
        </button>

        {result && <p className="text-sm text-gray-700">{result}</p>}
      </div>
    </div>
  );
}