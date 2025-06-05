import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getRecentPosts } from "@/lib/posts";
import { formatDate } from "@/utils/date";

export default async function Home() {
  const recentPosts = await getRecentPosts(3);

  return (
    <>
      <Header />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-gray-500">
                Italicninja does Tech & Automation Stuff
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                My random thoughts on DevOps, automation, and teaching robots to do my job 🤖
              </p>
              <Link
                href="/blog"
                className="btn btn-primary px-8 py-3 rounded-md"
              >
                Read the Blog
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Posts Section */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-16">
                <h2 className="text-3xl font-medium tracking-tight text-foreground">Recent Posts</h2>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-accent hover:text-accent-light transition-colors flex items-center"
                >
                  View all posts
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentPosts.map((post) => (
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
                        <h3 className="text-xl font-medium tracking-tight text-foreground mb-3 line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
                        {post.excerpt}
                      </p>
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
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-medium tracking-tight text-center text-foreground mb-16">Topics I Write About</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="group relative bg-background border border-gray-200 dark:border-gray-800 rounded-lg p-8 transition-all duration-200 hover:shadow-medium">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-light transform -translate-y-px opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <div className="text-accent mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-3">DevOps Shenanigans</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Cool tricks, epic fails, and lessons learned from my DevOps adventures.</p>
                </div>

                <div className="group relative bg-background border border-gray-200 dark:border-gray-800 rounded-lg p-8 transition-all duration-200 hover:shadow-medium">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-light transform -translate-y-px opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <div className="text-accent mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-3">Code That Builds Stuff</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Because clicking buttons is boring - let's make Terraform and Puppet do it for us!</p>
                </div>

                <div className="group relative bg-background border border-gray-200 dark:border-gray-800 rounded-lg p-8 transition-all duration-200 hover:shadow-medium">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-light transform -translate-y-px opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <div className="text-accent mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-3">AI & Robot Overlords</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Teaching AI to do my job so I can spend more time on Reddit. What could go wrong?</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
