import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import { getBaseUrl } from "@/lib/auth-utils";

// Configure NextAuth options
const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  // Dynamically determine the base URL for any environment
  basePath: "/api/auth",
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
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

// Export the NextAuth handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };