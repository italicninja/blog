# Claude Code Assistant Guide

This document contains essential guidelines and rules for working on this Next.js blog project.

## 🚨 Critical Rules

### Build Validation
**ALWAYS run `npm run build` before considering a task complete**
- Validates successful production builds
- Catches type errors, configuration issues, and build-time problems
- The build process includes Prisma schema generation (`prisma generate && next build`)
- Pay attention to warnings/errors and address them

## 📋 Project Overview

**Italicninja - Adventures in Tech & Automation**

A blog about DevOps, automation, and teaching robots to do my job. Built with Next.js 15 App Router, Prisma (PostgreSQL), NextAuth, UploadThing, and Tailwind CSS. Deployed on Vercel.

### Key Features
- GitHub OAuth authentication with custom authorization system
- Database-backed blog posts with Prisma ORM (PostgreSQL)
- Permission-based content management (CONTRIBUTOR, EDITOR, ADMIN roles)
- UploadThing integration for image uploads
- Responsive design with dark mode support
- SEO optimization with metadata generation
- Framer Motion animations
- React Server Components with selective client-side interactivity

## 🏗️ Tech Stack Overview

### Framework: Next.js ^15.3.4
- **Use App Router** for all routes and pages
- **Server components first**: Use for data fetching and rendering
- **Client components sparingly**: Only when interactivity is required (marked with `"use client"`)
- TypeScript 5.3.3+ recommended
- React 19.1.0

**IMPORTANT: Async Params Pattern (Next.js 15+)**
```typescript
// Next.js 15 requires params to be awaited
type Params = {
  slug: string;
};

export default async function BlogPostPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;  // ⚠️ MUST await params
  // ...
}
```

### Database: Prisma ^7.1.0 (PostgreSQL)
- Define schema in `prisma/schema.prisma`
- Database configuration in `prisma.config.ts` (Prisma 7 requirement)
- Always run `prisma generate` after schema changes (no longer automatic)
- Use type-safe queries with proper error handling
- Implement pagination for large datasets
- **Uses PostgreSQL with @prisma/adapter-pg** (`POSTGRES_PRISMA_URL` for connection)
- PostgreSQL full-text search is now stable (no longer a preview feature)

**Database Models:**
- `User` - Stores user info with GitHub OAuth data
- `Account` - NextAuth account linking
- `Session` - NextAuth sessions
- `Post` - Blog posts with versioning support, soft deletes (`isDeleted`), and status (`DRAFT`, `PUBLISHED`, `ARCHIVED`)
- `Tag` - Tags for categorizing posts
- `AuthorizedPoster` - Custom authorization with permission levels (`CONTRIBUTOR`, `EDITOR`, `ADMIN`)

**Pagination Pattern:**
```typescript
const posts = await prisma.post.findMany({
  where: {
    status: 'PUBLISHED',
  } as unknown as Prisma.PostWhereInput,
  include: {
    tags: true,
    author: {
      select: {
        id: true,
        name: true,
        image: true,
      },
    },
  },
  orderBy: {
    [orderBy]: orderDirection,
  },
  skip: (page - 1) * limit,
  take: limit,
});
```

**Important: Use React's `cache()` for data fetching**
```typescript
import { cache } from 'react';

export const getPostBySlug = cache(async (slug: string) => {
  // ...
});
```

**Prisma 7 Client Initialization (with Database Adapter):**
```typescript
import { PrismaClient } from '@prisma/client';

// Lazy initialization with dynamic imports to avoid bundling pg for client
function createPrismaClient() {
  if (typeof window === 'undefined') {
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');

    const pool = new Pool({
      connectionString: process.env.POSTGRES_PRISMA_URL,
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
}

export const prisma = createPrismaClient();
```

**Standalone Script Pattern (Prisma 7):**
```javascript
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Don't forget to clean up!
async function cleanup() {
  await prisma.$disconnect();
  await pool.end();
}
```

