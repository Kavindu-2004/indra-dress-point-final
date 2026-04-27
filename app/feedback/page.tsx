import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import FeedbackForm from "./FeedbackForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function FeedbackPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/account");
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-2">Submit Feedback</h1>
          <p className="text-gray-600 mb-8">
            Share your experience with our store.
          </p>

          <FeedbackForm />
        </div>
      </main>

      <Footer />
    </>
  );
}