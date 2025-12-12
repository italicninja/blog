import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getRecentPosts } from "@/lib/posts";
import { getTopGitHubProjects } from "@/lib/github";
import EnhancedBlogCard from "@/components/EnhancedBlogCard";
import GitHubProjectsCard from "@/components/GitHubProjectsCard";
import { AnimatedContainer, AnimatedHeading, HoverLink } from "@/components/AnimatedContainer";

// Revalidate this page every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const recentPosts = await getRecentPosts(3);
  const topProjects = await getTopGitHubProjects('italicninja', 3);

  return (
    <>
      <Header />

      <main className="min-h-screen">
        {/* Hero Section - Reduced by 50% */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 drop-shadow-sm">
                Italicninja
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                My random thoughts on DevOps, automation, and teaching robots to do my job 🤖
              </p>
              <Link
                href="/blog"
                className="btn btn-primary px-4 py-2 text-sm rounded-md"
              >
                Read the Blog
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Posts and GitHub Projects Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <AnimatedContainer className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar - GitHub Projects (on left side) */}
                <div className="w-full lg:w-1/3 mb-8 lg:mb-0 order-2 lg:order-1">
                  <div className="sticky top-24">
                    <GitHubProjectsCard projects={topProjects} />
                  </div>
                </div>

                {/* Main Content - Recent Posts */}
                <div className="w-full lg:w-2/3 order-1 lg:order-2">
                  <div className="flex justify-between items-center mb-10">
                    <AnimatedHeading className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      Recent Posts
                    </AnimatedHeading>
                    <HoverLink>
                      <Link
                        href="/blog"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors flex items-center"
                      >
                        View all posts
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </HoverLink>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentPosts.map((post, index) => (
                      <EnhancedBlogCard key={post.slug} post={post} index={index} />
                    ))}
                  </div>
                </div>
              </AnimatedContainer>
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
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Because clicking buttons is boring - let&apos;s make Terraform and Puppet do it for us!</p>
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