### Authentication: NextAuth ^4.24.5
- **GitHub OAuth provider** for production authentication
- **Development bypass mode** - Auto-authenticates as "developer" in dev mode
- Extend session with custom properties (e.g., `githubLogin`)
- Use proper types for session and token
- Custom authorization system via `AuthorizedPoster` database table

**Custom Authorization System:**
- Blog owner username "italicninja" is always authorized
- Other users must be in `AuthorizedPoster` table
- Permission levels: `CONTRIBUTOR`, `EDITOR`, `ADMIN`
- Granular permissions: `canPublish`, `canEdit`, `canDelete`
- Helper functions in `src/lib/authorized-posters.ts`

**Session Extension Pattern:**
```typescript
declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubLogin?: string | null;  // ⚠️ Custom field
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubLogin?: string;
  }
}
```

**Helper Scripts:**
```bash
npm run add-poster         # Add authorized poster
npm run grant-access       # Grant permanent access
```

### File Upload: UploadThing ^7.7.3
- Used for image uploads in blog posts
- Stores file metadata as JSON strings in database
- Max file size: 4MB
- Configured domains in `next.config.js`: `utfs.io`, `uploadthing.com`, `spw57w8h92.ufs.sh`

**Image Metadata Structure:**
```typescript
export interface ImageMetadata {
  fileKey: string;
  alt?: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
  createdAt?: string;
}
```

**Image URL Processing:**
Images can be stored in multiple formats. Use `getImageUrl()` from `src/lib/uploadthing-utils.ts`:
```typescript
import { getImageUrl } from '@/lib/uploadthing-utils';

// Handles JSON metadata strings, direct URLs, or file keys
const imageUrl = getImageUrl(post.coverImage);
```

**Common Image Patterns:**
- JSON metadata: `{"fileKey":"abc123","alt":"Image description"}`
- Direct URL: `https://utfs.io/f/abc123`
- Local paths: Use fallback image `/images/fallback-image.jpg`

### Styling: Tailwind CSS ^3.4.1
- Use utility classes for styling
- Implement responsive design
- Extend theme with custom values
- Avoid inline styles and `!important`

**Theme Extension Pattern:**
```typescript
theme: {
  extend: {
    fontFamily: {
      sans: ['var(--font-inter)'],
      mono: ['var(--font-roboto-mono)'],
    },
  },
}
```

### Animation: Framer Motion ^12.23.0
- Use for UI animations and transitions in **client components only**
- Implement proper motion variants
- Stagger animations for lists using `delay: index * 0.1`

**Animation Pattern (from EnhancedBlogCard):**
```typescript
"use client";  // ⚠️ Required for Framer Motion

import { motion } from 'framer-motion';

<motion.article
  className="card group flex flex-col overflow-hidden bg-background border..."
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: index * 0.1 }}
  whileHover={{ y: -5 }}
>
  {/* Content */}
</motion.article>
```

### Content Processing: Remark ^15.0.1
- Process Markdown content to HTML
- Handle image URLs from UploadThing metadata
- Convert JSON metadata in images to proper URLs
- Uses `remark-html` for HTML conversion

**Implementation in `src/lib/posts.ts`:**
```typescript
import { remark } from 'remark';
import html from 'remark-html';

export async function getPostContentHtml(content: string): Promise<string> {
  const processedContent = await remark()
    .use(html)
    .process(content);

  let htmlContent = processedContent.toString();

  // Process image URLs (handles JSON metadata, UploadThing URLs, local paths)
  // ...

  return htmlContent;
}
```

### Validation: Zod ^3.25.67
- Use for input validation in API routes and forms
- Implement proper schema validation with error handling
- Located in form components and API routes

**Validation Pattern Example:**
```typescript
import { z } from 'zod';

const PostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  coverImage: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')),
  tags: z.array(z.string().max(30, 'Tags must be less than 30 characters')).max(10, 'Maximum of 10 tags allowed'),
});
```

