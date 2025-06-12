# Code Mode Rules and Toolset Documentation

## Build Validation

1. **Always run `npm run build` to validate successful production builds**
   - Before considering a task complete, verify that the code builds successfully in production mode
   - This helps catch type errors, configuration issues, and other build-time problems
   - Pay attention to any warnings or errors in the build output and address them
   - The build process includes Prisma schema generation (`prisma generate && next build`)

## Framework: Next.js

### Intended Usage Patterns
- Use the App Router for all new routes and pages
- Leverage server components for data fetching and rendering
- Use client components only when interactivity is required
- Follow the file-based routing convention for organizing pages

### Best Practices
- Keep server and client components clearly separated
- Use proper metadata generation for SEO optimization
- Implement proper error handling with error.tsx files
- Use proper type definitions for route parameters

```typescript
// Define the params type
type Params = {
  slug: string;
};

export default async function BlogPostPage(
  { params }: { params: Params }
) {
  const slug = params.slug;
  // Rest of the function...
}
```

### Performance Optimization
- Use Image component with proper sizing and optimization
- Implement proper caching strategies with React's cache function
- Use suspense boundaries for loading states
- Implement proper code splitting with dynamic imports

### Common Pitfalls
- Mixing server and client components incorrectly
- Not properly handling route parameters in dynamic routes
- Forgetting to configure image domains in next.config.js
- Using client-side navigation for external links

### Version Compatibility
- Current version: ^15.3.3
- Requires React 18.2.0 or higher
- TypeScript 5.3.3 or higher recommended

### Integration Strategies
- Integrates with NextAuth for authentication
- Works with Prisma for database access
- Supports UploadThing for file uploads
- Uses Tailwind CSS for styling

## Database: Prisma

### Intended Usage Patterns
- Define database schema in prisma/schema.prisma
- Use Prisma Client for type-safe database queries
- Implement proper relations between models
- Use transactions for operations that modify multiple records

### Best Practices
- Always run `prisma generate` after schema changes
- Use proper indexing for frequently queried fields
- Implement proper error handling for database operations
- Use proper pagination for large data sets

