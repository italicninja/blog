# Italicninja and adventures in Tech & Automation

A casual blog about DevOps, automation, and teaching robots to do my job, built with Next.js and Tailwind CSS for deployment on Vercel.

## Features

- Filesystem-based blog posts organized by date
- Responsive design with Tailwind CSS
- Server-side rendering with Next.js
- Markdown content with frontmatter
- Dark mode support
- SEO optimized
- Post creation script for easy content management
- Ready for Vercel deployment

## Authentication

This blog uses GitHub OAuth for authentication and has a custom authorization system for controlling who can submit blog posts.

### Authentication Setup

Run the authentication setup script to configure all environments:

```bash
node scripts/setup-auth-env.js
```

This script will:
- Set up environment variables for development, preview, and production
- Provide instructions for GitHub OAuth configuration
- Ensure consistent authentication across all environments

### Authorization for Blog Posts

By default, only users in the `AuthorizedPoster` database table can submit blog posts. The username "italicninja" is always authorized.

To add a new authorized poster:

```bash
node scripts/add-authorized-poster.js <github-username>
```

For more details on authentication and troubleshooting, see [Authentication Troubleshooting](./docs/auth-troubleshooting.md).

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/blog.git
cd blog
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

- `src/app/`: App Router pages and layouts
- `src/components/`: Reusable React components
- `src/data/`: Blog post data
- `src/utils/`: Utility functions
- `public/`: Static assets

## Adding Blog Posts

The blog posts are stored as markdown files in the `src/posts/` directory, organized in timestamp-based folders (YYYY-MM-DD format).

### Using the Post Creation Script

You can easily create a new blog post using the provided script:

```bash
npm run new-post
```

This will prompt you for:
- Post title
- Post excerpt
- Cover image path
- Tags (comma-separated)

The script will automatically:
- Create a folder with today's date if it doesn't exist
- Generate a slug from the title
- Create a markdown file with the appropriate frontmatter

### Manual Creation

Alternatively, you can manually create a post:

1. Create a new folder in `src/posts/` with a date format (YYYY-MM-DD)
2. Create a markdown file with the following frontmatter:

```markdown
---
title: Your Post Title
excerpt: A brief description of your post
coverImage: /path/to/image.svg
tags: Tag1,Tag2,Tag3
---

# Your Post Content

Write your post content here using Markdown.
```

## Deploying to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fblog-blog)

### Option 2: Manual Deployment

1. Push your code to a GitHub repository.

2. Sign up or log in to [Vercel](https://vercel.com).

3. Click "New Project" and import your GitHub repository.

4. Vercel will automatically detect that it's a Next.js project and configure the build settings.

5. Click "Deploy" and your blog will be live in minutes!

## Customization

### Changing the Theme

Edit the colors in `src/app/globals.css` to customize the theme.

### Updating Metadata

Update the site metadata in `src/app/layout.tsx` to change the site title and description.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
