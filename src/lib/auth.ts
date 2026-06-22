import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Pre-computed bcrypt hash for admin user (generated via Node)
const ADMIN_EMAIL = "davor.pernek@ro-tea.hr";
const ADMIN_HASH = "$2b$12$8jorHL6jZDEk8uP2AYHI5e077VCRXA8krtse5EzvQwZMiMAFn7UCa";

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

        if (email !== ADMIN_EMAIL) return null;

        const validPassword = await bcrypt.compare(password, ADMIN_HASH);
        if (!validPassword) return null;

        return {
          id: "admin-davor",
          name: "Davor Pernjek",
          email: ADMIN_EMAIL,
          role: "ADMIN",
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
