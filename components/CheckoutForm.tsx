"use client";

import React, { useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image?: string | null;
};

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  phone: string;
  notes: string;
};

const CART_KEY = "indra_cart";
const CHECKOUT_CUSTOMER_KEY = "indra_checkout_customer";

export default function CheckoutForm() {
  const [loading, setLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: session, status } = useSession();

  const [form, setForm] = useState<FormState>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    setMounted(true);

    try {
      const rawCart = localStorage.getItem(CART_KEY);
      const parsedCart = rawCart ? (JSON.parse(rawCart) as CartItem[]) : [];
      setCart(Array.isArray(parsedCart) ? parsedCart : []);

      const rawCustomer = localStorage.getItem(CHECKOUT_CUSTOMER_KEY);
      if (rawCustomer) {
        const parsedCustomer = JSON.parse(rawCustomer) as Partial<FormState>;
        setForm((prev) => ({
          ...prev,
          ...parsedCustomer,
        }));
      }
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      setForm((p) => ({ ...p, email: p.email || session.user!.email! }));
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(
      CHECKOUT_CUSTOMER_KEY,
      JSON.stringify({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        apartment: form.apartment,
        city: form.city,
        postalCode: form.postalCode,
        phone: form.phone,
        notes: form.notes,
      })
    );
  }, [form, mounted]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }, [cart]);

  const shipping = 0;
  const total = subtotal + shipping;

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);

    try {
      const customerName = `${form.firstName} ${form.lastName}`.trim();

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: (session as any)?.user?.id || null,
          customerEmail: form.email,
          customerName: customerName || null,
          address: form.address,
          apartment: form.apartment,
          city: form.city,
          postalCode: form.postalCode,
          phone: form.phone,
          notes: form.notes,
          items: cart,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error || "Failed to place order");
        return;
      }

      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(CHECKOUT_CUSTOMER_KEY);
      setCart([]);
      window.dispatchEvent(new Event("cart:updated"));

      alert(`✅ Order created! Order No: ${data.orderNumber}`);

      window.location.href = `/account/track?orderNumber=${encodeURIComponent(
        data.orderNumber
      )}`;
    } catch (err) {
      alert("❌ Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <form onSubmit={placeOrder} className="space-y-8">
      {/* Contact */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Contact</h2>

          {status === "loading" ? (
            <span className="text-sm text-gray-400">...</span>
          ) : session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Signed in as {session.user.email}
              </span>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-black"
                onClick={() => signOut({ callbackUrl: "/checkout" })}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-black"
              onClick={() => signIn("google", { callbackUrl: "/checkout" })}
            >
              Sign in
            </button>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-gray-600">
            EMAIL*
          </label>
          <input
            value={form.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="Email"
            type="email"
            required
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
          />
          <p className="mt-2 text-xs text-gray-500">
            We’ll send order updates to this email.
          </p>
        </div>
      </section>

      {/* Delivery */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Delivery</h2>

        <div className="rounded-2xl border p-4 bg-white">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Country/Region:</span> Sri Lanka
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-600">
              FIRST NAME*
            </label>
            <input
              value={form.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
              placeholder="First name"
              required
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-600">
              LAST NAME*
            </label>
            <input
              value={form.lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
              placeholder="Last name"
              required
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-gray-600">
            ADDRESS*
          </label>
          <input
            value={form.address}
            onChange={(e) => onChange("address", e.target.value)}
            placeholder="Address"
            required
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-gray-600">
            APARTMENT, SUITE, ETC. (OPTIONAL)
          </label>
          <input
            value={form.apartment}
            onChange={(e) => onChange("apartment", e.target.value)}
            placeholder="Apartment, suite, etc. (optional)"
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-600">
              CITY*
            </label>
            <input
              value={form.city}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="City"
              required
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-gray-600">
              POSTAL CODE (OPTIONAL)
            </label>
            <input
              value={form.postalCode}
              onChange={(e) => onChange("postalCode", e.target.value)}
              placeholder="Postal code (optional)"
              className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-gray-600">
            PHONE (OPTIONAL)
          </label>
          <input
            value={form.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+94 ..."
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div>
          <label className="text-xs font-semibold tracking-wide text-gray-600">
            ORDER NOTES (OPTIONAL)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            placeholder="Notes for delivery..."
            className="mt-2 w-full min-h-[110px] rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
      </section>

      {/* Payment */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Payment</h2>

        <div className="rounded-2xl border p-4 bg-gray-50">
          <p className="text-sm text-gray-700">
            💳 PayHere will be added here later.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Next step: create order in DB → redirect to PayHere checkout.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || cart.length === 0}
          className="w-full rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-40"
        >
          {loading
            ? "Placing order..."
            : `Place order (LKR ${total.toLocaleString()})`}
        </button>

        {cart.length === 0 && (
          <p className="text-xs text-red-600">
            Your cart is empty. Add products first.
          </p>
        )}
      </section>
    </form>
  );
}