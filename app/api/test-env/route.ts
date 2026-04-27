export async function GET() {
  return Response.json({
    hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthUrl: !!process.env.NEXTAUTH_URL,
    hasAuthSecret: !!process.env.NEXTAUTH_SECRET,
  });
}
