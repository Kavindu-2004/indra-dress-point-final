import Link from "next/link";

export const runtime = "nodejs";

export default function AboutPage() {
  return (
    <div className="w-full">

      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full h-[60vh] min-h-[450px] overflow-hidden group border-b">

        {/* Background Image with Zoom */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/about/hero.jpg"
          alt="About Indra Dress Point"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/30" />

        {/* Text */}
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 h-full flex items-center">
          <div className="max-w-3xl text-white space-y-6">
            <p className="text-sm font-medium tracking-widest uppercase text-white/80">
              INDRA DRESS POINT
            </p>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              About Us
            </h1>

            <p className="text-lg text-white/90">
              Empowering style with quality, confidence and timeless design.
            </p>

            <div className="flex gap-4 pt-2">
              <Link
                href="/category/new-arrivals"
                className="rounded-full bg-white text-black px-7 py-3 text-sm font-medium hover:opacity-90"
              >
                Shop New Arrivals
              </Link>

              <Link
                href="/"
                className="rounded-full border border-white px-7 py-3 text-sm font-medium hover:bg-white hover:text-black transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STORY SECTION ================= */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Text Side */}
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
              Our Story
            </p>

            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Fashion made for real life.
            </h2>

            <p className="mt-6 text-gray-600 leading-relaxed">
              Indra Dress Point creates modern collections designed for everyday confidence.
              From workwear to evening styles, we focus on clean silhouettes,
              premium fabrics, and refined finishing.
            </p>

            <p className="mt-4 text-gray-600 leading-relaxed">
              Our mission is simple: deliver elegant fashion that feels effortless.
              We constantly introduce fresh arrivals to help you stay inspired.
            </p>

            <div className="mt-8 flex gap-3">
              <Link
                href="/category/workwear"
                className="rounded-full bg-black text-white px-6 py-3 text-sm font-medium hover:opacity-90"
              >
                Explore Workwear
              </Link>

              <Link
                href="/category/dresses"
                className="rounded-full border px-6 py-3 text-sm font-medium hover:bg-gray-50"
              >
                View Dresses
              </Link>
            </div>
          </div>

          {/* Image Side with Zoom Animation */}
          <div className="rounded-3xl overflow-hidden border bg-gray-100 group relative">

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about/story.jpg"
              alt="Indra Dress Point Story"
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />

            {/* Soft Overlay on Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-700" />
          </div>

        </div>
      </section>

      {/* ================= VALUES SECTION ================= */}
      <section className="max-w-[1280px] mx-auto px-6 pb-20">
        <div className="border rounded-3xl p-10 md:p-14 bg-white">

          <div className="mb-10">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
              What We Stand For
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Quality. Fit. Style.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="rounded-2xl border p-6 hover:shadow-md transition">
              <h3 className="font-semibold text-lg">Premium Feel</h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Carefully selected fabrics and precise finishing
                ensure a polished look that lasts.
              </p>
            </div>

            <div className="rounded-2xl border p-6 hover:shadow-md transition">
              <h3 className="font-semibold text-lg">Everyday Comfort</h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Designed for movement and real-life wear —
                fashion that feels as good as it looks.
              </p>
            </div>

            <div className="rounded-2xl border p-6 hover:shadow-md transition">
              <h3 className="font-semibold text-lg">Fresh Collections</h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                Frequent new arrivals inspired by modern
                trends and timeless elegance.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}