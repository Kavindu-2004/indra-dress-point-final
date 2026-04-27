"use client";

import { useRouter } from "next/navigation";

type Props = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  qty?: number; // default 1
  className?: string;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  qty: number;
};

const CART_KEY = "indra_cart";

export default function BuyNowButton({
  id,
  name,
  price,
  image = null,
  qty = 1,
  className = "",
}: Props) {
  const router = useRouter();

  function readCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function writeCart(next: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }

  function addAndGo() {
    const cart = readCart();

    const existing = cart.find((x) => x.id === id);
    let next: CartItem[];

    if (existing) {
      next = cart.map((x) =>
        x.id === id ? { ...x, qty: x.qty + qty } : x
      );
    } else {
      next = [...cart, { id, name, price, image, qty }];
    }

    writeCart(next);
    router.push("/checkout");
  }

  return (
    <button
      type="button"
      onClick={addAndGo}
      className={
        className ||
        "block w-full text-center rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90"
      }
    >
      Buy Now
    </button>
  );
}