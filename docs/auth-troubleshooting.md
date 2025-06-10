# Authentication Troubleshooting Guide

This guide helps troubleshoot common authentication issues in the blog platform, particularly the "Not Authorized" error when submitting blog posts.

## Common Issues and Solutions

### "Not Authorized" Error When Submitting Posts

If you encounter a "Not Authorized" error when trying to submit a blog post despite being logged in, follow these troubleshooting steps:

1. **Check Your GitHub Username**
   - The system automatically authorizes the username "italicninja"
   - Other users need to be added to the AuthorizedPoster table
   - Make sure your GitHub **login name** (not display name) is correctly stored in the session
   - You can see your GitHub login name in the user dropdown menu after "@"

2. **Verify Environment Configuration**
   - Different environments (development, preview, production) need proper configuration
   - Run the setup script: `node scripts/setup-auth-env.js`

3. **Check Browser Console for Errors**
   - Open your browser's developer tools (F12)
   - Look for authentication-related errors in the Console tab
   - Network tab can show failed API requests

## Environment-Specific Setup

### Development Environment

Local development requires:
- `NEXTAUTH_URL=http://localhost:3000` in your `.env` file
- GitHub OAuth app with callback URL: `http://localhost:3000/api/auth/callback/github`

### Preview Deployments

Preview deployments on Vercel require:
- Dynamic `NEXTAUTH_URL` set to `${VERCEL_URL}`
- GitHub OAuth app with wildcard callback URL: `https://*.vercel.app/api/auth/callback/github`

### Production Environment

Production deployment requires:
- `NEXTAUTH_URL` set to your production URL (e.g., `https://pixel-alpha-flax.vercel.app/`)
- GitHub OAuth app with callback URL matching your production domain

## Using the Auth Setup Script

We've created a script to help set up authentication correctly across all environments:

```bash
node scripts/setup-auth-env.js
```

This script will:
1. Set up dynamic `NEXTAUTH_URL` for preview deployments
2. Verify production environment configuration
3. Update local `.env` file for development
4. Provide instructions for GitHub OAuth setup

## Manual Authorization

If a user needs to be manually authorized to post:

```bash
# Add a user to the authorized posters list
node scripts/add-authorized-poster.js <github-username>

# Grant permanent access to a user
node scripts/grant-permanent-access.js <github-username>
```

## GitHub Login vs. Display Name

A common issue with authentication is the difference between GitHub login name and display name:

1. **GitHub Login Name**: This is your actual username used for authentication (e.g., "italicninja")
   - Used in URLs: `https://github.com/italicninja`
   - Used for repository ownership
   - Used by our authorization system

2. **GitHub Display Name**: This is your profile name (e.g., "Ian")
   - Can be different from your login name
   - More user-friendly
   - Not used for authorization checks

The system has been updated to properly use your GitHub login name for authorization checks. You can see your GitHub login name in the user dropdown menu after the "@" symbol.

If you're still experiencing issues:

1. Sign out and sign back in to refresh your session
2. Check the browser console for any errors
3. Verify that your GitHub login name is correctly displayed in the user dropdown
4. Contact the administrator if you believe your GitHub login name is not being correctly stored

## Debugging Authentication Flow

The authentication flow works as follows:

1. User clicks "Sign In" and is redirected to GitHub
2. After GitHub authentication, user is redirected back to the callback URL
3. NextAuth creates a session for the authenticated user
4. When submitting a post, the system checks if the user is authorized

If this flow breaks, the most common causes are:
- Mismatched callback URLs in GitHub OAuth settings
- Incorrect `NEXTAUTH_URL` environment variable
- Session not being properly created or maintained

## Checking Authorization Status

To check if a user is authorized to post:

1. Open Prisma Studio: `npx prisma studio`
2. Navigate to the "AuthorizedPoster" table
3. Check if the user's GitHub username exists in the table

Alternatively, you can query the database directly:

```sql
SELECT * FROM "AuthorizedPoster" WHERE "githubLogin" = 'username';