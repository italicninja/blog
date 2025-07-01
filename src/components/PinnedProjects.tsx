import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PinnedProject } from '@/types/pinned-project';

const PinnedProjects: React.FC = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<PinnedProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/pinned-projects');
        if (!response.ok) {
          throw new Error('Failed to fetch pinned projects');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError('Error fetching pinned projects');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchProjects();
    }
  }, [session]);

  if (!session) {
    return null;
  }

  if (isLoading) {
    return <div>Loading pinned projects...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Pinned Projects</h2>
      {projects.length === 0 ? (
        <p>No pinned projects yet.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li key={project.id} className="border-b pb-4 last:border-b-0">
              <h3 className="text-xl font-semibold">
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {project.name}
                </a>
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{project.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Completed: {new Date(project.completedAt).toLocaleDateString()}
              </p>
              {project.tags.length > 0 && (
                <div className="mt-2">
                  {project.tags.map((tag) => (
                    <span key={tag.name} className="inline-block bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2 mb-2">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PinnedProjects;