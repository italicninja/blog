import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPostBySlug, getRecentPosts, getAllPostSlugs, getPostsByTag } from "@/lib/posts";
import { formatDate } from "@/utils/date";
import type { Metadata, ResolvingMetadata } from "next";
import PostContent from "./post-content";
import { Suspense } from "react";
import { getImageUrl, isValidImageData } from "@/lib/uploadthing-utils";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { getGithubLogin, isOwner } from '@/lib/auth-utils';
import { hasPermission } from '@/lib/authorized-posters';
import prisma from '@/lib/prisma';

// Default fallback image path
const DEFAULT_FALLBACK_IMAGE = '/images/posts/nextjs.jpg';

// Fallback image component for error cases
function FallbackImage({ title }: { title: string }) {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 w-full h-full flex items-center justify-center">
      <span className="text-gray-500 dark:text-gray-400 text-lg">{title}</span>
    </div>
  );
}

// Safe image component with error handling
function SafeImage({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) {
  if (!src) {
    return <FallbackImage title={alt} />;
  }

  try {
    // Process different types of image sources
    let processedSrc;

    if (src.startsWith('{')) {
      try {
        // JSON metadata
        processedSrc = getImageUrl(src);
      } catch (metadataError) {
        console.error("Error processing image metadata:", metadataError, "Source:", src);
        processedSrc = DEFAULT_FALLBACK_IMAGE;
      }
    } else if (src.startsWith('/')) {
      // Local file path (which no longer exists)
      console.warn('Local file path detected, using fallback image:', src);
      processedSrc = DEFAULT_FALLBACK_IMAGE;
    } else if (src.includes('uploadthing.com') || src.includes('utfs.io')) {
      // Direct UploadThing URL - use as is
      processedSrc = src;
    } else {
      // Other URLs - use as is
      processedSrc = src;
    }

    return <Image src={processedSrc} alt={alt} {...props} />;
  } catch (error) {
    console.error("Error rendering image:", error, "Source:", src);
    return <FallbackImage title={alt} />;
  }
}

// Define the params type
type Params = {
  slug: string;
};

type SearchParams = { [key: string]: string | string[] | undefined };

export async function generateStaticParams() {
  return getAllPostSlugs();
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | Italicninja',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: `${post.title} | Italicninja`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [getImageUrl(post.coverImage)] : [],
      type: 'article',
      publishedTime: post.date,
    },
  };
}

type PageProps = {
  params: Promise<Params>;
  searchParams?: Promise<SearchParams>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Check if user can edit this post
  const session = await getServerSession(authOptions);
  let canEdit = false;

  if (session) {
    const githubLogin = getGithubLogin(session.user);

    // Get the full post from database to check author
    const dbPost = await prisma.post.findUnique({
      where: { slug },
      include: { author: true },
    });

    if (dbPost) {
      // Check if the user is the author or has edit permission
      const isAuthor = dbPost.author.githubLogin === githubLogin || dbPost.author.name === githubLogin;
      const isOwnerUser = isOwner(githubLogin);

      canEdit = isAuthor || isOwnerUser;

      // If not author or owner, check for edit permission
      if (!canEdit) {
        try {
          canEdit = await hasPermission(githubLogin, 'edit');
        } catch (error) {
          console.error('Error checking edit permission:', error);
          canEdit = false;
        }
      }
    }
  }

  // Get related posts - first try posts with the same tag, then fall back to recent posts
  let relatedPosts: NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>[] = [];
  if (post.tags.length > 0) {
    // Get posts with the same primary tag
    const primaryTag = post.tags[0];
    const taggedPosts = await getPostsByTag(primaryTag);
    relatedPosts = taggedPosts.filter((p): p is NonNullable<typeof p> =>
      p !== undefined && p.slug !== post.slug
    ).slice(0, 3);
  }

  // If we don't have enough related posts by tag, add some recent posts
  if (relatedPosts.length < 3) {
    const recentPosts = await getRecentPosts(6);
    const additionalPosts = recentPosts
      .filter((p): p is NonNullable<typeof p> =>
        p !== undefined &&
        p.slug !== post.slug &&
        !relatedPosts.some(rp => rp.slug === p.slug)
      )
      .slice(0, 3 - relatedPosts.length);

    relatedPosts = [...relatedPosts, ...additionalPosts];
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        <article className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            {/* Post Header */}
            <header className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <time className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase" dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                  {post.author && (
                    <div className="ml-4 flex items-center">
                      <span className="text-gray-400 mx-2">•</span>
                      <div className="flex items-center">
                        {post.author.image && (
                          <Image
                            src={post.author.image}
                            alt={post.author.name || "Author"}
                            width={24}
                            height={24}
                            className="rounded-full mr-2"
                          />
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {post.author.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {canEdit && (
                  <Link
                    href={`/blog/${post.slug}/edit`}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Post
                  </Link>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 drop-shadow-sm">
                {post.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
              {post.coverImage && (
                <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden mb-8">
                  <SafeImage
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}
            </header>

            {/* Post Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-medium prose-headings:tracking-tight prose-a:text-accent prose-a:no-underline hover:prose-a:text-accent-light prose-a:transition-colors prose-img:rounded-md">
              <PostContent content={post.content} />
            </div>

            {/* Edited timestamp */}
            {post.editedAt && (
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Last edited on {formatDate(post.editedAt)}
                </p>
              </div>
            )}

            {/* Post Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-sm font-medium text-accent hover:text-accent-light transition-colors"
                >
                  <svg
                    className="mr-2 w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to all posts
                </Link>
                <div className="flex space-x-4">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://yourdomain.com/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-accent transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://yourdomain.com/blog/${post.slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-accent transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="max-w-7xl mx-auto mt-16 mb-8">
              <h2 className="text-xl font-medium tracking-tight text-foreground mb-6">More posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.slug} className="card group flex flex-col overflow-hidden bg-background border border-gray-200 dark:border-gray-800 rounded-lg transition-all duration-200 hover:shadow-medium">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <SafeImage
                        src={relatedPost.coverImage || ''}
                        alt={relatedPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col flex-grow p-4">
                      <div className="mb-2">
                        <time dateTime={relatedPost.date} className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">
                          {formatDate(relatedPost.date)}
                        </time>
                      </div>
                      <Link href={`/blog/${relatedPost.slug}`} className="group-hover:underline decoration-1 underline-offset-2">
                        <h3 className="text-lg font-medium tracking-tight text-foreground mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 flex-grow">
                        {relatedPost.excerpt}
                      </p>
                      <Link
                        href={`/blog/${relatedPost.slug}`}
                        className="inline-flex items-center text-sm font-medium text-accent hover:text-accent-light transition-colors"
                      >
                        Read more
                        <svg
                          className="ml-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </>
  );
}