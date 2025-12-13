# AGENTS Guidelines for This Repository

This repository contains a Next.js 15 blog application built with TypeScript, Prisma (PostgreSQL), NextAuth, UploadThing, and Tailwind CSS. When working on the project interactively with an agent, please follow the guidelines below to ensure a smooth development experience.

## 1. Use the Development Server, **not** `npm run build` During Development

* **Always use `npm run dev`** while iterating on the application. This starts Next.js in development mode with hot-reload enabled.
* **Do _not_ run `npm run build` during agent sessions** unless specifically required for validation. Running the production build command switches the `.next` folder to production assets which disables hot reload and can leave the development server in an inconsistent state.
* **Exception**: Always run `npm run build` **before completing a task** to validate that the production build succeeds and catch type errors or configuration issues.

## 2. Database and Dependencies

### Prisma Schema Changes
If you modify `prisma/schema.prisma`:

1. Run `npx prisma generate` to update the Prisma client
2. Run `npx prisma db push` (development) or create a migration
3. Restart the development server to pick up changes

### Package Dependencies
If you add or update dependencies:

1. Run `npm install` to update `package-lock.json`
2. Restart the development server so Next.js picks up the changes

## 3. Coding Conventions

### Next.js 15 Specific
* **Server Components First**: Use server components by default; only add `"use client"` when interactivity is required
* **Await Params**: In Next.js 15, route params are Promises and MUST be awaited: `const { slug } = await params`
* **Use React's `cache()`**: Wrap data-fetching functions with `cache()` for optimal performance

### TypeScript
* Use TypeScript (`.tsx`/`.ts`) for all new components and utilities
* Extend types properly for NextAuth session (`githubLogin` custom field)
* Use type assertions for Prisma enums: `as unknown as Prisma.PostWhereInput`

### Component Organization
* Co-locate component-specific styles in the same folder when practical
* Mark client components with `"use client"` directive at the top
* Use Framer Motion only in client components for animations

### Authentication & Authorization
* Check `isAuthorizedPoster()` before allowing post creation
* Use `hasPermission()` for granular access control (edit, delete, publish)
* Remember: "italicninja" is the hardcoded owner with full permissions

### Images
* Always use `getImageUrl()` helper from `src/lib/uploadthing-utils.ts` to process image URLs
* Handle JSON metadata strings, direct URLs, and file keys
* Provide fallback images for missing/broken images

## 4. Project-Specific Important Files

| Path | Purpose |
| ---- | ------- |
| `CLAUDE.md` | Comprehensive project documentation and rules |
| `prisma/schema.prisma` | Database schema (PostgreSQL) |
| `src/lib/auth-options.ts` | NextAuth configuration |
| `src/lib/authorized-posters.ts` | Custom authorization logic |
| `src/lib/posts.ts` | Cached post data fetching functions |
| `src/lib/uploadthing-utils.ts` | Image URL processing helpers |
| `.env.local` | Environment variables (not in git) |

## 5. Useful Commands Recap

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Start Next.js dev server with HMR |
| `npm run build` | **Production build – run before task completion for validation** |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint checks |
| `npm run new-post` | Create a new blog post |
| `npm run add-poster` | Add authorized poster to database |
| `npm run grant-access` | Grant permanent access to user |
| `npm run backup-database` | Backup PostgreSQL database |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma studio` | Open Prisma Studio GUI for database |
| `npx prisma db push` | Push schema changes to development database |

## 6. Environment Variables Required

Ensure these are set in `.env.local` (see `.env.example`):

* `POSTGRES_PRISMA_URL` - PostgreSQL connection (pooled)
* `POSTGRES_URL_NON_POOLING` - PostgreSQL direct connection
* `GITHUB_ID` & `GITHUB_SECRET` - GitHub OAuth credentials
* `NEXTAUTH_SECRET` & `NEXTAUTH_URL` - NextAuth configuration
* `UPLOADTHING_SECRET` & `UPLOADTHING_APP_ID` - UploadThing credentials

## 7. Testing and Validation

* Always validate changes with `npm run build` before considering a task complete
* Check for TypeScript errors, build warnings, and configuration issues
* Test authentication flows in development (auto-authenticates as "developer")
* Verify database queries work with proper type assertions

---

Following these practices ensures efficient agent-assisted development on this Next.js blog project. When in doubt, consult `CLAUDE.md` for comprehensive project documentation, restart the dev server, and always run a production build before completing tasks.
