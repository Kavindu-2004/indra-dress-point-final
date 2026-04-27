import Link from "next/link";
import { prisma } from "@/lib/prisma";
import FeedbackAdminList from "./FeedbackAdminList";


export default async function AdminFeedbackPage() {
  const feedbacks = await prisma.feedback.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="text-3xl font-bold">Feedback Management</h1>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            ← Back to Dashboard
          </Link>

          <a
            href="/api/admin/feedback/download"
            className="inline-flex items-center rounded-lg border border-black px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
          >
            Download Feedbacks
          </a>
        </div>
      </div>

      <FeedbackAdminList feedbacks={feedbacks} />
    </div>
  );
}