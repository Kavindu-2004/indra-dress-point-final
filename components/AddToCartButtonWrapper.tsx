"use client";

import dynamic from "next/dynamic";

const AddToCartButton = dynamic(() => import("@/components/AddToCartButton"), {
  ssr: false,
  loading: () => (
    <button
      type="button"
      className="mt-3 w-full rounded-full bg-black text-white px-4 py-2 text-sm font-medium opacity-80"
      disabled
    >
      Add to Cart
    </button>
  ),
});

type Props = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
};

export default function AddToCartButtonWrapper(props: Props) {
  return <AddToCartButton {...props} />;
}