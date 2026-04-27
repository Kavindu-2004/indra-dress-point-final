import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPublicImageUrl(rawUrl: string | null | undefined, appUrl: string) {
  if (!rawUrl) {
    return "https://via.placeholder.com/300x400?text=Product";
  }

  const trimmed = rawUrl.trim();

  if (!trimmed) {
    return "https://via.placeholder.com/300x400?text=Product";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${appUrl}${normalizedPath}`;
}

export async function POST(req: Request) {
  try {
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const subscribers = await prisma.newsletter.findMany({
      select: { email: true },
      orderBy: { createdAt: "desc" },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No subscribers found" },
        { status: 400 }
      );
    }

    const latestProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(
      /\/$/,
      ""
    );

    const fromEmail =
      process.env.NEWSLETTER_FROM ||
      "Indra Dress Point <onboarding@resend.dev>";

    const intro = escapeHtml(message).replace(/\n/g, "<br/>");

    const productsHtml = latestProducts
      .map((product) => {
        const rawImage = product.images?.[0]?.url;
        const image = getPublicImageUrl(rawImage, appUrl);
        const category = product.category?.name || "Fashion";

        return `
          <div style="width:48%; display:inline-block; vertical-align:top; margin:0 1% 20px;">
            <div style="border:1px solid #e5e5e5; border-radius:12px; overflow:hidden; background:#fff;">
              <img
                src="${image}"
                alt="${escapeHtml(product.name)}"
                style="width:100%; height:260px; object-fit:cover; display:block;"
              />
              <div style="padding:14px;">
                <div style="font-size:12px; color:#666; margin-bottom:6px;">
                  ${escapeHtml(category)}
                </div>
                <div style="font-size:16px; font-weight:600; color:#111; margin-bottom:8px;">
                  ${escapeHtml(product.name)}
                </div>
                <div style="font-size:15px; font-weight:700; color:#111; margin-bottom:12px;">
                  Rs ${Number(product.price).toLocaleString()}
                </div>
                <a
                  href="${appUrl}/products/${product.id}"
                  style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:10px 16px;border-radius:999px;font-size:13px;"
                >
                  View Product
                </a>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; background:#f6f6f6; padding:24px;">
        <div style="max-width:700px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden;">
          <div style="background:#000; color:#fff; padding:24px; text-align:center;">
            <h1 style="margin:0; font-size:28px;">INDRA DRESS POINT</h1>
            <p style="margin:8px 0 0; font-size:14px; color:#ddd;">
              Latest updates from our store
            </p>
          </div>

          <div style="padding:28px;">
            <h2 style="margin-top:0; font-size:24px; color:#111;">
              ${escapeHtml(subject)}
            </h2>

            <p style="font-size:15px; color:#444; line-height:1.6;">
              ${intro}
            </p>

            ${
              latestProducts.length > 0
                ? `
              <div style="margin-top:24px; font-size:0;">
                ${productsHtml}
              </div>

              <div style="text-align:center; margin-top:24px;">
                <a
                  href="${appUrl}/category/new-arrivals"
                  style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-size:14px;font-weight:600;"
                >
                  Shop New Arrivals
                </a>
              </div>
            `
                : ""
            }
          </div>

          <div style="background:#f1f1f1; padding:18px; text-align:center; font-size:12px; color:#666;">
            © 2026 Indra Dress Point<br/>
            You received this email because you subscribed to our newsletter.
          </div>
        </div>
      </div>
    `;

    const emails = subscribers.map((s) => s.email);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: emails,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send newsletter" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Newsletter sent successfully",
      data,
      totalRecipients: emails.length,
    });
  } catch (error) {
    console.error("Send newsletter error:", error);
    return NextResponse.json(
      { error: "Something went wrong while sending newsletter" },
      { status: 500 }
    );
  }
}