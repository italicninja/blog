# Automatic Image Upload Feature

This document describes the automatic image upload feature for blog post submissions.

## Overview

When a user submits a blog post, the system automatically:

1. Detects any local images referenced in the markdown content
2. Uploads these images to UploadThing
3. Stores image metadata as JSON in the content
4. Sets the first uploaded image as the cover image if none was provided
5. Stores all images as metadata objects in the database
6. Submits the post with the updated content

## How It Works

### Image Detection

The system uses regular expressions to find all image references in the markdown content. For example:

```markdown
![Alt text](image.jpg)
```

### Local vs Remote Images

Only local images (those not starting with `http://`, `https://`, or `data:`) are processed. Remote images are left unchanged.

### Image Upload Process

1. Local images are fetched and converted to File objects
2. These files are uploaded to UploadThing using the `imageUploader` endpoint
3. A map of original paths to new URLs is created
4. The content is updated by replacing the original paths with the new URLs

### User Experience

The user doesn't need to manually upload images referenced in their content. The system handles this automatically in the background during submission.

The user will see a progress indicator during the image processing and upload.

### Automatic Cover Image Selection

If the user doesn't explicitly upload a cover image:
1. The system will automatically use the first image found in the content as the cover image
2. The selected image will be displayed in the cover image preview area
3. The user can still remove this automatic selection if desired

This ensures that every post has an attractive visual element without requiring extra work from the author.

### Image Metadata Storage

All images are stored as JSON metadata objects:
1. The system extracts the file key from UploadThing URLs
2. Creates a JSON object with the file key and additional metadata
3. Stores this JSON string directly in the content and database
4. When displaying images, the system reconstructs the URL from the stored metadata
5. This approach provides more flexibility and control over image handling

## Technical Implementation

The feature is implemented using the following components:

1. `image-utils.ts` - Utility functions for image detection, processing, and URL replacement
2. `uploadthing-utils.ts` - Utilities for handling UploadThing image URLs and file keys
3. `image-cache.ts` - In-memory caching system for optimizing image URL retrieval
4. `BlogSubmissionForm.tsx` - Integration with the form submission process
5. `uploadthing.ts` - Configuration for the UploadThing file router

## Limitations

- The maximum number of images that can be uploaded in a single post is 10
- The maximum file size for each image is 4MB
- Only images referenced in markdown syntax are detected and processed

## Metadata Format

The image metadata is stored as a JSON string with the following structure:

```json
{
  "fileKey": "unique-uploadthing-file-key",
  "alt": "Optional alt text for the image",
  "createdAt": "2025-06-11T19:45:00.000Z"
}
```

Additional fields may include:
- `width`: Image width in pixels
- `height`: Image height in pixels
- `blurDataURL`: Base64 encoded blur placeholder

## Error Handling

The implementation includes focused error handling:
1. **Image Processing Errors**: Each image is processed independently, so a failure with one image won't affect others
2. **JSON Parsing Errors**: The system validates JSON metadata before using it
3. **Missing Images**: The UI displays a placeholder when images can't be loaded
4. **Upload Failures**: Detailed error messages are provided when uploads fail
5. **Content Rendering**: Error handling prevents rendering failures

## Caching Strategy

To optimize performance:
1. Image URLs constructed from metadata are cached in memory
2. Cache entries expire after 1 hour to ensure fresh data
3. The cache is used for both cover images and content images
4. This reduces database load and improves page load times

## Database Migration

When migrating existing posts:
1. All image URLs should be converted to metadata format
2. This includes both cover images and images in the content
3. The migration should extract file keys from existing URLs
4. JSON metadata objects should be created for each image
5. The content should be updated to use the new metadata format