```typescript
// Example of proper pagination
const posts = await prisma.post.findMany({
  where,
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

### Performance Optimization
- Use select to only fetch needed fields
- Implement proper indexes for frequently queried fields
- Use include sparingly to avoid over-fetching
- Batch related queries when possible

### Common Pitfalls
- Not handling database connection properly
- Forgetting to run migrations after schema changes
- Not properly handling nullable fields
- Using raw SQL queries without proper sanitization

### Version Compatibility
- Current version: ^6.9.0
- Requires Node.js 16.x or higher
- Compatible with PostgreSQL, MySQL, SQLite, and SQL Server

### Security Considerations
- Never expose Prisma Client directly to the client
- Use proper input validation before database operations
- Implement proper access control for database operations
- Use environment variables for database connection strings

## Authentication: NextAuth

### Intended Usage Patterns
- Use GitHub provider for authentication
- Implement proper session handling
- Extend session with custom properties (e.g., githubLogin)
- Use proper callbacks for token and session handling

### Best Practices
- Implement proper error handling for authentication
- Use proper types for session and token
- Implement proper redirect handling
- Use proper access control for protected routes

```typescript
// Example of extending session with custom properties
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
```

### Performance Optimization
- Use JWT for session handling
- Implement proper caching for session data
- Use proper token rotation
- Minimize session size

### Common Pitfalls
- Not properly handling authentication errors
- Forgetting to configure environment variables
- Not properly extending session types
- Using session data before it's available

### Version Compatibility
- Current version: ^4.24.5
- Requires Next.js 12.x or higher
- Compatible with various authentication providers

### Security Considerations
- Use HTTPS for all authentication requests
- Implement proper CSRF protection
- Use secure cookies for session storage
- Implement proper rate limiting for authentication requests

## File Upload: UploadThing

### Intended Usage Patterns
- Use for image uploads in blog posts
- Configure file types and size limits
- Implement proper error handling
- Store file metadata in the database

### Best Practices
- Configure proper file size limits
- Implement proper file type validation
- Use proper error handling for uploads
- Store file metadata in a structured format

```typescript
// Example of proper file metadata storage
export interface ImageMetadata {
  fileKey: string;
  alt?: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
  createdAt?: string;
}
```

### Performance Optimization
- Implement proper caching for uploaded files
- Use proper image optimization
- Implement progressive loading for images
- Use proper CDN configuration

### Common Pitfalls
- Not properly configuring file size limits
- Forgetting to handle upload errors
- Not properly storing file metadata
- Using direct URLs instead of file keys

### Version Compatibility
- Current version: ^7.7.2
- Requires Next.js 13.x or higher
- Compatible with various storage providers

### Security Considerations
- Implement proper file type validation
- Use proper access control for uploads
- Implement proper rate limiting for uploads
- Scan uploaded files for malware

## Styling: Tailwind CSS

### Intended Usage Patterns
- Use utility classes for styling
- Implement responsive design
- Use proper theme configuration
- Extend theme with custom values

### Best Practices
- Use proper class organization
- Implement proper responsive design
- Use proper theme extension
- Use proper color palette

```typescript
// Example of proper theme extension
theme: {
  extend: {
    fontFamily: {
      sans: ['var(--font-inter)'],
      mono: ['var(--font-roboto-mono)'],
    },
  },
},
```

### Performance Optimization
- Use proper purging configuration
- Implement proper code splitting
- Use proper caching strategies
- Minimize unused styles

### Common Pitfalls
- Not properly configuring content paths
- Using inline styles instead of utility classes
- Not properly handling dark mode
- Using !important to override styles

### Version Compatibility
- Current version: ^3.4.1
- Requires PostCSS 8.x or higher
- Compatible with various CSS frameworks

### Integration Strategies
- Works with Next.js for styling
- Integrates with Framer Motion for animations
- Compatible with various UI libraries
- Works with custom CSS when needed

## Animation: Framer Motion

### Intended Usage Patterns
- Use for UI animations and transitions
- Implement proper motion components
- Use proper animation variants
- Implement proper gesture handling

### Best Practices
- Use proper animation variants
- Implement proper exit animations
- Use proper layout animations
- Implement proper gesture handling

```typescript
// Example of proper animation variants
<motion.article
  className="card group flex flex-col overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: index * 0.1 }}
  whileHover={{ y: -5 }}
