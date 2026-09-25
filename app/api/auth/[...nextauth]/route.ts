import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const nameParts = user.name?.trim().split(" ") || [];

        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        const { error } = await supabaseAdmin
          .from("profiles")
          .upsert(
            {
              user_id: account.providerAccountId,
              first_name: firstName,
              last_name: lastName,
              email: user.email,
            },
            {
              onConflict: "user_id",
            }
          );

        if (error) {
          console.error("Supabase profile error:", error);
        }
      }

      return true;
    },



    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = account.providerAccountId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id || token.sub;
      }
      return session;
    },
  },

  pages: {
    signIn: "/register",
    error: "/register", // Redirect any auth errors back to /register instead of default error page
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };