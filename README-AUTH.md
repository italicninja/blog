# Next.js Authentication with GitHub

This project uses NextAuth.js for authentication with GitHub as the provider.

## Setup Instructions

### 1. Create a GitHub OAuth App

1. Go to your GitHub account settings
2. Navigate to "Developer settings" > "OAuth Apps" > "New OAuth App"
3. Fill in the following details:
   - **Application name**: Your app name (e.g., "My Next.js Blog")
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. After creating the app, you'll see your Client ID
6. Generate a new Client Secret

### 2. Configure Environment Variables

1. Copy the Client ID and Client Secret from your GitHub OAuth App
2. Update the `.env.local` file with your credentials:

```
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

For the `NEXTAUTH_SECRET`, you can generate a secure random string using:
```
openssl rand -base64 32
```

### 3. Configure Next.js for GitHub Avatar Images

To display GitHub avatar images using Next.js Image component, you need to configure the allowed image domains in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
};

export default nextConfig;
```

This configuration allows Next.js to load and optimize images from GitHub's avatar service.

### 4. Run the Application

```
npm run dev
```

## Authentication Flow

- The header displays a "Sign in with GitHub" button when not authenticated
- After signing in, the user's GitHub avatar is displayed in the header
- Clicking the avatar shows a dropdown menu with the option to sign out
- The authentication state is managed by NextAuth.js and persists across page refreshes

## Implementation Details

- NextAuth.js is configured in `src/app/api/auth/[...nextauth]/route.ts`
- The session provider is set up in `src/app/providers.tsx`
- The header component in `src/components/Header.tsx` handles the UI for authentication
- Custom sign-in and error pages are implemented in `src/app/auth/`