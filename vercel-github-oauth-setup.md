# Setting Up GitHub OAuth with Vercel CLI

This guide explains how to configure GitHub OAuth authentication for your Next.js application deployed on Vercel, using a single GitHub OAuth App across all environments (production, preview, and development).

## 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "OAuth Apps" and then "New OAuth App"
3. Fill in the application details:
   - **Application name**: Your App Name (e.g., "My Blog")
   - **Homepage URL**: Your production URL (e.g., `https://your-app.vercel.app`)
   - **Application description**: Optional description
   - **Authorization callback URL**: Add your production callback URL (we'll add more later)
     - `https://your-app.vercel.app/api/auth/callback/github`
4. Click "Register application"
5. After creation, you'll see your Client ID
6. Generate a new Client Secret by clicking "Generate a new client secret"
7. **Important**: Save both the Client ID and Client Secret securely

## 2. Add Multiple Callback URLs

After creating your GitHub OAuth App, you need to add callback URLs for all environments:

1. Go back to your GitHub OAuth App settings
2. In the "Authorization callback URL" field, add all environment URLs (one per line):
   ```
   https://your-app.vercel.app/api/auth/callback/github
   https://your-app-git-preview-username.vercel.app/api/auth/callback/github
   http://localhost:3000/api/auth/callback/github
   ```
3. Click "Update application"

## 3. Set Up Vercel CLI

### Install Vercel CLI
```bash
npm install -g vercel
```

### Log in to Vercel
```bash
vercel login
```

### Link Your Project
```bash
vercel link
```

## 4. Configure Environment Variables

### Check Existing Environment Variables
```bash
vercel env ls
```

### Set GitHub OAuth Variables for All Environments

If the variables already exist for production but not for other environments, add them:

#### For Preview Environment
```bash
vercel env add GITHUB_ID preview
# Enter your GitHub Client ID when prompted

vercel env add GITHUB_SECRET preview
# Enter your GitHub Client Secret when prompted
```

#### For Development Environment
```bash
vercel env add GITHUB_ID development
# Enter your GitHub Client ID when prompted

vercel env add GITHUB_SECRET development
# Enter your GitHub Client Secret when prompted
```

### Set NEXTAUTH_URL for Each Environment

The `NEXTAUTH_URL` should be different for each environment:

#### For Production (if not already set)
```bash
vercel env add NEXTAUTH_URL production
# Enter: https://your-app.vercel.app
```

#### For Preview
```bash
vercel env add NEXTAUTH_URL preview
# Enter: https://your-app-git-preview-username.vercel.app
```

#### For Development
```bash
vercel env add NEXTAUTH_URL development
# Enter: http://localhost:3000
```

### Set NEXTAUTH_SECRET (if not already set for all environments)

This should be the same across all environments for session compatibility:

```bash
vercel env add NEXTAUTH_SECRET preview
# Enter the same secret as in production

vercel env add NEXTAUTH_SECRET development
# Enter the same secret as in production
```

## 5. Apply Environment Variables

After adding all environment variables, apply them:

```bash
vercel env pull .env.local
```

This will create a local `.env.local` file with your development environment variables.

## 6. Verify Environment Variables

```bash
vercel env ls
```

Ensure all required variables are set for all environments:
- `GITHUB_ID`
- `GITHUB_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

## 7. Deploy Your Application

```bash
vercel --prod
```

## 8. Testing Authentication

1. Test production: Visit your production URL and try signing in
2. Test preview: Create a pull request to generate a preview deployment and test authentication
3. Test development: Run `npm run dev` locally and test authentication

## Troubleshooting

If authentication fails:

1. Verify callback URLs in GitHub OAuth App settings
2. Check environment variables in Vercel
3. Ensure your application is correctly configured to use NextAuth.js
4. Check browser console and server logs for errors

## Security Considerations

When using a single GitHub OAuth App across environments:

- All environments share the same Client ID and Secret
- If credentials are compromised in one environment, all environments are affected
- Consider using environment-specific OAuth Apps for production applications with sensitive data