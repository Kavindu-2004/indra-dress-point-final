import Link from "next/link";
import Script from "next/script";
import CheckoutForm from "@/components/CheckoutForm";
import CheckoutSummary from "@/components/CheckoutSummary";

export default function CheckoutPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10">
      {/* Google Pay script */}
      <Script
        src="https://pay.google.com/gp/p/js/pay.js"
        strategy="afterInteractive"
      />

      {/* Top */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-2xl font-bold tracking-wide">Checkout</h1>
        <Link href="/cart" className="text-sm text-gray-600 hover:text-black">
          ← Back to cart
        </Link>
      </div>

      {/* Layout like Shopify: left form, right summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <CheckoutForm />
        </div>

        <div className="lg:col-span-5">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}