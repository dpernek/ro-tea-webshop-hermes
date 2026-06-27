import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { checkLoginBruteForce } from "@/lib/rate-limiter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Lozinka", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        // Brute-force protection: block after 5 failed attempts per email per minute
        const bruteForce = checkLoginBruteForce("0.0.0.0", email);
        if (bruteForce.blocked) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.active === false) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name ?? user.email, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = (token as any).role;
      return session;
    },
  },
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  trustHost: true,
});
