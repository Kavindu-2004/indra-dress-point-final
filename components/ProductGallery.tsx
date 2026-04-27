"use client";

import { useMemo, useState } from "react";

type Img = { id?: number; url: string };

export default function ProductGallery({ images }: { images: Img[] }) {
  const safeImages = useMemo(() => {
    const list = (images ?? []).filter((i) => i?.url);
    return list.length > 0 ? list : [{ url: "" }];
  }, [images]);

  const [active, setActive] = useState(0);

  const activeUrl = safeImages[active]?.url;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Thumbnails */}
      <div className="md:col-span-1 order-2 md:order-1">
        <div className="flex md:flex-col gap-3 overflow-auto md:overflow-visible">
          {safeImages.map((img, idx) => (
            <button
              key={img.id ?? idx}
              type="button"
              onClick={() => setActive(idx)}
              className={[
                "w-20 h-24 md:w-full md:h-[110px] rounded-xl border overflow-hidden bg-gray-50 flex-shrink-0",
                idx === active ? "ring-2 ring-black/60" : "hover:border-black/40",
              ].join(" ")}
            >
              {img.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.url}
                  alt={`thumb-${idx}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-xs text-gray-400">
                  No image
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main image */}
      <div className="md:col-span-4 order-1 md:order-2">
        <div className="rounded-2xl border bg-gray-50 overflow-hidden">
          <div className="relative aspect-[4/5] overflow-hidden group">
            {activeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeUrl}
                alt="product"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-gray-400">
                Product Image
              </div>
            )}

            {/* soft gradient for premium look */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Tip: Hover on image to zoom.
        </p>
      </div>
    </div>
  );
}