import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/posts');

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  coverImage: string;
  tags: string[];
}

export function getAllPostSlugs() {
  // Get all timestamp directories
  const timestampDirs = fs.readdirSync(postsDirectory);
  
  // Get all post files from each timestamp directory
  const slugs = timestampDirs.flatMap(timestamp => {
    const timestampPath = path.join(postsDirectory, timestamp);
    
    // Skip if not a directory
    if (!fs.statSync(timestampPath).isDirectory()) {
      return [];
    }
    
    // Get all markdown files in the timestamp directory
    return fs.readdirSync(timestampPath)
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        params: {
          slug: file.replace(/\.md$/, ''),
          timestamp
        }
      }));
  });
  
  return slugs;
}

export function getPostBySlug(slug: string): Post | undefined {
  // Find the post in all timestamp directories
  const timestampDirs = fs.readdirSync(postsDirectory);
  
  for (const timestamp of timestampDirs) {
    const timestampPath = path.join(postsDirectory, timestamp);
    
    // Skip if not a directory
    if (!fs.statSync(timestampPath).isDirectory()) {
      continue;
    }
    
    const fullPath = path.join(timestampPath, `${slug}.md`);
    
    // Skip if file doesn't exist
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    
    // Read markdown file
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    // Parse markdown with gray-matter
    const { data, content } = matter(fileContents);
    
    // Ensure tags are in the correct format
    const tags = typeof data.tags === 'string' 
      ? data.tags.split(',') 
      : Array.isArray(data.tags) ? data.tags : [];
    
    return {
      slug,
      title: data.title || '',
      excerpt: data.excerpt || '',
      content,
      date: timestamp, // Use the timestamp directory name as the date
      coverImage: data.coverImage || '',
      tags
    };
  }
  
  return undefined;
}

export async function getPostContentHtml(content: string): Promise<string> {
  // Convert markdown to HTML
  const processedContent = await remark()
    .use(html)
    .process(content);
    
  return processedContent.toString();
}

export function getAllPosts(): Post[] {
  // Get all timestamp directories
  const timestampDirs = fs.readdirSync(postsDirectory);
  
  // Get all posts from each timestamp directory
  const posts = timestampDirs.flatMap(timestamp => {
    const timestampPath = path.join(postsDirectory, timestamp);
    
    // Skip if not a directory
    if (!fs.statSync(timestampPath).isDirectory()) {
      return [];
    }
    
    // Get all markdown files in the timestamp directory
    return fs.readdirSync(timestampPath)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const slug = file.replace(/\.md$/, '');
        const fullPath = path.join(timestampPath, file);
        
        // Read markdown file
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        // Parse markdown with gray-matter
        const { data, content } = matter(fileContents);
        
        // Ensure tags are in the correct format
        const tags = typeof data.tags === 'string' 
          ? data.tags.split(',') 
          : Array.isArray(data.tags) ? data.tags : [];
        
        return {
          slug,
          title: data.title || '',
          excerpt: data.excerpt || '',
          content,
          date: timestamp, // Use the timestamp directory name as the date
          coverImage: data.coverImage || '',
          tags
        };
      });
  });
  
  // Sort posts by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getRecentPosts(count: number = 3): Post[] {
  return getAllPosts().slice(0, count);
}

export function getPostsByTag(tag: string): Post[] {
  return getAllPosts().filter(post => post.tags.includes(tag));
}