#!/usr/bin/env node

/**
 * This script migrates all existing blog posts from the filesystem to the database.
 * It preserves original publication dates and handles various edge cases.
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const slugify = require('slugify');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
});

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({ adapter });
const postsDirectory = path.join(process.cwd(), 'src/posts');

// Default author information (can be customized)
const DEFAULT_AUTHOR = {
  name: 'italicninja',
  githubLogin: 'italicninja',
};

/**
 * Generate a unique slug based on the title
 */
async function generateUniqueSlug(title) {
  // Create a base slug from the title
  let slug = slugify(title, { lower: true, strict: true });
  
  // Check if the slug already exists
  const existingPost = await prisma.post.findUnique({
    where: { slug },
  });
  
  // If the slug exists, append a random string
  if (existingPost) {
    const randomString = Math.random().toString(36).substring(2, 8);
    slug = `${slug}-${randomString}`;
  }
  
  return slug;
}

/**
 * Parse a date string from a directory name
 * Handles various formats and edge cases
 */
function parseDate(dateStr) {
  // Try to parse the date string
  const date = new Date(dateStr);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date: ${dateStr}, using current date as fallback`);
    return new Date();
  }
  
  return date;
}

/**
 * Process a single post file and add it to the database
 */
async function processPost(filePath, timestamp) {
  try {
    // Read the file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse the frontmatter
    const { data, content } = matter(fileContents);
    
    // Extract the slug from the filename
    const fileName = path.basename(filePath);
    const fileSlug = fileName.replace(/\.md$/, '');
    
    // Use the title from frontmatter or generate one from the filename
    const title = data.title || fileSlug.replace(/-/g, ' ');
    
    // Generate a slug (either from frontmatter or from the filename)
    const slug = data.slug || await generateUniqueSlug(title);
    
    // Parse the date from the timestamp directory
    const publishedAt = parseDate(timestamp);
    
    // Process tags
    const tags = typeof data.tags === 'string'
      ? data.tags.split(',').map(tag => tag.trim())
      : Array.isArray(data.tags) ? data.tags : [];
    
    // Find or create the default author
    let author = await prisma.user.findFirst({
      where: {
        OR: [
          { githubLogin: DEFAULT_AUTHOR.githubLogin },
          { name: DEFAULT_AUTHOR.name }
        ]
      }
    });
    
    if (!author) {
      author = await prisma.user.create({
        data: {
          name: DEFAULT_AUTHOR.name,
          githubLogin: DEFAULT_AUTHOR.githubLogin,
        }
      });
      console.log(`Created default author: ${DEFAULT_AUTHOR.name}`);
    }
    
    // Process tags - find or create them
    const tagObjects = [];
    for (const tagName of tags) {
      const trimmedName = tagName.trim();
      if (!trimmedName) continue;
      
      const tag = await prisma.tag.upsert({
        where: { name: trimmedName },
        update: {},
        create: { name: trimmedName }
      });
      
      tagObjects.push(tag);
    }
    
    // Check if the post already exists
    const existingPost = await prisma.post.findFirst({
      where: {
        OR: [
          { slug },
          { title }
        ]
      }
    });
    
    if (existingPost) {
      console.log(`Post already exists: ${title} (${slug}), skipping...`);
      return;
    }
    
    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || null,
        published: true,
        createdAt: publishedAt,
        updatedAt: publishedAt,
        publishedAt,
        author: {
          connect: { id: author.id }
        },
        tags: {
          connect: tagObjects.map(tag => ({ id: tag.id }))
        }
      }
    });
    
    console.log(`Migrated post: ${title} (${slug}) published on ${publishedAt.toISOString()}`);
    return post;
  } catch (error) {
    console.error(`Error processing post ${filePath}:`, error);
    return null;
  }
}

/**
 * Main migration function
 */
async function migratePostsToDatabase() {
  console.log('Starting migration of posts to database...');
  
  try {
    // Get all timestamp directories
    const timestampDirs = fs.readdirSync(postsDirectory);
    
    let totalPosts = 0;
    let successfulMigrations = 0;
    
    // Process each timestamp directory
    for (const timestamp of timestampDirs) {
      const timestampPath = path.join(postsDirectory, timestamp);
      
      // Skip if not a directory
      if (!fs.statSync(timestampPath).isDirectory()) {
        continue;
      }
      
      // Get all markdown files in the timestamp directory
      const files = fs.readdirSync(timestampPath)
        .filter(file => file.endsWith('.md'));
      
      totalPosts += files.length;
      
      // Process each file
      for (const file of files) {
        const filePath = path.join(timestampPath, file);
        const result = await processPost(filePath, timestamp);
        
        if (result) {
          successfulMigrations++;
        }
      }
    }
    
    console.log(`Migration complete! Processed ${totalPosts} posts, successfully migrated ${successfulMigrations} posts.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run the migration
migratePostsToDatabase()
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });