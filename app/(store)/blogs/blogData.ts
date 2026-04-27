export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  hero?: { kind: "video" | "image"; src: string; poster?: string };
  content: Array<
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "img"; src: string; alt?: string }
  >;
};

export const BLOGS: BlogPost[] = [
  {
    slug: "workday-flow",
    title: "Workday Flow: The White Shirt, Perfected",
    date: "FEBRUARY 28, 2026",
    category: "Workwear",
    hero: { kind: "video", src: "/blog/post-1.mp4", poster: "/blog/post-1.jpg" },
    content: [
      { type: "p", text: "A clean white shirt is the ultimate wardrobe hero..." },
      { type: "h2", text: "3 easy ways to style it" },
      { type: "ul", items: ["With a pencil skirt", "With wide-leg trousers", "Under a blazer"] },
      { type: "p", text: "Finish with minimal accessories for a premium look." },
    ],
  },
  {
    slug: "evening-wear",
    title: "Evening Wear: 5 Looks That Always Work",
    date: "FEBRUARY 10, 2026",
    category: "Evening Wear",
    hero: { kind: "video", src: "/blog/post-3.mp4", poster: "/blog/post-3.jpg" },
    content: [
      { type: "p", text: "Dinner plans? Events? These combinations never fail..." },
      { type: "h2", text: "The 5 looks" },
      { type: "ul", items: ["Black dress + gold jewelry", "Satin skirt + fitted top", "Monochrome set", "Statement bag moment", "Heels + sleek hair"] },
    ],
  },
];