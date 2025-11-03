"use client";

import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { TagSelector } from '@/components/TagSelector';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { OurUploadDropzone } from '@/components/UploadThingProvider';
import { imageUrlToMetadata } from '@/lib/uploadthing-utils';

interface FormData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
}

export default function BlogSubmissionForm() {
  const { status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: [],
  });
  const formRef = useRef<HTMLFormElement>(null);

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      // Convert cover image URL to metadata for storage with error handling
      let coverImageMetadata = null;
      if (formData.coverImage) {
        try {
          coverImageMetadata = imageUrlToMetadata(formData.coverImage, "Cover image for post");
        } catch (error) {
          console.error("Error converting cover image to metadata:", error);
          // Fall back to using the original URL
        }
      }

      // Prepare data for submission
      const submissionData = {
        ...formData,
        content: sanitizedContent,
        excerpt: sanitizedExcerpt,
        coverImage: coverImageMetadata || formData.coverImage, // Use metadata if available, fallback to URL
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
            Cover Image <span className="text-xs text-gray-500">(Optional)</span>
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <TagSelector
            selectedTags={formData.tags}
            onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
          />
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
        </div>
        
        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
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
            ) : (
              'Submit Blog Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}