### Other Dependencies
- **gray-matter** (^4.0.3) - Parse frontmatter from markdown
- **slugify** (^1.6.6) - Generate URL-friendly slugs
- **react-dropzone** (^14.3.8) - File upload drag-and-drop
- **dotenv** (^17.0.1) - Environment variable management

## ✅ Best Practices

### Component Architecture
1. **Server Components First**: Default to server components for data fetching
2. **Clear Separation**: Mark client components with `"use client"` directive
3. **Proper Metadata**: Use `generateMetadata()` for SEO (see `src/app/blog/[slug]/page.tsx`)
4. **Error Handling**: Use `error.tsx` and `notFound()` for error boundaries
5. **Suspense**: Wrap async components in `<Suspense>` for loading states

### File Organization
```
src/
├── app/              # Next.js App Router pages
│   ├── api/         # API routes
│   ├── blog/        # Blog pages
│   ├── admin/       # Admin pages
│   └── auth/        # Auth pages
├── components/       # Reusable React components
├── lib/             # Utility functions and services
│   ├── prisma.ts           # Prisma client singleton (with adapter)
│   ├── posts.ts            # Post data fetching (with cache)
│   ├── auth-options.ts     # NextAuth config
│   ├── auth-utils.ts       # Auth helper functions
│   ├── authorized-posters.ts # Authorization logic
│   ├── uploadthing.ts      # UploadThing config
│   └── uploadthing-utils.ts # Image URL processing
├── utils/           # General utilities (date formatting, etc.)
└── styles/          # Global styles

prisma.config.ts     # Prisma 7 database configuration
prisma/
└── schema.prisma    # Database schema definition
```

### Performance
- **Use React's `cache()`**: Wrap data-fetching functions (see `src/lib/posts.ts`)
- **Next.js Image**: Always use `<Image>` component with proper `sizes` prop
- **Database Select**: Only fetch needed fields with Prisma `select`
- **Database Adapter**: Uses `@prisma/adapter-pg` with connection pooling via `pg` Pool
- **Indexes**: Posts table has indexes on `slug`, `status`, `authorId`, `title`
- **Code Splitting**: Dynamic imports for heavy client components (including database adapter)

### Security
- **Never expose Prisma Client to the client** - All DB access through API routes or server components
- **Input Validation**: Use Zod schemas for all user input
- **Authorization**: Check permissions with `hasPermission()` from `authorized-posters.ts`
- **Environment Variables**: Use `.env.local` for secrets (never commit)
- **Image Domains**: Whitelist in `next.config.js` (GitHub, UploadThing)
- **Sanitize Markdown**: Content is processed through Remark with safe defaults
- **Session Security**: NextAuth handles JWT securely

## 🚫 Common Pitfalls to Avoid

### Next.js 15 Specific
- ❌ **Not awaiting params** - In Next.js 15, `params` is a Promise and MUST be awaited
- ❌ Mixing server and client components incorrectly (missing `"use client"`)
- ❌ Using client-side hooks (`useState`, `useEffect`) in server components
- ❌ Forgetting to configure image domains in `next.config.js`
- ❌ Using client-side navigation (`<Link>`) for external links (use `<a>` instead)

### Prisma 7 & Database
- ❌ Not running `prisma generate` after schema changes (no longer runs automatically!)
- ❌ Forgetting type assertions for Prisma enums: `as unknown as Prisma.PostWhereInput`
- ❌ Not handling nullable fields (e.g., `post.author?.name`)
- ❌ Using raw SQL without parameterization (use `$queryRaw` with template literals)
- ❌ Not using `cache()` for repeated data fetching
- ❌ Exposing Prisma Client in client components
- ❌ Importing `pg` or `@prisma/adapter-pg` in client-side code (use dynamic imports in `prisma.ts`)
- ❌ Forgetting to configure database URL in `prisma.config.ts`
- ❌ Not using database adapter pattern in standalone scripts

