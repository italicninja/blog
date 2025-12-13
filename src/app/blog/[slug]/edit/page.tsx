import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogEditForm from '@/components/BlogEditForm';
import { getPostBySlug } from '@/lib/posts';
import { authOptions } from '@/lib/auth-options';
import { getGithubLogin, isOwner } from '@/lib/auth-utils';
import { hasPermission } from '@/lib/authorized-posters';
import prisma from '@/lib/prisma';

type Params = {
  slug: string;
};

type PageProps = {
  params: Promise<Params>;
};

export default async function EditBlogPage({ params }: PageProps) {
  const { slug } = await params;

  // Check if the user is authenticated
  const session = await getServerSession(authOptions);

  // If the user is not authenticated, redirect to the sign-in page
  if (!session) {
    redirect(`/auth/signin?callbackUrl=/blog/${slug}/edit`);
  }

  // Get the post
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get the GitHub login from the session
  const githubLogin = getGithubLogin(session.user);

  // Get the full post from database to check author
  const dbPost = await prisma.post.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!dbPost) {
    notFound();
  }

  // Check if the user is the author or has edit permission
  const isAuthor = dbPost.author.githubLogin === githubLogin || dbPost.author.name === githubLogin;
  const isOwnerUser = isOwner(githubLogin);

  let canEdit = isAuthor || isOwnerUser;

  // If not author or owner, check for edit permission
  if (!canEdit) {
    try {
      canEdit = await hasPermission(githubLogin, 'edit');
    } catch (error) {
      console.error('Error checking edit permission:', error);
      canEdit = false;
    }
  }

  // If user doesn't have permission, show unauthorized message
  if (!canEdit) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                  Unauthorized
                </h3>
                <p className="text-red-700 dark:text-red-300">
                  You do not have permission to edit this blog post.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm text-center">
                Edit Blog Post
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
                Update your blog post content.
              </p>
            </div>

            <BlogEditForm post={post} />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
