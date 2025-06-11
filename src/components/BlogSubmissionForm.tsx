"use client";

import { useState, useRef, FormEvent, ChangeEvent, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { OurUploadDropzone } from '@/components/UploadThingProvider';
import {
  extractImageReferences,
  filterLocalImages,
  pathToFile,
  replaceImageUrls,
  useUploadThing
} from '@/lib/image-utils';
import { imageUrlToMetadata } from '@/lib/uploadthing-utils';

interface FormData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
}

export default function BlogSubmissionForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [imageProcessingStatus, setImageProcessingStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle tag input
  const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  // Add a tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Sanitize content
  const sanitizeContent = (content: string): string => {
    // Basic sanitization - remove any potentially harmful HTML
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  };

  // Validate form data
  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Title is required';
    }
    if (formData.title.length > 100) {
      return 'Title must be less than 100 characters';
    }
    if (!formData.content.trim()) {
      return 'Content is required';
    }
    if (formData.excerpt && formData.excerpt.length > 300) {
      return 'Excerpt must be less than 300 characters';
    }
    if (formData.tags.length > 10) {
      return 'Maximum of 10 tags allowed';
    }
    if (formData.tags.some(tag => tag.length > 30)) {
      return 'Tags must be less than 30 characters each';
    }
    return null;
  };

  // Setup UploadThing for content images
  const { startUpload } = useUploadThing("imageUploader");

  // Process content images
  const processContentImages = useCallback(async (content: string): Promise<{ processedContent: string; firstImageUrl?: string }> => {
    // Extract image references from content
    const imageRefs = extractImageReferences(content);

    // Filter to only include local images
    const localImageRefs = filterLocalImages(imageRefs);

    // If no local images, return the original content
    if (localImageRefs.length === 0) {
      return { processedContent: content };
    }

    setProcessingImages(true);
    setImageProcessingStatus(`Processing ${localImageRefs.length} images...`);

    try {
      // Convert paths to File objects
      const imageFiles: (File | null)[] = await Promise.all(
        localImageRefs.map(img => pathToFile(img.path))
      );

      // Filter out null values (failed conversions)
      const validImageFiles = imageFiles.filter((file): file is File => file !== null);

      if (validImageFiles.length === 0) {
        setImageProcessingStatus("No valid images to upload");
        return { processedContent: content };
      }

      setImageProcessingStatus(`Uploading ${validImageFiles.length} images...`);

      // Upload images to UploadThing
      const uploadResults = await startUpload(validImageFiles);

      if (!uploadResults || uploadResults.length === 0) {
        throw new Error("Failed to upload images");
      }

      // Create a map of original paths to new URLs
      const replacements = new Map<string, string>();
      const imageMetadataMap = new Map<string, string>();

      localImageRefs.forEach((img, index) => {
        if (index < uploadResults.length) {
          const url = uploadResults[index].url;
          replacements.set(img.path, url);

          // Also store metadata for each image
          const metadata = imageUrlToMetadata(url, img.alt);
          if (metadata) {
            imageMetadataMap.set(url, metadata);
          }
        }
      });

      // Replace image URLs in content
      const updatedContent = replaceImageUrls(content, replacements);

      // Get the first uploaded image URL for potential use as cover image
      const firstImageUrl = uploadResults.length > 0 ? uploadResults[0].url : undefined;

      setImageProcessingStatus("Image processing complete");
      return {
        processedContent: updatedContent,
        firstImageUrl
      };
    } catch (error) {
      console.error("Error processing content images:", error);
      setError(`Error processing images: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { processedContent: content };
    } finally {
      setProcessingImages(false);
    }
  }, [startUpload]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form data
      const validationError = validateForm();
      if (validationError) {
        throw new Error(validationError);
      }

      // Check if an upload is in progress
      if (isUploading) {
        throw new Error('Please wait for the image upload to complete');
      }

      // Sanitize content
      const sanitizedContent = sanitizeContent(formData.content);
      const sanitizedExcerpt = formData.excerpt ? sanitizeContent(formData.excerpt) : '';

      // Process content images - upload local images and update references
      const { processedContent, firstImageUrl } = await processContentImages(sanitizedContent);

      // If no cover image is provided, use the first image from the content
      let coverImage = formData.coverImage;
      if (!coverImage && firstImageUrl) {
        coverImage = firstImageUrl;
        // Update the UI to show the automatically selected cover image
        setFormData(prev => ({ ...prev, coverImage: firstImageUrl }));
      }

      // Convert cover image URL to metadata for storage
      const coverImageMetadata = coverImage ? imageUrlToMetadata(coverImage, "Cover image for post") : null;

      // Prepare data for submission
      const submissionData = {
        ...formData,
        content: processedContent,
        excerpt: sanitizedExcerpt,
        coverImage: coverImageMetadata || coverImage, // Use metadata if available, fallback to URL
      };

      // Submit the form data
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit blog post');
      }

      // Reset the form
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        coverImage: '',
        tags: [],
      });
      setSuccess(true);
      
      // Redirect to the new post after a delay
      setTimeout(() => {
        router.push(`/blog/${data.slug}`);
        // Refresh the page to update the cache
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If the user is not authenticated, show a message
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If the user is not authenticated, show a message
  if (status !== 'authenticated') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Authentication Required</h3>
        <p className="text-yellow-700">
          You need to be signed in with GitHub to submit a blog post.
        </p>
        <button
          onClick={() => router.push('/auth/signin')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">Submit a New Blog Post</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-600 dark:text-green-400">
          Blog post submitted successfully! Redirecting to your post...
        </div>
      )}
      
      {processingImages && imageProcessingStatus && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-blue-600 dark:text-blue-400">
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {imageProcessingStatus}
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        
        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Excerpt (Brief summary)
          </label>
          <input
            type="text"
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cover Image <span className="text-xs text-gray-500">(Optional - first image in content will be used if not provided)</span>
          </label>

          {formData.coverImage ? (
            <div className="relative mb-4">
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image
                  src={formData.coverImage}
                  alt="Cover image preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <OurUploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={(res: Array<{ url: string; fileKey?: string }>) => {
                  if (res && res.length > 0) {
                    // Store the metadata instead of just the URL
                    const imageMetadata = imageUrlToMetadata(res[0].url, "Cover image for post");
                    setFormData(prev => ({ ...prev, coverImage: res[0].url })); // Keep URL for UI display
                    // The actual metadata will be sent to the server during submission
                  }
                  setIsUploading(false);
                  setUploadProgress(null);
                }}
                onUploadError={(error: Error) => {
                  setError(`Upload failed: ${error.message}`);
                  setIsUploading(false);
                  setUploadProgress(null);
                }}
                onUploadBegin={() => {
                  setIsUploading(true);
                  setError(null);
                }}
                onUploadProgress={(progress: number) => {
                  setUploadProgress(progress);
                }}
                className="ut-button:bg-indigo-600 ut-button:hover:bg-indigo-700 ut-label:text-gray-700 dark:ut-label:text-gray-300 ut-upload-icon:text-indigo-500"
              />
              {isUploading && uploadProgress !== null && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                </div>
              )}
            </div>
          )}

          {formData.coverImage && (
            <input
              type="hidden"
              id="coverImage"
              name="coverImage"
              value={formData.coverImage}
            />
          )}
        </div>
        
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              onChange={handleTagInputChange}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Add a tag"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Add
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-100"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content (Markdown) *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
            required
          ></textarea>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You can use Markdown syntax for formatting.
          </p>
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-md">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Automatic Image Handling</h4>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Local images referenced in your content (e.g., <code className="bg-blue-100 dark:bg-blue-800/30 px-1 py-0.5 rounded">![Alt text](image.jpg)</code>) will be automatically uploaded to our secure image hosting service.
              The image references in your post will be updated with the new URLs.
            </p>
          </div>
        </div>
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || isUploading || processingImages}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : isUploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading Cover Image...
              </span>
            ) : processingImages ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Content Images...
              </span>
            ) : (
              'Submit Blog Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}