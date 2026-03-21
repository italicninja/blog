"use client";

import { UploadDropzone } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

// Export the dropzone component with the correct router type
export const OurUploadDropzone = UploadDropzone<OurFileRouter, "imageUploader">;
