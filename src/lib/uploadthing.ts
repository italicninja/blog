import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import { isAuthorizedPoster } from "./authorized-posters";
import { getGithubLogin } from "./auth-utils";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique route key
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload

      // Get user from session and verify they're authenticated
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        throw new Error("Unauthorized: You must be signed in to upload images");
      }

      // Get the GitHub login from the session
      const githubLogin = getGithubLogin(session.user);

      // Verify user is authorized to post (and thus upload images)
      const authorized = await isAuthorizedPoster(githubLogin);

      if (!authorized) {
        throw new Error("Unauthorized: You do not have permission to upload images");
      }

      // Return metadata that is accessible in onUploadComplete
      return {
        uploadedAt: new Date().toISOString(),
        userId: githubLogin,
        userEmail: session.user.email || 'unknown'
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for user:", metadata.userId, "at:", metadata.uploadedAt);
      console.log("File URL:", file.url);

      // Return data that is accessible in the client
      return {
        uploadedAt: metadata.uploadedAt,
        fileUrl: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;