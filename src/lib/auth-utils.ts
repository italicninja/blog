/**
 * Authentication utilities for handling dynamic Vercel deployment URLs
 */

/**
 * Determines the appropriate base URL for authentication based on the current environment
 * Works with Vercel's dynamic preview deployment URLs
 */
export function getBaseUrl(): string {
  // For server-side rendering
  if (typeof window === 'undefined') {
    // 1. Explicit NEXTAUTH_URL takes precedence if set
    if (process.env.NEXTAUTH_URL) {
      return process.env.NEXTAUTH_URL;
    }

    // 2. VERCEL_URL is automatically set by Vercel in all environments
    if (process.env.VERCEL_URL) {
      // Make sure to use https for Vercel deployments
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // 3. Check for Vercel preview deployment URL pattern
    if (process.env.VERCEL_ENV === 'preview') {
      // If we're in a preview but don't have VERCEL_URL, try to construct it
      const projectName = process.env.VERCEL_PROJECT_NAME || 'blog';
      const teamSlug = process.env.VERCEL_TEAM_SLUG || 'italicninjas-projects';
      // This is a fallback pattern that might work for some preview deployments
      return `https://${projectName}-git-main-${teamSlug}.vercel.app`;
    }
    
    // 4. Fallback for local development
    return 'http://localhost:3000';
  }
  
  // For client-side rendering, use the current window location
  return window.location.origin;
}

/**
 * Gets the callback URL for a specific provider
 */
export function getCallbackUrl(provider: string): string {
  return `${getBaseUrl()}/api/auth/callback/${provider}`;
}