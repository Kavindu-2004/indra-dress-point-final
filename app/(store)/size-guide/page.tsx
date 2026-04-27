import Link from "next/link";

export default function SizeGuidePage() {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Size Guide
          </h1>

          <Link href="/" className="text-sm text-gray-600 hover:text-black">
            ← Back to Home
          </Link>
        </div>

        <p className="text-gray-700 max-w-3xl">
          Use the charts below to find your best fit. If you’re between sizes,
          we recommend sizing up for comfort.
        </p>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border overflow-hidden bg-white">
            <div className="p-5 border-b">
              <div className="font-semibold">Size Chart 1</div>
              <div className="text-sm text-gray-600">
                Measurements in inches/cm (as shown in chart)
              </div>
            </div>

            <div className="bg-gray-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/size-guide/size-chart-1.jpg"
                alt="Size chart 1"
                className="w-full h-auto rounded-2xl border bg-white"
              />
            </div>
          </div>

          <div className="rounded-3xl border overflow-hidden bg-white">
            <div className="p-5 border-b">
              <div className="font-semibold">Size Chart 2</div>
              <div className="text-sm text-gray-600">
                Measurements in inches/cm (as shown in chart)
              </div>
            </div>

            <div className="bg-gray-50 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/size-guide/size-chart-2.jpg"
                alt="Size chart 2"
                className="w-full h-auto rounded-2xl border bg-white"
              />
            </div>
          </div>
        </div>

        {/* Small tips box */}
        <div className="rounded-3xl border bg-gray-50 p-6">
          <div className="font-semibold">Quick Tips</div>
          <ul className="list-disc pl-5 mt-3 text-sm text-gray-700 space-y-1">
            <li>Measure bust/waist/hips on light clothing for accuracy.</li>
            <li>If you’re between sizes, choose the larger size.</li>
            <li>Need help? Contact us — we’ll recommend a size.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}