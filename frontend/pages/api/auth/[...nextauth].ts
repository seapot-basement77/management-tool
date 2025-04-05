import NextAuth, { NextAuthOptions, Session, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: User }) {
      console.log("✅ signIn user情報:", user.email);

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      if (!existingUser) {
        console.log("✅ 新規ユーザー登録します");
        await prisma.user.create({
          data: {
            name: user.name ?? "No Name",
            email: user.email!,
            image: user.image,
          },
        });
      } else {
        console.log("ℹ️ 既存ユーザー:", user.email);
      }

      return true;
    },

    async jwt({ token, user }: { token: JWT; user?: User }) {
      // サインイン直後
      if (user) {
        token.id = user.id;
        token.email = user.email ?? "";
        token.name = user.name ?? "";
        token.image = user.image ?? "";
      }

      // サインイン以外（ページリロード後など）
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      console.log("✅ SESSION token情報:", token);
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },

    async redirect({ baseUrl, url }: { baseUrl: string; url: string }) {
      const isDefaultSignIn = url.startsWith("/api/auth/callback");
      if (isDefaultSignIn) {
        return `${baseUrl}/onboarding`;
      }
      return url;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export default handler;
