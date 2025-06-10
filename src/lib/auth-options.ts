import GithubProvider from "next-auth/providers/github";
import { getBaseUrl } from "@/lib/auth-utils";
import { JWT } from "next-auth/jwt";
import { Session, AuthOptions, Account, Profile, User } from "next-auth";

// Extend the Session type to include githubLogin
declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubLogin?: string | null;
    };
  }
}

// Extend the JWT type to include githubLogin
declare module "next-auth/jwt" {
  interface JWT {
    githubLogin?: string;
  }
}

// Configure NextAuth options
export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.login || profile.name,
          email: profile.email,
          image: profile.avatar_url,
          githubLogin: profile.login,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Base path is automatically set to /api/auth
  callbacks: {
    async session({ session, token }) {
      // Add the GitHub login to the session
      if (session.user) {
        session.user.githubLogin = token.githubLogin;
      }
      return session;
    },
    async jwt({ token, user, account, profile }: {
      token: JWT;
      user?: User;
      account: Account | null;
      profile?: Profile & { login?: string };
    }) {
      // Add the GitHub login to the token
      if (profile && account?.provider === 'github' && profile.login) {
        token.githubLogin = profile.login;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Always use the dynamically determined base URL
      const dynamicBaseUrl = getBaseUrl();

      // If the URL is relative, prefix it with the dynamic base URL
      if (url.startsWith("/")) {
        return `${dynamicBaseUrl}${url}`;
      }
      // If the URL is already absolute but on the same site, allow it
      else if (url.startsWith(dynamicBaseUrl)) {
        return url;
      }
      // Otherwise, redirect to the homepage
      return dynamicBaseUrl;
    }
  }
};