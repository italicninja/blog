"use client";

import { UploadButton, UploadDropzone, Uploader } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

// Export the components with the correct type
export const OurUploadButton = UploadButton<OurFileRouter, "imageUploader">;
export const OurUploadDropzone = UploadDropzone<OurFileRouter, "imageUploader">;
export const OurUploader = Uploader<OurFileRouter, "imageUploader">;