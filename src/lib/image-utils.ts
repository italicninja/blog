import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing";

// Generate the React helpers for UploadThing
const { useUploadThing } = generateReactHelpers<OurFileRouter>();

/**
 * Regular expression to find markdown image references
 * Captures:
 * - Group 1: The alt text
 * - Group 2: The image URL/path
 */
const MARKDOWN_IMAGE_REGEX = /!\[(.*?)\]\((.*?)\)/g;

/**
 * Regular expression to identify local image paths
 * Matches paths that don't start with http://, https://, or data:
 */
const LOCAL_IMAGE_REGEX = /^(?!(https?:\/\/|data:))/i;

/**
 * Extracts all image references from markdown content
 * @param content The markdown content
 * @returns Array of objects containing alt text and image path
 */
export function extractImageReferences(content: string): Array<{ alt: string; path: string }> {
  const images: Array<{ alt: string; path: string }> = [];
  let match;

  while ((match = MARKDOWN_IMAGE_REGEX.exec(content)) !== null) {
    const [, alt, path] = match;
    images.push({ alt, path });
  }

  return images;
}

/**
 * Filters image references to only include local images
 * @param images Array of image references
 * @returns Array of local image references
 */
export function filterLocalImages(images: Array<{ alt: string; path: string }>): Array<{ alt: string; path: string }> {
  return images.filter(image => LOCAL_IMAGE_REGEX.test(image.path));
}

/**
 * Converts a local file path to a File object
 * @param path Local file path
 * @returns Promise resolving to a File object or null if fetch fails
 */
export async function pathToFile(path: string): Promise<File | null> {
  try {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Fetch the file
    const response = await fetch(cleanPath);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${path}`);
      return null;
    }
    
    // Get the blob and create a File object
    const blob = await response.blob();
    const filename = path.split('/').pop() || 'image.jpg';
    
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error(`Error converting path to file: ${path}`, error);
    return null;
  }
}

/**
 * Replaces local image references in markdown content with new URLs
 * @param content Original markdown content
 * @param replacements Map of original paths to new URLs
 * @returns Updated markdown content
 */
export function replaceImageUrls(content: string, replacements: Map<string, string>): string {
  let updatedContent = content;
  
  replacements.forEach((newUrl, originalPath) => {
    // Escape special characters in the original path for use in regex
    const escapedPath = originalPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(!\\[.*?\\]\\()${escapedPath}(\\))`, 'g');
    updatedContent = updatedContent.replace(regex, `$1${newUrl}$2`);
  });
  
  return updatedContent;
}

export { useUploadThing };