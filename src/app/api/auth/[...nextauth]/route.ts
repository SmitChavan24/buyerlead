import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db"; // your drizzle db
import { users } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 1. Try to find user
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));

        if (!user) {
          // 2. Auto-create new user if not exists
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const [newUser] = await db
            .insert(users)
            .values({
              email: credentials.email,
              password: hashedPassword,
              name: credentials.email.split("@")[0], // fallback name
              role: "user", // default role
            })
            .returning();

          return newUser;
        }

        // 3. Validate password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
