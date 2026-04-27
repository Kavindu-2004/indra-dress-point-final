// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow admin login page and admin nextauth endpoints
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/auth")
  ) {
    return NextResponse.next();
  }

  // ✅ VERY IMPORTANT:
  // Use ADMIN cookie name (not default store cookie)
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-admin-next-auth.session-token"
      : "admin-next-auth.session-token";

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName,
  });

  // Not logged in
  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but not admin
  if ((token as any)?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If user goes to /admin → send to dashboard
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}