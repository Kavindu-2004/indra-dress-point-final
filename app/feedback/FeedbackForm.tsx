"use client";

import { useState } from "react";

export default function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      setMessage("");
      setSuccess("Feedback submitted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-2xl p-6 shadow-sm space-y-4"
    >
      <div>
        <label className="block mb-2 font-medium">Your Feedback</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your feedback here..."
          className="w-full border rounded-xl px-4 py-3 min-h-[160px] outline-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-3 rounded-xl bg-black text-white"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>

      {success && <p className="text-green-600">{success}</p>}
    </form>
  );
}