"use client";

import { useState } from "react";

type Feedback = {
  id: number;
  message: string;
  status: string;
  createdAt: string | Date;
  user: {
    name: string | null;
    email: string | null;
  };
};

export default function FeedbackAdminList({
  feedbacks: initialFeedbacks,
}: {
  feedbacks: Feedback[];
}) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);

  async function markAsRead(id: number) {
    const res = await fetch(`/api/feedback/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "READ" }),
    });

    if (res.ok) {
      setFeedbacks((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "READ" } : item
        )
      );
    }
  }

  async function deleteFeedback(id: number) {
    const res = await fetch(`/api/feedback/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
    }
  }

  if (feedbacks.length === 0) {
    return <p>No feedbacks found.</p>;
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((item) => (
        <div
          key={item.id}
          className="border rounded-2xl p-5 bg-white shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg">
                {item.user?.name || "Unknown User"}
              </h2>
              <p className="text-sm text-gray-500">{item.user?.email}</p>
              <p className="text-sm mt-2">
                Status:{" "}
                <span
                  className={
                    item.status === "NEW" ? "text-red-600" : "text-green-600"
                  }
                >
                  {item.status}
                </span>
              </p>
              <p className="text-sm text-gray-400">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              {item.status === "NEW" && (
                <button
                  onClick={() => markAsRead(item.id)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white"
                >
                  Mark as Read
                </button>
              )}

              <button
                onClick={() => deleteFeedback(item.id)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>

          <p className="mt-4 text-gray-800 whitespace-pre-line">
            {item.message}
          </p>
        </div>
      ))}
    </div>
  );
}