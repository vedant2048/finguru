import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPassword } from "@/lib/auth/password";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();

        try {
          const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("email", email)
            .limit(1)
            .maybeSingle();

          if (error || !profile) {
            return null;
          }

          if (profile.password_hash) {
            const isValid = verifyPassword(credentials.password, profile.password_hash);
            if (!isValid) {
              return null;
            }
          }

          const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email;

          return {
            id: profile.user_id || `usr_${profile.id}`,
            email: profile.email,
            name: fullName,
          };
        } catch (err) {
          console.error("[nextauth] authorize error:", err);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const nameParts = user.name?.trim().split(/\s+/) || [];
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";
          const googleUserId = account.providerAccountId;

          // Check if profile exists
          const { data: existing } = await supabaseAdmin
            .from("profiles")
            .select("user_id")
            .eq("email", user.email!)
            .maybeSingle();

          if (!existing) {
            await supabaseAdmin.from("profiles").insert({
              user_id: googleUserId,
              first_name: firstName,
              last_name: lastName,
              email: user.email,
              has_portfolio: null,
              portfolio_uploaded: false,
            });
          } else if (!existing.user_id) {
            await supabaseAdmin
              .from("profiles")
              .update({ user_id: googleUserId })
              .eq("email", user.email!);
          }
        } catch (err) {
          console.error("Supabase error during Google sign-in:", err);
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      if (account && account.provider === "google") {
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
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET || "wealthzy_development_secret_key_32bytes",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };