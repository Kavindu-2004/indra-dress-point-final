"use client";

import Link from "next/link";
import Image from "next/image";
import { Mic, X, Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchItem = {
  id: number | string;
  name: string;
  price?: number | null;
  imageUrl?: string | null;
  href: string; // where to go on click
};

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // focus + lock scroll
  useEffect(() => {
    if (!open) return;

    setTimeout(() => inputRef.current?.focus(), 50);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // debounce query
  useEffect(() => {
    if (!open) return;

    const term = q.trim();
    if (!term) {
      setItems([]);
      setErr(null);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Search failed");
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e: any) {
        setErr(e?.message || "Search failed");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [q, open]);

  // Voice search (Web Speech API)
  const canVoice = useMemo(() => {
    if (typeof window === "undefined") return false;
    return !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition;
  }, []);

  function startVoice() {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript ?? "";
      if (text) setQ(text);
    };

    rec.start();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* ✅ LIGHT backdrop (NOT black) */}
      <div
        className="absolute inset-0 bg-white/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute inset-x-0 top-0">
        {/* Top search bar row */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <SearchIcon className="w-5 h-5 text-gray-500" />

            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="flex-1 text-base outline-none placeholder:text-gray-400"
            />

            {canVoice && (
              <button
                type="button"
                onClick={startVoice}
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50"
                aria-label="Voice search"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results area */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-sm font-semibold mb-4">Products</div>

            {loading && <div className="text-sm text-gray-600">Searching…</div>}
            {err && <div className="text-sm text-red-600">{err}</div>}

            {!loading && !err && q.trim() && items.length === 0 && (
              <div className="text-sm text-gray-600">No results found.</div>
            )}

            {items.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {items.slice(0, 8).map((p) => (
                    <Link
                      key={p.id}
                      href={p.href}
                      onClick={onClose}
                      className="group"
                    >
                      <div className="rounded-2xl border overflow-hidden bg-white hover:shadow-sm transition">
                        <div className="relative aspect-[4/5] bg-gray-100">
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="p-3">
                          <div className="text-sm font-medium line-clamp-2">
                            {p.name}
                          </div>
                          {typeof p.price === "number" && (
                            <div className="text-sm font-semibold mt-1">
                              Rs {p.price.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Link
                    href={`/search?q=${encodeURIComponent(q.trim())}`}
                    onClick={onClose}
                    className="text-sm font-semibold underline underline-offset-4"
                  >
                    See all results
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}