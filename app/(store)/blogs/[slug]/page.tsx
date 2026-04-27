"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  video: string;
  poster?: string;

  // ✅ per-slug details
  content: Array<
    | { type: "h2"; text: string }
    | { type: "p"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "tip"; text: string }
  >;
};

const POSTS: BlogPost[] = [
  {
    slug: "workday-flow",
    title: "Where prints meet structure 🔥",
    excerpt: "Style your white shirt effortlessly.",
    category: "Workwear",
    date: "JANUARY 29, 2026",
    video: "/blog/post-1.mp4",
    poster: "/blog/post-1.jpg",
    content: [
      { type: "p", text: "A crisp white shirt is the most powerful piece in a work wardrobe — it always looks premium and clean." },
      { type: "h2", text: "3 easy outfit formulas" },
      { type: "ul", items: ["White shirt + black skirt + minimal jewelry", "White shirt + wide-leg trouser + belt", "White shirt + blazer + pointed flats"] },
      { type: "tip", text: "Keep the shirt slightly oversized and tuck only the front for a modern silhouette." },
    ],
  },
  {
    slug: "new-arrivals",
    title: "New Arrivals: February Drop Highlights",
    excerpt: "Textures, tones and silhouettes we love.",
    category: "New Arrivals",
    date: "FEBRUARY 20, 2026",
    video: "/blog/post-2.mp4",
    poster: "/blog/post-2.jpg",
    content: [
      { type: "p", text: "This drop is all about easy-to-wear silhouettes and soft tones that work for both day and night." },
      { type: "h2", text: "What’s trending in this drop" },
      { type: "ul", items: ["Soft pinks & neutrals", "Clean tailoring", "Minimal prints", "Comfort-first fabrics"] },
      { type: "tip", text: "Pair new arrivals with neutral footwear so the outfit looks expensive and balanced." },
    ],
  },
  {
    slug: "evening-wear",
    title: "Evening Wear: 5 Looks That Always Work",
    excerpt: "Perfect combinations for events.",
    category: "Evening Wear",
    date: "FEBRUARY 10, 2026",
    video: "/blog/post-3.mp4",
    poster: "/blog/post-3.jpg",
    content: [
      { type: "p", text: "When you need a guaranteed outfit for dinners and events, stick to these reliable combinations." },
      { type: "h2", text: "The 5 looks" },
      { type: "ul", items: ["Black dress + gold accessories", "Satin skirt + fitted top", "Monochrome set + statement bag", "Blazer dress + heels", "Minimal dress + bold earrings"] },
      { type: "tip", text: "One statement item is enough — keep everything else minimal." },
    ],
  },
  {
    slug: "style-guide",
    title: "Minimal Style Guide 2026",
    excerpt: "Neutral tones and timeless silhouettes.",
    category: "Style",
    date: "FEBRUARY 05, 2026",
    video: "/blog/post-4.mp4",
    poster: "/blog/post-4.jpg",
    content: [
      { type: "p", text: "Minimal style isn’t boring — it’s intentional. The secret is fit, fabric and clean proportions." },
      { type: "h2", text: "Minimal rules that always work" },
      { type: "ul", items: ["Choose 2–3 core colors", "Repeat silhouettes you love", "Avoid too many logos", "Prefer clean accessories"] },
      { type: "tip", text: "If the outfit feels plain, upgrade the bag/shoes instead of adding extra layers." },
    ],
  },
];

function BlockRenderer({ blocks }: { blocks: BlogPost["content"] }) {
  return (
    <div className="prose max-w-none mt-10">
      {blocks.map((b, i) => {
        if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
        if (b.type === "p") return <p key={i}>{b.text}</p>;
        if (b.type === "ul")
          return (
            <ul key={i}>
              {b.items.map((x, idx) => (
                <li key={idx}>{x}</li>
              ))}
            </ul>
          );
        if (b.type === "tip")
          return (
            <div
              key={i}
              className="not-prose mt-4 rounded-2xl border bg-gray-50 px-4 py-3 text-sm text-gray-800"
            >
              <b>Tip:</b> {b.text}
            </div>
          );
        return null;
      })}
    </div>
  );
}

export default function BlogSlugPage() {
  const params = useParams();
  const slug = String(params?.slug || "");
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold">Post not found</h1>
        <p className="text-gray-600 mt-2">
          The blog article you requested does not exist.
        </p>
        <Link
          href="/blogs"
          className="inline-flex mt-6 rounded-full bg-black text-white px-6 py-3 text-sm font-medium"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link href="/blogs" className="text-sm text-gray-600 hover:text-black">
            ← Back
          </Link>

          <div className="text-xs text-gray-500">
            {post.category} • {post.date}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {post.title}
        </h1>
        <p className="text-gray-700 mt-3 max-w-3xl">{post.excerpt}</p>

        {/* Video full width */}
        <div className="mt-10 rounded-3xl overflow-hidden border bg-gray-100">
          <div className="relative aspect-[16/9]">
            <video
              src={post.video}
              poster={post.poster}
              controls
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* ✅ Real per-slug content */}
        <BlockRenderer blocks={post.content} />
      </div>
    </div>
  );
}