"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

export default function AdminLoginPage() {
  const { status } = useSession(); // uses SessionProvider basePath from app/admin/layout.tsx

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ If already logged in as admin → go dashboard
  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/admin/dashboard";
    }
  }, [status]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin/dashboard",
    });

    setLoading(false);

    if (!res || res.error) {
      setErr("Invalid email or password");
      return;
    }

    // ✅ redirect manually
    window.location.href = res.url || "/admin/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Admin Sign in</h1>
        <p className="text-sm text-gray-600 mt-1">
          Use your admin email + password
        </p>

        {err && (
          <div className="mt-4 rounded-2xl border bg-rose-50 text-rose-700 px-4 py-3 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-5 space-y-3">
          <input
            className="w-full border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
            placeholder="Admin email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full border rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            className="w-full rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}