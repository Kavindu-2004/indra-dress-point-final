// app/(store)/account/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-16">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // ✅ LOGGED OUT
  if (!session?.user) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-16 space-y-8">
        <h1 className="text-3xl font-bold">Account</h1>

        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <p className="text-gray-600">
            Sign in to view your orders, track deliveries and faster checkout.
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            className="w-full rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90"
          >
            Continue with Google
          </button>

          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  const user = session.user;

  // ✅ LOGGED IN
  return (
    <div className="max-w-[1000px] mx-auto px-6 py-16 space-y-10">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-gray-600 mt-2">
            View your profile, orders, and tracking information.
          </p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full border px-5 py-2 text-sm hover:bg-black hover:text-white transition"
        >
          Sign out
        </button>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border bg-white p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
          {user.image ? (
            <Image src={user.image} alt="Profile" width={56} height={56} />
          ) : (
            <span className="text-sm text-gray-500">DP</span>
          )}
        </div>

        <div className="flex-1">
          <div className="text-sm text-gray-600">Signed in as</div>
          <div className="font-semibold text-lg">{user.name ?? "Customer"}</div>
          <div className="text-sm text-gray-600">{user.email}</div>
        </div>

        <Link
          href="/"
          className="rounded-full bg-black text-white px-5 py-2 text-sm hover:opacity-90"
        >
          Continue shopping
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/account/orders"
          className="rounded-2xl border bg-white p-6 hover:shadow-sm transition"
        >
          <div className="font-semibold">Orders</div>
          <div className="text-sm text-gray-600 mt-1">
            View order history & current orders
          </div>
        </Link>

        <Link
          href="/track-order"
          className="rounded-2xl border bg-white p-6 hover:shadow-sm transition"
        >
          <div className="font-semibold">Track order</div>
          <div className="text-sm text-gray-600 mt-1">
            Track delivery status with Order ID
          </div>
        </Link>

        <Link
          href="/checkout"
          className="rounded-2xl border bg-white p-6 hover:shadow-sm transition"
        >
          <div className="font-semibold">Checkout</div>
          <div className="text-sm text-gray-600 mt-1">
            Faster checkout using your account
          </div>
        </Link>
      </div>

      {/* Placeholder sections (ready for later DB connection) */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="font-semibold">Current orders</div>
        <p className="text-sm text-gray-600 mt-2">
          No current orders found (demo). When you create orders in database,
          they will appear here.
        </p>

        <div className="mt-4 flex gap-3">
          <Link
            href="/account/orders"
            className="rounded-full bg-black text-white px-5 py-2 text-sm hover:opacity-90"
          >
            View order history
          </Link>
          <Link
            href="/track-order"
            className="rounded-full border px-5 py-2 text-sm hover:bg-black hover:text-white transition"
          >
            Track an order
          </Link>
        </div>
      </div>
    </div>
  );
}