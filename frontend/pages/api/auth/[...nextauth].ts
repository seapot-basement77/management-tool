// auth/[...nextauth].ts
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
      if (user) {
        token.id = user.id;
        token.email = user.email ?? "";
        token.name = user.name ?? "";
        token.image = user.image ?? "";
      } else if (token.email && !token.id) {
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
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },

    async redirect({ baseUrl, url }: { baseUrl: string; url: string }) {
      const isAuthCallback = url.startsWith("/api/auth/callback");
      if (!isAuthCallback) return url;

      try {
        console.log("🚀 ログイン後リダイレクト判定開始");

        // セッション取得
        const user = await prisma.user.findFirst({
          where: {
            emailVerified: {
              not: null,
            },
          },
          include: {
            workspaces: true,
          },
        });

        if (user?.workspaces && user.workspaces.length > 0) {
          console.log("✅ 既存ワークスペースあり -> /workspace");
          return `${baseUrl}/workspace`; // すでにワークスペースに所属していれば、ワークスペースへ
        } else {
          console.log("ℹ️ ワークスペースなし -> onboarding");
          return `${baseUrl}/workspace/onboarding`; // 所属していなければ、onboardingへ
        }
      } catch (error) {
        console.error("❌ リダイレクトエラー:", error);
        return `${baseUrl}/workspace/onboarding`; // エラー時もonboarding
      }
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
