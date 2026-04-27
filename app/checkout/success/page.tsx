import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center space-y-6">
      <h1 className="text-3xl font-bold">Order placed successfully</h1>
      <p className="text-gray-600">
        Thank you for your purchase. Your order has been created.
      </p>

      {params?.orderId && (
        <p className="text-sm text-gray-500">
          Order ID: <span className="font-medium">{params.orderId}</span>
        </p>
      )}

      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full border px-5 py-3 text-sm hover:bg-gray-50"
        >
          Back to Home
        </Link>

        <Link
          href="/account/orders"
          className="rounded-full bg-black text-white px-5 py-3 text-sm hover:opacity-90"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}