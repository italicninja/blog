import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllPosts } from "@/lib/posts";
import { getTopGitHubProjects } from "@/lib/github";
import EnhancedBlogCard from "@/components/EnhancedBlogCard";
import GitHubProjectsCard from "@/components/GitHubProjectsCard";
import { AnimatedContainer } from "@/components/AnimatedContainer";

export const metadata = {
  title: 'Blog | Italicninja',
  description: 'My random thoughts on DevOps, automation, and teaching robots to do my job.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const topProjects = await getTopGitHubProjects('italicninja', 3);

  return (
    <>
      <Header />

      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 md:mb-24">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm text-center">
                Blog
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
                Random brain dumps about tech stuff I find interesting.
              </p>
            </div>

            <AnimatedContainer className="flex flex-col lg:flex-row gap-8 mb-16">
              {/* Main Content - Blog Posts Grid */}
              {/* Sidebar - GitHub Projects (visible first on mobile) */}
              <div className="lg:w-1/3 mb-8 lg:mb-0 lg:order-2">
                <div className="sticky top-24">
                  <GitHubProjectsCard projects={topProjects} />
                </div>
              </div>

              {/* Main Content - Blog Posts Grid */}
              <div className="lg:w-2/3 lg:order-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
                  All Posts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.map((post, index) => (
                    <EnhancedBlogCard key={post.slug} post={post} index={index} />
                  ))}
                </div>
              </div>

            </AnimatedContainer>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}