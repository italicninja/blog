import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogSubmissionForm from '@/components/BlogSubmissionForm';
import { isAuthorizedPoster } from '@/lib/authorized-posters';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const metadata = {
  title: 'Submit Blog Post | Italicninja',
  description: 'Submit a new blog post to Italicninja\'s blog.',
};

export default async function SubmitBlogPage() {
  // Check if the user is authenticated and authorized
  const session = await getServerSession(authOptions);
  const githubLogin = session?.user?.name || '';
  const isAuthorized = await isAuthorizedPoster(githubLogin);
  
  // If the user is not authenticated, redirect to the sign-in page
  if (!session) {
    redirect('/auth/signin?callbackUrl=/blog/submit');
  }
  
  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm text-center">
                Submit a Blog Post
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
                Share your thoughts with the world.
              </p>
            </div>
            
            {!isAuthorized ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Not Authorized
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  You are signed in, but you are not authorized to submit blog posts.
                  Please contact the site administrator to request posting privileges.
                </p>
              </div>
            ) : (
              <BlogSubmissionForm />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}