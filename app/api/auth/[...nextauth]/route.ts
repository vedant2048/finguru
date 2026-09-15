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
        try {
          const nameParts = user.name?.trim().split(" ") || [];
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          // Upsert Google user profile in Supabase profiles table
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
            console.error("Supabase profile sync error during Google signIn:", error);
          } else {
            console.log("Supabase profile successfully synced for:", user.email);
          }
        } catch (error) {
          // Log error but do not block legitimate Google authentication
          console.error("Unexpected error syncing user profile to Supabase:", error);
        }
      }

      // Valid Google authentication always succeeds
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