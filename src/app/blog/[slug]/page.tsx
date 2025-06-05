import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPostBySlug, getRecentPosts, getPostContentHtml, getAllPostSlugs } from "@/lib/posts";
import { formatDate } from "@/utils/date";
import type { Metadata } from "next";
import PostContent from "./post-content";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return getAllPostSlugs();
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | Tech & Automation Stuff',
      description: 'The requested blog post could not be found.',
    };
  }
  
  return {
    title: `${post.title} | Tech & Automation Stuff`,
    description: post.excerpt,
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }
  
  const relatedPosts = getRecentPosts(3).filter(p => p.slug !== post.slug);

  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        <article className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            {/* Post Header */}
            <header className="mb-12">
              <div className="mb-4">
                <time className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase" dateTime={post.date}>
                  {formatDate(post.date)}
                </time>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
                {post.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-10">
                {post.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="relative aspect-[21/9] w-full rounded-lg overflow-hidden mb-12">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </header>
            
            {/* Post Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-medium prose-headings:tracking-tight prose-a:text-accent prose-a:no-underline hover:prose-a:text-accent-light prose-a:transition-colors prose-img:rounded-md">
              <PostContent content={post.content} />
            </div>
            
            {/* Post Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
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
            <div className="max-w-7xl mx-auto mt-24 mb-12">
              <h2 className="text-2xl font-medium tracking-tight text-foreground mb-12">More posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.slug} className="card group flex flex-col overflow-hidden bg-background border border-gray-200 dark:border-gray-800 rounded-lg transition-all duration-200 hover:shadow-medium">
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <Image
                        src={relatedPost.coverImage}
                        alt={relatedPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col flex-grow p-6">
                      <div className="mb-3">
                        <time dateTime={relatedPost.date} className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">
                          {formatDate(relatedPost.date)}
                        </time>
                      </div>
                      <Link href={`/blog/${relatedPost.slug}`} className="group-hover:underline decoration-1 underline-offset-2">
                        <h3 className="text-xl font-medium tracking-tight text-foreground mb-3 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">
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