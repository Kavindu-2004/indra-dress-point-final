import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function makeUniqueProductSlug(baseName: string, excludeId?: number) {
  const baseSlug = slugify(baseName) || `product-${Date.now()}`;
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: excludeId
        ? {
            slug,
            NOT: { id: excludeId },
          }
        : { slug },
      select: { id: true },
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${count}`;
    count += 1;
  }
}

async function fileToDataUrl(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const mime = file.type || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function findCategory(formData: FormData) {
  const categorySlug =
    String(formData.get("categorySlug") || "").trim() ||
    String(formData.get("category") || "").trim();

  const categoryId = toNumber(formData.get("categoryId"));

  if (categoryId > 0) {
    return prisma.category.findUnique({
      where: { id: categoryId },
    });
  }

  if (categorySlug) {
    return prisma.category.findUnique({
      where: { slug: categorySlug },
    });
  }

  return null;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
        inventory: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = toNumber(formData.get("price"));
    const stock = toNumber(formData.get("stock"));
    const image = formData.get("image");

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Valid product price is required" },
        { status: 400 }
      );
    }

    if (stock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    const category = await findCategory(formData);

    if (!category) {
      return NextResponse.json(
        { error: "Selected category not found" },
        { status: 400 }
      );
    }

    const slug = await makeUniqueProductSlug(name);

    let imageUrl: string | null = null;

    if (image instanceof File && image.size > 0) {
      imageUrl = await fileToDataUrl(image);
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        isActive: true,
        category: {
          connect: { id: category.id },
        },
        inventory: {
          create: {
            qtyOnHand: stock,
          },
        },
        ...(imageUrl
          ? {
              images: {
                create: [{ url: imageUrl }],
              },
            }
          : {}),
      },
      include: {
        images: true,
        category: true,
        inventory: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();

    const id = toNumber(formData.get("id"));
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const price = toNumber(formData.get("price"));
    const stock = toNumber(formData.get("stock"));
    const image = formData.get("image");

    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Valid product price is required" },
        { status: 400 }
      );
    }

    if (stock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    const category = await findCategory(formData);

    if (!category) {
      return NextResponse.json(
        { error: "Selected category not found" },
        { status: 400 }
      );
    }

    const slug = await makeUniqueProductSlug(name, id);

    let imageUrl: string | null = null;

    if (image instanceof File && image.size > 0) {
      imageUrl = await fileToDataUrl(image);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        price,
        category: {
          connect: { id: category.id },
        },
        inventory: {
          upsert: {
            create: {
              qtyOnHand: stock,
            },
            update: {
              qtyOnHand: stock,
            },
          },
        },
        ...(imageUrl
          ? {
              images: {
                deleteMany: {},
                create: [{ url: imageUrl }],
              },
            }
          : {}),
      },
      include: {
        images: true,
        category: true,
        inventory: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}