import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import * as schema from "@/db/schema/auth";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, { usersTable: schema.users }),
  providers: [
    EmailProvider({
      server: {
        host: process.env.NEXT_PUBLIC_EMAIL_SERVER_HOST,
        port: Number(process.env.NEXT_PUBLIC_EMAIL_SERVER_PORT),
        auth: {
          user: process.env.NEXT_PUBLIC_EMAIL_SERVER_USER!,
          pass: process.env.NEXT_PUBLIC_EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.NEXT_PUBLIC_EMAIL_FROM,
      maxAge: 45 * 60,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub!,
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
