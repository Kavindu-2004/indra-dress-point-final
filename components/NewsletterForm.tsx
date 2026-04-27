"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubscribe() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Subscribed successfully");
        setEmail("");
      } else {
        setMessage(data.error || "Subscription failed");
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full max-w-[220px] rounded-full border px-4 py-3 text-sm outline-none"
        />

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="rounded-full bg-black px-5 py-3 text-sm text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Sending..." : "SUBSCRIBE"}
        </button>
      </div>

      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
}