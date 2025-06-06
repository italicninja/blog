import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/posts";
import { formatDate } from "@/utils/date";

export const metadata = {
  title: 'Blog | Italicninja and adventures in Tech & Automation',
  description: 'My random thoughts on DevOps, automation, and teaching robots to do my job.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <>
      <Header />

      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 md:mb-24">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 text-center">Blog</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
                Random brain dumps about tech stuff I find interesting. No boring corporate speak here!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.slug} className="card group flex flex-col overflow-hidden bg-background border border-gray-200 dark:border-gray-800 rounded-lg transition-all duration-200 hover:shadow-medium">
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col flex-grow p-6">
                    <div className="mb-3">
                      <time dateTime={post.date} className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">
                        {formatDate(post.date)}
                      </time>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="group-hover:underline decoration-1 underline-offset-2">
                      <h2 className="text-xl font-medium tracking-tight text-foreground mb-3 line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
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
        </div>
      </main>

      <Footer />
    </>
  );
}