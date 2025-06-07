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
    // 1. VERCEL_URL is automatically set by Vercel in all environments
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // 2. Explicit NEXTAUTH_URL takes precedence if set
    if (process.env.NEXTAUTH_URL) {
      return process.env.NEXTAUTH_URL;
    }
    
    // 3. Fallback for local development
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