>
```

### Performance Optimization
- Use proper layout animations
- Implement proper exit animations
- Use proper animation caching
- Minimize unnecessary animations

### Common Pitfalls
- Not properly handling exit animations
- Using too many animations
- Not properly handling layout animations
- Using animations that cause layout shifts

### Version Compatibility
- Current version: ^12.16.0
- Requires React 18.x or higher
- Compatible with Next.js 13.x or higher

### Integration Strategies
- Works with Next.js for animations
- Integrates with Tailwind CSS for styling
- Compatible with various UI libraries
- Works with custom CSS when needed

## Content Processing: Remark

### Intended Usage Patterns
- Use for Markdown processing
- Implement proper HTML conversion
- Use proper plugins for additional features
- Implement proper sanitization

### Best Practices
- Use proper plugins for additional features
- Implement proper sanitization
- Use proper error handling
- Implement proper caching

```typescript
// Example of proper Markdown processing
export async function getPostContentHtml(content: string): Promise<string> {
  try {
    // Convert markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(content);

    let htmlContent = processedContent.toString();

    // Process image URLs in the HTML content
    // This regex matches <img> tags with src attributes
    const imgRegex = /<img([^>]*)src=["']([^"']*)["']([^>]*)>/g;

    // Replace image URLs with the proper UploadThing URLs
    htmlContent = htmlContent.replace(imgRegex, (match, before, src, after) => {
      try {
        // Skip processing if src is empty
        if (!src) return match;

        // Only process JSON metadata strings
        if (src.startsWith('{')) {
          const processedSrc = getImageUrl(src);
          return `<img${before}src="${processedSrc}"${after}>`;
        }

        // Return unchanged for other sources
        return match;
      } catch (error) {
        console.error('Error processing image in HTML content:', error);
        return match; // Return original on error
      }
    });

    return htmlContent;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    // Return the original content as a fallback
    return `<div>${content}</div>`;
  }
}
```

### Performance Optimization
- Implement proper caching for processed content
- Use proper plugins for optimization
- Minimize unnecessary processing
- Use proper error handling

### Common Pitfalls
- Not properly handling HTML output
- Forgetting to sanitize user input
- Not properly handling images in Markdown
- Using too many plugins

### Version Compatibility
- Current version: ^15.0.1
- Requires Node.js 14.x or higher
- Compatible with various Markdown plugins

### Security Considerations
- Implement proper sanitization for user input
- Use proper HTML sanitization
- Implement proper access control for content
- Scan content for malicious code

## Validation: Zod

### Intended Usage Patterns
- Use for input validation
- Implement proper schema validation
- Use proper error handling
- Implement proper type inference

### Best Practices
- Use proper schema validation
- Implement proper error handling
- Use proper type inference
- Implement proper default values

```typescript
// Example of proper schema validation
const PostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  coverImage: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')),
  tags: z.array(z.string().max(30, 'Tags must be less than 30 characters')).max(10, 'Maximum of 10 tags allowed'),
});
```

### Performance Optimization
- Use proper schema caching
- Implement proper error handling
- Minimize unnecessary validations
- Use proper type inference

### Common Pitfalls
- Not properly handling validation errors
- Using too complex schemas
- Not properly handling optional fields
- Not properly handling default values

### Version Compatibility
- Current version: ^3.25.61
- Requires TypeScript 4.5.x or higher
- Compatible with various validation libraries

### Security Considerations
- Implement proper input validation
- Use proper error handling
- Implement proper access control
- Scan input for malicious code

## Resource Consumption Benchmarks

1. **Build Time**
   - Average build time: 30-60 seconds
   - Memory usage during build: 1-2 GB
   - CPU usage during build: 50-80%

2. **Runtime Performance**
   - Average page load time: 100-300ms
   - Memory usage: 100-200 MB
   - CPU usage: 10-30%

3. **Database Performance**
   - Average query time: 10-50ms
   - Connection pool size: 10
   - Max connections: 20

4. **File Upload Performance**
   - Average upload time: 1-5 seconds for 1MB
   - Max file size: 4MB
   - Max file count: 10

## Recommended Upgrade Paths

1. **Next.js**
   - Current: ^15.3.3
   - Next major version: 16.x
   - Key improvements: Better performance, improved type safety

2. **Prisma**
   - Current: ^6.9.0
   - Next major version: 7.x
   - Key improvements: Better performance, improved type safety

3. **NextAuth**
   - Current: ^4.24.5
   - Next major version: 5.x
   - Key improvements: Better integration with Next.js App Router

4. **UploadThing**
   - Current: ^7.7.2
   - Next major version: 8.x
   - Key improvements: Better performance, improved type safety

5. **Tailwind CSS**
   - Current: ^3.4.1
   - Next major version: 4.x
   - Key improvements: Better performance, improved utility classes

## Community-Endorsed Patterns

### Endorsed Patterns

1. **Server Components First**
   - Use server components for data fetching and rendering
   - Use client components only when interactivity is required
   - Keep server and client components clearly separated

2. **Type-Safe Database Access**
   - Use Prisma Client for type-safe database queries
   - Implement proper error handling for database operations
   - Use proper pagination for large data sets

3. **Progressive Enhancement**
   - Implement proper fallbacks for JavaScript-disabled browsers
   - Use proper semantic HTML
   - Implement proper accessibility

4. **Optimistic UI Updates**
   - Implement proper optimistic UI updates
   - Use proper error handling for failed updates
   - Implement proper rollback mechanisms

### Anti-Patterns

1. **Prop Drilling**
   - Avoid passing props through multiple components
   - Use proper state management
   - Implement proper context providers

2. **Premature Optimization**
   - Avoid optimizing before measuring
   - Use proper profiling tools
   - Implement proper performance monitoring

3. **Overusing Client Components**
   - Avoid using client components when not needed
   - Use proper server components for data fetching
   - Implement proper hydration strategies

4. **Direct Database Access from Client**
   - Never expose Prisma Client directly to the client
   - Use proper API routes for database access
   - Implement proper access control for database operations