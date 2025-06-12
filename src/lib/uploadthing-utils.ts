/**
 * Utilities for handling UploadThing image metadata
 */

import { getCachedImageUrl, cacheImageUrl } from './image-cache';

// Base URL for UploadThing images
const UPLOADTHING_BASE_URL = 'https://uploadthing.com/f';

// Default fallback image path
const DEFAULT_FALLBACK_IMAGE = '/images/posts/nextjs.jpg';

/**
 * Regular expression to match UploadThing URLs
 * Captures the file key from the URL
 */
const UPLOADTHING_URL_REGEX = /https:\/\/uploadthing\.com\/f\/([^?#]+)/i;

/**
 * Interface for the image metadata stored in the database
 */
export interface ImageMetadata {
  fileKey: string;
  alt?: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
  createdAt?: string;
}

/**
 * Extract the file key from an UploadThing URL
 * @param url The UploadThing URL
 * @returns The file key or null if the URL is not a valid UploadThing URL
 */
export function extractFileKeyFromUrl(url: string): string | null {
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
 * @param url The image URL
 * @param alt Optional alt text for the image
 * @returns The metadata JSON string or null if the URL is not valid
 */
export function imageUrlToMetadata(url: string, alt?: string): string | null {
  if (!url) return null;
  
  const fileKey = extractFileKeyFromUrl(url);
  if (!fileKey) return null;
  
  const metadata: ImageMetadata = {
    fileKey,
    alt: alt || '',
    createdAt: new Date().toISOString()
  };
  
  return JSON.stringify(metadata);
}

/**
 * Get the full URL for an UploadThing file key
 * @param metadataStr The metadata JSON string
 * @returns The full URL or a fallback image URL if the key is invalid
 */
export function getImageUrl(metadataStr: string | null): string {
  if (!metadataStr) return DEFAULT_FALLBACK_IMAGE;
  
  // Check cache first
  const cachedUrl = getCachedImageUrl(metadataStr);
  if (cachedUrl) {
    return cachedUrl;
  }

  try {
    // Handle local file paths (which no longer exist)
    if (metadataStr.startsWith('/')) {
      console.warn('Local file path detected, using fallback image:', metadataStr);
      return DEFAULT_FALLBACK_IMAGE;
    }

    // Handle direct URLs
    if (metadataStr.startsWith('http')) {
      return metadataStr;
    }

    // Parse the metadata JSON
    const metadata = JSON.parse(metadataStr) as ImageMetadata;

    if (!metadata.fileKey) {
      console.warn('Invalid metadata, no fileKey found:', metadataStr);
      return DEFAULT_FALLBACK_IMAGE;
    }
    
    const url = `${UPLOADTHING_BASE_URL}/${metadata.fileKey}`;

    // Cache the URL for future use
    cacheImageUrl(metadataStr, url);

    return url;
  } catch (error) {
    console.error('Error parsing image metadata:', error, 'Input:', metadataStr);
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
    return JSON.parse(metadataStr) as ImageMetadata;
  } catch (error) {
    console.error('Error parsing image metadata:', error);
    return null;
  }
}

/**
 * Check if a string is valid image metadata
 * @param value The string to check
 * @returns True if the string is valid image metadata
 */
export function isValidImageData(value: string | null): boolean {
  if (!value) return false;
  
  // Check if it's a JSON metadata string
  try {
    const metadata = JSON.parse(value) as ImageMetadata;
    return !!metadata.fileKey;
  } catch {
    return false;
  }
}