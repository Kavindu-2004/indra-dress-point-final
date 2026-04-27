"use client";

import { useState } from "react";

type Props = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
};

const CART_KEY = "indra_cart";

export default function AddToCartButton({ id, name, price, image }: Props) {
  const [added, setAdded] = useState(false);

  function addToCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const cart = raw ? JSON.parse(raw) : [];

      const existingIndex = cart.findIndex((x: any) => x.id === id);

      if (existingIndex !== -1) {
        cart[existingIndex].qty = Number(cart[existingIndex].qty) + 1;
      } else {
        cart.push({
          id,
          name,
          price,
          image: image || null,
          qty: 1,
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      // ✅ Notify navbar to update cart count
      window.dispatchEvent(new Event("cart:updated"));

      setAdded(true);
      setTimeout(() => setAdded(false), 900);
    } catch (error) {
      console.error("Cart error:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();   // prevent product link navigation
        e.stopPropagation();  // extra safety
        addToCart();
      }}
      className="mt-3 w-full rounded-full bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition"
    >
      {added ? "Added ✅" : "Add to Cart"}
    </button>
  );
}