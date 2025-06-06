import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { getBaseUrl } from "@/lib/auth-utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Dynamically determine the base URL for any environment
  basePath: "/api/auth",
  callbacks: {
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
});

export const { GET, POST } = handlers;