"use client";

import { useState, useRef, FormEvent, ChangeEvent, useCallback, useEffect } from 'react';
import { TagSelector } from '@/components/TagSelector';

// Add type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onstart: (event: Event) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}
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
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingSupported, setIsRecordingSupported] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
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
  const formRef = useRef<HTMLFormElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === 'not-allowed') {
          setRecordingError('Microphone permission denied. Please allow microphone access to use voice dictation.');
        } else {
          setRecordingError(`Error during voice dictation: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');

        setFormData(prev => ({
          ...prev,
          content: prev.content + (prev.content ? '\n' : '') + transcript
        }));
      };

      recognitionRef.current = recognition;
      setIsRecordingSupported(true);
    } else {
      setIsRecordingSupported(false);
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

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
      // Convert paths to File objects with error handling for each image
      const imageFilesPromises = localImageRefs.map(async (img) => {
        try {
          return await pathToFile(img.path);
        } catch (error) {
          console.error(`Error converting image path to file: ${img.path}`, error);
          return null;
        }
      });

      const imageFiles: (File | null)[] = await Promise.all(imageFilesPromises);

      // Filter out null values (failed conversions)
      const validImageFiles = imageFiles.filter((file): file is File => file !== null);

      if (validImageFiles.length === 0) {
        setImageProcessingStatus("No valid images to upload");
        return { processedContent: content };
      }

      setImageProcessingStatus(`Uploading ${validImageFiles.length} images...`);

      // Upload images to UploadThing with error handling
      let uploadResults;
      try {
        uploadResults = await startUpload(validImageFiles);

        if (!uploadResults || uploadResults.length === 0) {
          console.warn("Upload completed but no results returned");
          return { processedContent: content };
        }
      } catch (uploadError) {
        console.error("Error uploading images:", uploadError);
        setError(`Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        return { processedContent: content };
      }

      // Create a map of original paths to metadata JSON strings
      const replacements = new Map<string, string>();

      localImageRefs.forEach((img, index) => {
        if (index < uploadResults.length) {
          try {
            const url = uploadResults[index].url;

            // Create metadata for the image
            const metadata = imageUrlToMetadata(url, img.alt);
            if (metadata) {
              // Store the metadata JSON string directly in the content
              replacements.set(img.path, metadata);
            }
          } catch (error) {
            console.error(`Error processing uploaded image at index ${index}:`, error);
            // Skip this image if there's an error
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

      // Convert cover image URL to metadata for storage with error handling
      let coverImageMetadata = null;
      if (coverImage) {
        try {
          coverImageMetadata = imageUrlToMetadata(coverImage, "Cover image for post");
        } catch (error) {
          console.error("Error converting cover image to metadata:", error);
          // Fall back to using the original URL
        }
      }

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
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content (Markdown) *
            </label>
            {isRecordingSupported && (
              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    recognitionRef.current?.stop();
                  } else {
                    setRecordingError(null);
                    recognitionRef.current?.start();
                  }
                }}
                className={`flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:text-indigo-200'
                }`}
                disabled={!isRecordingSupported}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 mr-1 ${isRecording ? 'animate-pulse' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                {isRecording ? 'Stop Recording' : 'Start Dictation'}
              </button>
            )}
          </div>
          {recordingError && (
            <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400 text-sm">
              {recordingError}
            </div>
          )}
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
            required
          ></textarea>
          <div className="mt-1 space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can use Markdown syntax for formatting.
            </p>
            {!isRecordingSupported && (
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Voice dictation is not supported in your browser. Please use a modern browser like Chrome or Edge to access this feature.
                </p>
              </div>
            )}
            {isRecordingSupported && (
              <div className="p-2 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice Dictation Tips:</h4>
                <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                  <li>Click "Start Dictation" and speak clearly into your microphone</li>
                  <li>Say "new line" or "new paragraph" for line breaks</li>
                  <li>The text will appear as you speak, with a slight delay</li>
                  <li>Click "Stop Recording" when you're done</li>
                </ul>
              </div>
            )}
          </div>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-md">
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