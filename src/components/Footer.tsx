"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getLatestCommit, GitHubCommit } from '@/lib/github';
import { formatDate } from '@/utils/date';

export default function Footer() {
  const [commitInfo, setCommitInfo] = useState<GitHubCommit | null>(null);
  const [isCommitLoading, setIsCommitLoading] = useState(true);

  useEffect(() => {
    const fetchCommitInfo = async () => {
      try {
        const commit = await getLatestCommit();
        setCommitInfo(commit);
      } catch (error) {
        console.error('Error fetching commit info:', error);
      } finally {
        setIsCommitLoading(false);
      }
    };

    fetchCommitInfo();
  }, []);

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Italicninja
            </p>
            {isCommitLoading ? (
              <div className="w-24 h-4 mt-1 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : commitInfo ? (
              <a
                href={commitInfo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-foreground transition-colors"
                aria-label={`View commit ${commitInfo.sha.substring(0, 7)}`}
              >
                <code className="font-mono">{commitInfo.sha.substring(0, 7)}</code>
                <span className="ml-1" suppressHydrationWarning>
                  {formatDate(commitInfo.commit.author.date)} - { process.env.NODE_ENV }
                </span>
              </a>
            ) : null}
          </div>
          <div className="flex-grow"></div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a
              href="https://github.com/italicninja"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-foreground transition-colors"
              aria-label="GitHub Profile"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/ianc485/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-foreground transition-colors"
              aria-label="LinkedIn Profile"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}