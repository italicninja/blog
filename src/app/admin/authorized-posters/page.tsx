"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface AuthorizedPoster {
  id: string;
  githubLogin: string;
  createdAt: string;
  updatedAt: string;
}

export default function AuthorizedPostersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [authorizedPosters, setAuthorizedPosters] = useState<AuthorizedPoster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPosterLogin, setNewPosterLogin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch authorized posters
  useEffect(() => {
    async function fetchAuthorizedPosters() {
      if (status === 'loading') return;
      
      if (status !== 'authenticated') {
        router.push('/auth/signin?callbackUrl=/admin/authorized-posters');
        return;
      }
      
      try {
        const response = await fetch('/api/authorized-posters');
        
        if (!response.ok) {
          if (response.status === 403) {
            setError('You are not authorized to view this page.');
            setIsLoading(false);
            return;
          }
          
          throw new Error('Failed to fetch authorized posters');
        }
        
        const data = await response.json();
        setAuthorizedPosters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAuthorizedPosters();
  }, [status, router]);

  // Add a new authorized poster
  const handleAddPoster = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      if (!newPosterLogin.trim()) {
        throw new Error('GitHub login is required');
      }
      
      const response = await fetch('/api/authorized-posters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubLogin: newPosterLogin.trim() }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add authorized poster');
      }
      
      const newPoster = await response.json();
      setAuthorizedPosters((prev) => [...prev, newPoster]);
      setNewPosterLogin('');
      setSuccessMessage(`${newPoster.githubLogin} has been added to authorized posters.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove an authorized poster
  const handleRemovePoster = async (githubLogin: string) => {
    if (!confirm(`Are you sure you want to remove ${githubLogin} from authorized posters?`)) {
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`/api/authorized-posters?githubLogin=${encodeURIComponent(githubLogin)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove authorized poster');
      }
      
      setAuthorizedPosters((prev) => prev.filter((poster) => poster.githubLogin !== githubLogin));
      setSuccessMessage(`${githubLogin} has been removed from authorized posters.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // If the user is not authenticated, show a loading state
  if (status === 'loading' || isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // If the user is not authenticated, redirect to sign in
  if (status !== 'authenticated') {
    return null; // The useEffect will handle the redirect
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="mb-12">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm text-center">
                Manage Authorized Posters
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
                Control who can submit blog posts.
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-600 dark:text-green-400">
                {successMessage}
              </div>
            )}
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Add Authorized Poster</h2>
              
              <form onSubmit={handleAddPoster} className="flex items-center">
                <input
                  type="text"
                  value={newPosterLogin}
                  onChange={(e) => setNewPosterLogin(e.target.value)}
                  placeholder="GitHub username"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
              </form>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Current Authorized Posters</h2>
              
              {authorizedPosters.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 italic">No authorized posters found.</p>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {authorizedPosters.map((poster) => (
                    <li key={poster.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{poster.githubLogin}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400" suppressHydrationWarning>
                          Added on {new Date(poster.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemovePoster(poster.githubLogin)}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        disabled={poster.githubLogin === session?.user?.name}
                        title={poster.githubLogin === session?.user?.name ? "You cannot remove yourself" : "Remove"}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}