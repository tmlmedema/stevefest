import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/*
 * Who gets into /admin. Set ADMIN_EMAILS in .env.local (and in Vercel) to a
 * comma-separated list of Google account addresses. Anyone else who signs in
 * gets bounced back to the sign-in page with a "not on the list" notice.
 */
function admins(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return admins().includes(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/admin/signin",
    error: "/admin/signin",
  },
  callbacks: {
    /* The gate. No allowlist match, no session. */
    signIn({ profile }) {
      return isAdmin(profile?.email);
    },
    /* Re-check on every request, so removing someone from the list logs them
       out on their next click rather than whenever their token expires. */
    authorized({ auth: session }) {
      return isAdmin(session?.user?.email);
    },
  },
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
});
