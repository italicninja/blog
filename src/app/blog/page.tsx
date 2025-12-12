import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllPosts, getAllTags } from "@/lib/posts";
import EnhancedBlogCard from "@/components/EnhancedBlogCard";
import { AnimatedContainer } from "@/components/AnimatedContainer";
import SortDropdown from "@/components/SortDropdown";
import Link from "next/link";
import { Suspense } from "react";

// Define a custom type that satisfies both the Promise interface and has the searchParams properties
type SearchParamsWithPromise = Promise<BlogPageProps['searchParams']> & BlogPageProps['searchParams'];

export const metadata = {
  title: 'Blog | Italicninja',
  description: 'My random thoughts on DevOps, automation, and teaching robots to do my job.',
};

export const dynamic = 'force-dynamic';

interface BlogPageProps {
  searchParams: {
    page?: string;
    tag?: string;
    search?: string;
    sort?: string;
  };
}

export default async function BlogPage({
  searchParams
}: {
  searchParams: SearchParamsWithPromise
}) {
  // Parse query parameters - access properties directly
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const tag = searchParams.tag || null;
  const search = searchParams.search || null;
  const sort = searchParams.sort || 'newest';

  // Determine sort options
  const sortOptions: Record<string, { orderBy: 'createdAt' | 'publishedAt' | 'title', orderDirection: 'asc' | 'desc' }> = {
    newest: { orderBy: 'createdAt', orderDirection: 'desc' },
    oldest: { orderBy: 'createdAt', orderDirection: 'asc' },
    title: { orderBy: 'title', orderDirection: 'asc' },
  };

  const { orderBy, orderDirection } = sortOptions[sort] || sortOptions.newest;

  // Fetch posts with pagination and sorting
  const { posts, total, totalPages } = await getAllPosts({
    page: currentPage,
    limit: 10,
    orderBy,
    orderDirection,
    tag,
    search,
  });

  // Fetch all tags for the sidebar
  const tags = await getAllTags();

  return (
    <>
      <Header />

      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 md:mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm text-center">
                Blog
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
                Random brain dumps about tech stuff I find interesting.
              </p>
            </div>

            <AnimatedContainer className="flex flex-col lg:flex-row gap-6 mb-12">
              {/* Main Content - Blog Posts Grid */}
              <div className="w-full lg:w-2/3">
                {/* Filters and Sort */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold tracking-tight text-foreground mb-3 md:mb-0">
                    {tag ? `Posts tagged "${tag}"` : search ? `Search: "${search}"` : "All Posts"}
                  </h2>

                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <form className="relative">
                      <input
                        type="text"
                        name="search"
                        placeholder="Search posts..."
                        defaultValue={search || ''}
                        className="w-full md:w-64 px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                      <button
                        type="submit"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </form>

                    {/* Sort - using client component */}
                    <SortDropdown currentSort={sort} />
                  </div>
                </div>

                {/* Posts Grid */}
                <Suspense fallback={<div>Loading posts...</div>}>
                  {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {posts.map((post, index) => (
                        <EnhancedBlogCard key={post.slug} post={post} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        No posts found. {search || tag ? (
                          <Link href="/blog" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                            Clear filters
                          </Link>
                        ) : null}
                      </p>
                    </div>
                  )}
                </Suspense>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {/* Previous Page */}
                      <Link
                        href={{
                          pathname: '/blog',
                          query: {
                            ...(tag ? { tag } : {}),
                            ...(search ? { search } : {}),
                            ...(sort !== 'newest' ? { sort } : {}),
                            ...(currentPage > 2 ? { page: currentPage - 1 } : {}),
                          },
                        }}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium rounded-l-md ${
                          currentPage === 1
                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : 0}
                      >
                        Previous
                      </Link>

                      {/* Page Numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                          key={page}
                          href={{
                            pathname: '/blog',
                            query: {
                              ...(tag ? { tag } : {}),
                              ...(search ? { search } : {}),
                              ...(sort !== 'newest' ? { sort } : {}),
                              ...(page > 1 ? { page } : {}),
                            },
                          }}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-indigo-50 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-500 text-indigo-600 dark:text-indigo-200'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          aria-current={page === currentPage ? 'page' : undefined}
                        >
                          {page}
                        </Link>
                      ))}

                      {/* Next Page */}
                      <Link
                        href={{
                          pathname: '/blog',
                          query: {
                            ...(tag ? { tag } : {}),
                            ...(search ? { search } : {}),
                            ...(sort !== 'newest' ? { sort } : {}),
                            page: currentPage + 1,
                          },
                        }}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium rounded-r-md ${
                          currentPage === totalPages
                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : 0}
                      >
                        Next
                      </Link>
                    </nav>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="w-full lg:w-1/3">
                {/* Tags */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4">
                  <h3 className="text-base font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link
                        key={tag.name}
                        href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                        className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                      >
                        {tag.name} <span className="text-gray-500 dark:text-gray-400">({tag.count})</span>
                      </Link>
                    ))}
                  </div>
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