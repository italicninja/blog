/**
 * Migration script to convert existing image URLs to metadata format
 * 
 * This script:
 * 1. Fetches all posts from the database
 * 2. Converts image URLs to metadata format
 * 3. Updates the posts in the database
 * 
 * Usage: node scripts/migrate-images-to-metadata.js
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_PRISMA_URL,
});

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({ adapter });

// Base URL for UploadThing images
const UPLOADTHING_BASE_URL = 'https://uploadthing.com/f';

// Regular expression to match UploadThing URLs
const UPLOADTHING_URL_REGEX = /https:\/\/uploadthing\.com\/f\/([^?#]+)/i;

/**
 * Extract the file key from an UploadThing URL
 * @param {string} url The UploadThing URL
 * @returns {string|null} The file key or null if the URL is not a valid UploadThing URL
 */
function extractFileKeyFromUrl(url) {
  if (!url) return null;
  
  try {
    const match = url.match(UPLOADTHING_URL_REGEX);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting file key from URL:', error);
    return null;
  }
}

/**
 * Convert an image URL to a metadata object for storage
 * @param {string} url The image URL
 * @param {string} alt Optional alt text for the image
 * @returns {string|null} The metadata JSON string or null if the URL is not valid
 */
function imageUrlToMetadata(url, alt = '') {
  if (!url) return null;
  
  const fileKey = extractFileKeyFromUrl(url);
  if (!fileKey) return null;
  
  const metadata = {
    fileKey,
    alt,
    createdAt: new Date().toISOString()
  };
  
  return JSON.stringify(metadata);
}

/**
 * Process content to convert image URLs to metadata
 * @param {string} content The post content
 * @returns {string} The updated content
 */
function processContent(content) {
  if (!content) return content;
  
  // This regex matches markdown image syntax
  const markdownImageRegex = /!\[(.*?)\]\((https:\/\/uploadthing\.com\/f\/[^)]+)\)/g;
  
  // Replace markdown image URLs with metadata
  return content.replace(markdownImageRegex, (match, alt, url) => {
    const metadata = imageUrlToMetadata(url, alt);
    if (metadata) {
      return `![${alt}](${metadata})`;
    }
    return match; // Keep original if conversion fails
  });
}

/**
 * Migrate all posts to use metadata format for images
 */
async function migrateImages() {
  console.log('Starting image migration...');
  
  try {
    // Get all posts
    const posts = await prisma.post.findMany();
    console.log(`Found ${posts.length} posts to process`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Process each post
    for (const post of posts) {
      let needsUpdate = false;
      let updatedPost = { ...post };
      
      // Process cover image
      if (post.coverImage && post.coverImage.includes(UPLOADTHING_BASE_URL)) {
        const metadata = imageUrlToMetadata(post.coverImage, "Cover image");
        if (metadata) {
          updatedPost.coverImage = metadata;
          needsUpdate = true;
        }
      }
      
      // Process content images
      if (post.content && post.content.includes(UPLOADTHING_BASE_URL)) {
        const updatedContent = processContent(post.content);
        if (updatedContent !== post.content) {
          updatedPost.content = updatedContent;
          needsUpdate = true;
        }
      }
      
      // Update the post if needed
      if (needsUpdate) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            coverImage: updatedPost.coverImage,
            content: updatedPost.content,
            updatedAt: new Date()
          }
        });
        updatedCount++;
        console.log(`Updated post: ${post.title} (${post.id})`);
      } else {
        skippedCount++;
      }
    }
    
    console.log(`Migration complete. Updated ${updatedCount} posts, skipped ${skippedCount} posts.`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Run the migration
migrateImages()
  .then(() => console.log('Migration script completed'))
  .catch(error => console.error('Migration script failed:', error));