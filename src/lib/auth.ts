import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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

        // --- First-run auto-seed: if DB has zero users and env vars are set ---
        try {
          const count = await db.user.count();
          if (count === 0) {
            const seedEmail = process.env.ADMIN_EMAIL;
            const seedPassword = process.env.ADMIN_PASSWORD;
            if (seedEmail && seedPassword) {
              const hash = await bcrypt.hash(seedPassword, 12);
              await db.user.create({
                data: {
                  name: "Admin",
                  email: seedEmail.toLowerCase().trim(),
                  passwordHash: hash,
                  role: "ADMIN",
                },
              });
              console.log(
                "[auth] Auto-seeded admin user:",
                seedEmail.toLowerCase().trim()
              );
            }
          }
        } catch (e) {
          console.error("[auth] Auto-seed check failed:", e);
        }

        // --- Verify against DB User table ---
        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
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
