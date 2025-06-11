/**
 * Utilities for handling UploadThing image URLs and file keys
 */

import { getCachedImageUrl, cacheImageUrl } from './image-cache';

// Base URL for UploadThing images
const UPLOADTHING_BASE_URL = 'https://uploadthing.com/f';

// Default fallback image path
const DEFAULT_FALLBACK_IMAGE = '/images/fallback-image.jpg';

/**
 * Interface for the image metadata stored in the database
 */
export interface ImageMetadata {
  fileKey: string;
  alt?: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
}

/**
 * Extract the file key from an UploadThing URL
 * @param url The UploadThing URL
 * @returns The file key or null if the URL is not a valid UploadThing URL
 */
export function extractFileKeyFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // Check if it's already a file key (no URL structure)
    if (!url.includes('/')) {
      return url;
    }
    
    // Parse the URL
    const urlObj = new URL(url);
    
    // Check if it's an UploadThing URL
    if (urlObj.hostname === 'uploadthing.com' && urlObj.pathname.startsWith('/f/')) {
      // Extract the file key from the pathname
      return urlObj.pathname.substring(3); // Remove '/f/' prefix
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting file key from URL:', error);
    return null;
  }
}

/**
 * Convert an image URL to a metadata object for storage
 * @param url The image URL
 * @param alt Optional alt text for the image
 * @returns The metadata object or null if the URL is not valid
 */
export function imageUrlToMetadata(url: string, alt?: string): string | null {
  if (!url) return null;
  
  const fileKey = extractFileKeyFromUrl(url);
  if (!fileKey) return null;
  
  const metadata: ImageMetadata = {
    fileKey,
    alt: alt || '',
  };
  
  return JSON.stringify(metadata);
}

/**
 * Get the full URL for an UploadThing file key
 * @param fileKey The file key or metadata string
 * @returns The full URL or a fallback image URL if the key is invalid
 */
export function getImageUrl(fileKey: string | null): string {
  if (!fileKey) return DEFAULT_FALLBACK_IMAGE;
  
  // Check cache first
  const cachedUrl = getCachedImageUrl(fileKey);
  if (cachedUrl) {
    return cachedUrl;
  }

  try {
    let url: string;

    // Check if it's a JSON metadata string
    if (fileKey.startsWith('{')) {
      const metadata = JSON.parse(fileKey) as ImageMetadata;
      url = `${UPLOADTHING_BASE_URL}/${metadata.fileKey}`;
    }
    // Check if it's already a full URL
    else if (fileKey.startsWith('http')) {
      url = fileKey;
    }
    // Assume it's just a file key
    else {
      url = `${UPLOADTHING_BASE_URL}/${fileKey}`;
    }
    
    // Cache the URL for future use
    cacheImageUrl(fileKey, url);

    return url;
  } catch (error) {
    console.error('Error parsing image metadata:', error);
    return DEFAULT_FALLBACK_IMAGE;
  }
}

/**
 * Parse image metadata from a string
 * @param metadataStr The metadata string from the database
 * @returns The parsed metadata or null if invalid
 */
export function parseImageMetadata(metadataStr: string | null): ImageMetadata | null {
  if (!metadataStr) return null;
  
  try {
    // If it's a JSON string, parse it
    if (metadataStr.startsWith('{')) {
      return JSON.parse(metadataStr) as ImageMetadata;
    }
    
    // If it's a URL or file key, convert it to metadata
    const fileKey = extractFileKeyFromUrl(metadataStr) || metadataStr;
    return { fileKey };
  } catch (error) {
    console.error('Error parsing image metadata:', error);
    return null;
  }
}

/**
 * Check if a string is a valid image metadata or URL
 * @param value The string to check
 * @returns True if the string is valid image metadata or URL
 */
export function isValidImageData(value: string | null): boolean {
  if (!value) return false;
  
  // Check if it's a URL
  if (value.startsWith('http')) {
    return true;
  }
  
  // Check if it's a JSON metadata string
  if (value.startsWith('{')) {
    try {
      const metadata = JSON.parse(value) as ImageMetadata;
      return !!metadata.fileKey;
    } catch {
      return false;
    }
  }
  
  // Assume it's a file key
  return value.length > 0;
}