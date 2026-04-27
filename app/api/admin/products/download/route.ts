import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        images: true,
        inventory: true,
      },
    });

    const header = [
      "Product ID",
      "Name",
      "Slug",
      "Description",
      "Price",
      "Category",
      "Is Active",
      "Stock Qty",
      "Low Stock Threshold",
      "Image Count",
      "Created At",
      "Updated At",
    ];

    const rows = products.map((product) => [
      product.id,
      product.name,
      product.slug,
      product.description || "",
      product.price,
      product.category?.name || "",
      product.isActive ? "Yes" : "No",
      product.inventory?.qtyOnHand ?? 0,
      product.inventory?.lowStockThreshold ?? 0,
      product.images?.length ?? 0,
      new Date(product.createdAt).toLocaleString(),
      new Date(product.updatedAt).toLocaleString(),
    ]);

    const csv = [
      header.join(","),
      ...rows.map((row) => row.map((value) => escapeCsv(value)).join(",")),
    ].join("\n");

    const fileName = `products-report-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Download products report error:", error);
    return NextResponse.json(
      { error: "Failed to download products report" },
      { status: 500 }
    );
  }
}