### Authentication & Authorization
- ❌ Not checking `isAuthorizedPoster()` before allowing post creation
- ❌ Not checking `hasPermission()` before allowing edits/deletes
- ❌ Forgetting that "italicninja" is hardcoded as owner
- ❌ Not extending session types properly for `githubLogin`
- ❌ Using session data without checking `if (session)`

### UploadThing & Images
- ❌ Not handling JSON metadata strings in image fields
- ❌ Not using `getImageUrl()` helper for image processing
- ❌ Hardcoding image URLs instead of using metadata
- ❌ Not providing fallback images for missing/broken images
- ❌ Forgetting to add new image domains to `next.config.js`

### Tailwind CSS
- ❌ Not properly configuring content paths in `tailwind.config.js`
- ❌ Using inline styles instead of utility classes
- ❌ Using `!important` to override styles (restructure classes instead)
- ❌ Hardcoding colors instead of using theme variables

## 🎯 Endorsed Patterns

1. **Server Components First**: Use server components for data fetching, client components only for interactivity (Framer Motion, forms)
2. **Cached Data Fetching**: Wrap all data-fetching functions with React's `cache()`
3. **Permission-Based Authorization**: Use `hasPermission()` for granular access control
4. **Image URL Processing**: Always use `getImageUrl()` to handle various image formats
5. **Type-Safe Database**: Use Prisma with proper type assertions for enums
6. **Error Boundaries**: Use `notFound()`, `error.tsx`, and try-catch blocks appropriately

## ⚠️ Anti-Patterns to Avoid

1. **Prop Drilling**: Use React Context or server component composition instead
2. **Premature Optimization**: Use built-in Next.js optimizations first
3. **Overusing Client Components**: Server components provide better performance
4. **Direct Database Access from Client**: Always use API routes or server components
5. **Hardcoding Values**: Use environment variables for configuration

## 📊 Project-Specific Details

### Important Scripts
```bash
npm run dev                    # Development server
npm run build                  # Production build (includes prisma generate)
npm run start                  # Production server
npm run new-post               # Create new post
npm run add-poster             # Add authorized poster
npm run grant-access           # Grant permanent access
npm run backup-database        # Backup database
npm run migrate-production     # Run production migrations
npm run test:css               # CSS regression testing
```

### Environment Variables
Required environment variables (see `.env.example`):
- `POSTGRES_PRISMA_URL` - PostgreSQL connection string (used by Prisma 7 adapter)
- `POSTGRES_URL_NON_POOLING` - PostgreSQL direct connection (for migrations only)
- `GITHUB_ID` - GitHub OAuth client ID
- `GITHUB_SECRET` - GitHub OAuth client secret
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - Base URL for NextAuth
- `UPLOADTHING_SECRET` - UploadThing secret
- `UPLOADTHING_APP_ID` - UploadThing app ID

**Note**: Prisma 7 uses `prisma.config.ts` to load environment variables via `dotenv`.

### Database Enums
- `PermissionLevel`: `CONTRIBUTOR`, `EDITOR`, `ADMIN`
- `PostStatus`: `DRAFT`, `PUBLISHED`, `ARCHIVED`

### Special Behavior
- **Owner Username**: "italicninja" is hardcoded as owner with full permissions
- **Dev Mode**: Auto-authenticates as "developer" in development
- **Soft Deletes**: Posts use `isDeleted` flag instead of hard deletion
- **Post Versioning**: Support for `previousVersion` and `nextVersion` tracking
- **Full-Text Search**: PostgreSQL full-text search is now stable in Prisma 7

## 🔍 Debugging Tips

1. **Check Build**: Always run `npm run build` to catch type errors
2. **Check Logs**: Use `console.error` for server-side debugging
3. **Check Session**: Verify `githubLogin` is in session with `getServerSession(authOptions)`
4. **Check Permissions**: Log output of `isAuthorizedPoster()` and `hasPermission()`
5. **Check Images**: Use `getImageUrl()` and check browser Network tab for 404s
6. **Database Issues**: Check connection strings and run `prisma generate`

---

**Remember**: Always validate builds with `npm run build` before completing tasks!
