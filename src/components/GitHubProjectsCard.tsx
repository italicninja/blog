"use client";

import Link from 'next/link';
import { GitHubProject } from '@/lib/github';
import { motion } from 'framer-motion';

interface GitHubProjectsCardProps {
  projects: GitHubProject[];
}

export default function GitHubProjectsCard({ projects }: GitHubProjectsCardProps) {
  return (
    <motion.div 
      className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-indigo-950 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        {/* Decorative header gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
        
        <div className="relative flex justify-between items-center p-4">
          <h2 className="text-xl font-bold tracking-tight text-white">
            My GitHub Stuff
          </h2>
          <Link
            href="https://github.com/italicninja"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-white hover:text-indigo-100 transition-colors flex items-center"
          >
            View all
            <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            className="group border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ x: 5 }}
          >
            <div className="flex justify-between items-start mb-1">
              <Link
                href={project.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group-hover:underline decoration-1 underline-offset-2"
              >
                <h3 className="text-base font-semibold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {project.name}
                </h3>
              </Link>
              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                <motion.span 
                  className="flex items-center mr-3"
                  whileHover={{ scale: 1.1 }}
                >
                  <svg className="w-3.5 h-3.5 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                  </svg>
                  {project.stargazers_count}
                </motion.span>
                <motion.span 
                  className="flex items-center"
                  whileHover={{ scale: 1.1 }}
                >
                  <svg className="w-3.5 h-3.5 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.559 8.855c.166 1.183.789 3.207 3.087 4.079-2.464.487-4.415 2.54-4.646 5.066h14c-.231-2.526-2.182-4.579-4.646-5.066 2.298-.872 2.921-2.896 3.087-4.079h-10.882zm-1.559-2.855v2h14v-2h-14z"/>
                  </svg>
                  {project.forks_count}
                </motion.span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-2 line-clamp-2">
              {project.description || "No description available"}
            </p>
            <div className="flex justify-between items-center">
              {project.language && (
                <span className="inline-flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
                  {project.language}
                </span>
              )}
              <motion.div whileHover={{ x: 3 }}>
                <Link
                  href={project.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                >
                  View project
                  <svg
                    className="ml-1 w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5"
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
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}