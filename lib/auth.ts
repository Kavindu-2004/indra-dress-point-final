// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // ✅ Admin credentials login
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

        // ✅ supports ADMIN_EMAILS=admin@a.com,admin@b.com
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

    // ✅ Customer google login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // ✅ IMPORTANT: middleware needs JWT session
  session: { strategy: "jwt" },

  pages: {
    signIn: "/account",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role || "USER";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};