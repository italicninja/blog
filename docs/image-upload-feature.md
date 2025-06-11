# Automatic Image Upload Feature

This document describes the automatic image upload feature for blog post submissions.

## Overview

When a user submits a blog post, the system automatically:

1. Detects any local images referenced in the markdown content
2. Uploads these images to UploadThing
3. Updates the image references in the content with the proper UploadThing URLs
4. Sets the first uploaded image as the cover image if none was provided
5. Submits the post with the updated content

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

## Technical Implementation

The feature is implemented using the following components:

1. `image-utils.ts` - Utility functions for image detection, processing, and URL replacement
2. `BlogSubmissionForm.tsx` - Integration with the form submission process
3. `uploadthing.ts` - Configuration for the UploadThing file router

## Limitations

- The maximum number of images that can be uploaded in a single post is 10
- The maximum file size for each image is 4MB
- Only images referenced in markdown syntax are detected and processed

## Fallback Behavior

If no images are found in the content or if image processing fails:
- The system will maintain any manually uploaded cover image
- If no cover image was provided and no content images are available, the post will be created without a cover image
- The system will still create the post successfully, just without the automatic image handling