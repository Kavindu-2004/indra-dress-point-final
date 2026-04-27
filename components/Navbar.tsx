"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, User, ShoppingCart, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { label: "New Arrivals", href: "/category/new-arrivals" },
  { label: "Workwear", href: "/category/workwear" },
  { label: "Dresses", href: "/category/dresses" },
  { label: "Evening Wear", href: "/category/evening-wear" },
  { label: "Accessories", href: "/category/accessories" },
];

type CartItem = { id: number; qty: number };
const CART_KEY = "indra_cart";

function getCartCount() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const items: CartItem[] = raw ? JSON.parse(raw) : [];
    return items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  } catch {
    return 0;
  }
}

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);

  // ✅ account session + dropdown
  const { data: session } = useSession();
  const [openAcc, setOpenAcc] = useState(false);
  const accRef = useRef<HTMLDivElement | null>(null);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!accRef.current) return;
      if (!accRef.current.contains(e.target as Node)) setOpenAcc(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // cart count sync
  useEffect(() => {
    setCartCount(getCartCount());

    const onStorage = () => setCartCount(getCartCount());
    window.addEventListener("storage", onStorage);

    const onCartUpdated = () => setCartCount(getCartCount());
    window.addEventListener("cart:updated", onCartUpdated as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart:updated", onCartUpdated as EventListener);
    };
  }, []);

  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <button className="md:hidden" type="button" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="text-2xl font-bold tracking-wide">
            INDRA DRESS POINT
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-gray-500 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-6">
          <button type="button" aria-label="Search">
            <Search className="w-5 h-5 hover:text-gray-500 transition" />
          </button>

          {/* ✅ Account icon (DP if logged in) */}
          <div className="relative" ref={accRef}>
            {session?.user ? (
              <button
                type="button"
                aria-label="Account"
                onClick={() => setOpenAcc((v) => !v)}
                className="flex items-center"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="Account"
                    width={28}
                    height={28}
                    className="rounded-full border"
                  />
                ) : (
                  <User className="w-5 h-5 hover:text-gray-500 transition" />
                )}
              </button>
            ) : (
              <Link href="/account" aria-label="Account">
                <User className="w-5 h-5 hover:text-gray-500 transition" />
              </Link>
            )}

            {/* Dropdown */}
            {session?.user && openAcc && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl border bg-white shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b">
                  <div className="text-sm font-semibold truncate">
                    {session.user.name ?? "Customer"}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {session.user.email}
                  </div>
                </div>

                <Link
                  href="/account"
                  className="block px-4 py-3 text-sm hover:bg-gray-50"
                  onClick={() => setOpenAcc(false)}
                >
                  Profile
                </Link>

                <Link
                  href="/account/orders"
                  className="block px-4 py-3 text-sm hover:bg-gray-50"
                  onClick={() => setOpenAcc(false)}
                >
                  Orders
                </Link>

                <Link
                  href="/track-order"
                  className="block px-4 py-3 text-sm hover:bg-gray-50"
                  onClick={() => setOpenAcc(false)}
                >
                  Track Order
                </Link>

                <button
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link href="/cart" className="relative" aria-label="Cart">
            <ShoppingCart className="w-5 h-5 hover:text-gray-500 transition" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}