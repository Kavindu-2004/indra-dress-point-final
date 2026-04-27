// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs"; // ✅ Prisma + NextAuth should run on nodejs runtime

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };