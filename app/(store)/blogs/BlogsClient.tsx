"use client";

import Link from "next/link";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  video: string;
  poster?: string;
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
  },
  {
    slug: "new-arrivals",
    title: "Long sleeves. Soft ruffles. Pure elegance 🤍",
    excerpt: "Textures, tones and silhouettes we love.",
    category: "New Arrivals",
    date: "FEBRUARY 20, 2026",
    video: "/blog/post-2.mp4",
    poster: "/blog/post-2.jpg",
  },
  {
    slug: "evening-wear",
    title: "The Front Twist Gold Detail Dress — our most-loved style, now restocked in limited pieces 🤍",
    excerpt: "Perfect combinations for events.",
    category: "Evening Wear",
    date: "FEBRUARY 10, 2026",
    video: "/blog/post-3.mp4",
    poster: "/blog/post-3.jpg",
  },
  {
    slug: "style-guide",
    title: "Subtle charm, timeless grace 🌿\nThis sleeveless tiered maxi is made for moments that matter.",
    excerpt: "Neutral tones and timeless silhouettes.",
    category: "Style",
    date: "FEBRUARY 05, 2026",
    video: "/blog/post-4.mp4",
    poster: "/blog/post-4.jpg",
  },
];

type BlogsClientProps = {
  initialCategory?: string;
};

export default function BlogsClient({ initialCategory }: BlogsClientProps) {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        <h1 className="text-4xl font-semibold text-center tracking-tight mb-14">
          Article
        </h1>

        {/* 2 × 2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blogs/${post.slug}`}
              className="block group"
            >
              <div className="rounded-3xl overflow-hidden border bg-white hover:shadow-md transition">

                {/* 🎥 Medium Height Video */}
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                  <video
                    src={post.video}
                    poster={post.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Date Badge */}
                  <div className="absolute bottom-4 left-4 bg-white px-4 py-2 text-xs rounded-full border shadow-sm">
                    {post.date}
                  </div>
                </div>

                {/* Text Content */}
                <div className="p-6">
                  <div className="text-sm text-gray-500">
                    {post.category}
                  </div>

                  <h2 className="text-xl font-semibold mt-2 group-hover:underline">
                    {post.title}
                  </h2>

                  <p className="text-gray-700 mt-2 text-sm">
                    {post.excerpt}
                  </p>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}