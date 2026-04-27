"use client";

import { useEffect, useMemo, useState } from "react";
import GooglePayButton from "@/components/GooglePayButton";

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
  image?: string | null;
};

type CheckoutCustomer = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
};

export default function CheckoutSummary() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [code, setCode] = useState("");
  const [customer, setCustomer] = useState<CheckoutCustomer>({});

  useEffect(() => {
    const raw = localStorage.getItem("indra_cart");
    setCart(raw ? JSON.parse(raw) : []);

    const rawCustomer = localStorage.getItem("indra_checkout_customer");
    setCustomer(rawCustomer ? JSON.parse(rawCustomer) : {});
  }, []);

  const subtotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.qty, 0),
    [cart]
  );

  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border bg-gray-50 p-6">
      <div className="space-y-4">
        <div className="pb-4 border-b">
          <div className="text-sm font-semibold text-center mb-3">
            Express checkout
          </div>

          <div className="flex justify-center">
            <GooglePayButton
              totalPrice={total.toFixed(2)}
              customer={customer}
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              Or
            </span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>
        </div>

        <div className="space-y-3">
          {cart.length === 0 ? (
            <div className="text-sm text-gray-600">No items in cart.</div>
          ) : (
            cart.map((i) => (
              <div key={i.id} className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border bg-white flex items-center justify-center">
                  {i.image ? (
                    <img
                      src={i.image}
                      alt={i.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[10px] text-gray-400">No image</div>
                  )}

                  <div className="absolute -top-2 -right-2 rounded-full bg-black text-white text-[11px] px-2 py-0.5">
                    {i.qty}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{i.name}</div>
                  <div className="text-xs text-gray-500">
                    LKR {i.price.toLocaleString()}
                  </div>
                </div>

                <div className="text-sm font-semibold">
                  LKR {(i.price * i.qty).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Discount code or gift card"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            type="button"
            onClick={() => alert("Discount later")}
            className="rounded-xl border bg-white px-4 text-sm font-medium hover:bg-gray-50"
          >
            Apply
          </button>
        </div>

        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">LKR {subtotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shipping === 0 ? "FREE" : `LKR ${shipping}`}
            </span>
          </div>

          <div className="flex items-center justify-between text-lg font-semibold pt-2">
            <span>Total</span>
            <span>LKR {total.toLocaleString()}</span>
          </div>

          <div className="text-xs text-gray-500">
            Taxes included (demo). We’ll finalize later.
          </div>
        </div>
      </div>
    </aside>
  );
}