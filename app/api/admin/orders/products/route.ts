// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import { writeFile } from "fs/promises";
import { getServerSession } from "next-auth";
import { authOptionsAdmin } from "@/lib/auth-admin";

export const runtime = "nodejs";

function isAdminEmail(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // DEV MODE: if not set, allow
  if (list.length === 0) return true;

  return !!email && list.includes(email.toLowerCase());
}

async function requireAdmin() {
  const session = await getServerSession(authOptionsAdmin);
  if (!isAdminEmail(session?.user?.email)) return null;
  return session;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET(_req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { images: true, category: true, inventory: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();

  const name = String(form.get("name") || "").trim();
  const description = String(form.get("description") || "").trim();
  const price = Number(form.get("price") || 0);
  const categorySlug = String(form.get("categorySlug") || "").trim();
  const imageFile = form.get("image") as File | null;

  if (!name || !price || !categorySlug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const slug = slugify(name);

  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(imageFile.name) || ".jpg";
    const fileName = `${Date.now()}-${slug}${ext}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(filePath, buffer);
    imageUrl = `/uploads/${fileName}`;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description || null,
      price,
      categoryId: category.id,
      images: imageUrl ? { create: [{ url: imageUrl }] } : undefined,
      inventory: { create: { qtyOnHand: 0, lowStockThreshold: 5 } },
    },
    include: { images: true, category: true, inventory: true },
  });

  return NextResponse.json(product);
}

// ✅ DELETE PRODUCT
export async function DELETE(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    // if FK constraint (order items), deletion fails
    return NextResponse.json(
      { error: "Cannot delete. Product is used in an order." },
      { status: 409 }
    );
  }
}

// ✅ UPDATE PRODUCT
export async function PUT(req: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();

  const id = Number(form.get("id") || 0);
  const name = String(form.get("name") || "").trim();
  const description = String(form.get("description") || "").trim();
  const price = Number(form.get("price") || 0);
  const categorySlug = String(form.get("categorySlug") || "").trim();
  const imageFile = form.get("image") as File | null;

  if (!id || !name || !price || !categorySlug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  // Update basic fields (keep slug unchanged to avoid breaking links)
  await prisma.product.update({
    where: { id },
    data: {
      name,
      description: description || null,
      price,
      categoryId: category.id,
    },
  });

  // Optional: replace image if uploaded
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(imageFile.name) || ".jpg";
    const fileName = `${Date.now()}-${id}${ext}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(filePath, buffer);
    const imageUrl = `/uploads/${fileName}`;

    // Replace old images with new
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productImage.create({
      data: { productId: id, url: imageUrl },
    });
  }

  const refreshed = await prisma.product.findUnique({
    where: { id },
    include: { images: true, category: true, inventory: true },
  });

  return NextResponse.json(refreshed);
}