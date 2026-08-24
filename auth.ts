import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid profile email https://www.googleapis.com/auth/calendar.events",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken as string | undefined;
        session.refreshToken = token.refreshToken as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
