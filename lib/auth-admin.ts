// lib/auth-admin.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const isProd = process.env.NODE_ENV === "production";

export const authOptionsAdmin: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");

        const adminPassword = String(process.env.ADMIN_PASSWORD || "");

        const allowed = String(process.env.ADMIN_EMAILS || "")
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);

        if (!email || !password) return null;
        if (!allowed.length || !adminPassword) return null;

        if (allowed.includes(email) && password === adminPassword) {
          return {
            id: "admin-1",
            name: "Admin",
            email,
            role: "ADMIN",
          } as any;
        }

        return null;
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/admin/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = "ADMIN";
        token.email = (user as any).email;
        token.name = (user as any).name;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).email = token.email;
        (session.user as any).name = token.name;
      }
      return session;
    },
  },

  // ✅ IMPORTANT: cookie must be valid for BOTH /admin/* and /api/admin/*
  // so path MUST be "/"
  cookies: {
    sessionToken: {
      name: isProd
        ? "__Secure-admin-next-auth.session-token"
        : "admin-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/", // ✅ FIX
        secure: isProd,
      },
    },
    callbackUrl: {
      name: isProd
        ? "__Secure-admin-next-auth.callback-url"
        : "admin-next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/", // ✅ FIX
        secure: isProd,
      },
    },
    csrfToken: {
      name: isProd
        ? "__Host-admin-next-auth.csrf-token"
        : "admin-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/", // ✅ FIX
        secure: isProd,
      },
    },
  },
};