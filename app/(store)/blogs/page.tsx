import BlogsClient from "./BlogsClient";

export default function BlogsPage({
  searchParams,
}: {
  searchParams?: { c?: string | string[] };
}) {
  const cParam = Array.isArray(searchParams?.c)
    ? searchParams?.c[0]
    : searchParams?.c;

  return <BlogsClient initialCategory={cParam ?? "All"} />;
}