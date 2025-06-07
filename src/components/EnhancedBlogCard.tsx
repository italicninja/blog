"use client";

import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/utils/date';
import { motion } from 'framer-motion';
import { Post } from '@/lib/posts';

interface EnhancedBlogCardProps {
  post: Post;
  index: number;
}

export default function EnhancedBlogCard({ post, index }: EnhancedBlogCardProps) {
  return (
    <motion.article 
      className="card group flex flex-col overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={index < 3}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="flex flex-col flex-grow p-6">
        <div className="mb-3 flex items-center">
          <time dateTime={post.date} className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">
            {formatDate(post.date)}
          </time>
        </div>
        
        <Link href={`/blog/${post.slug}`} className="group-hover:underline decoration-1 underline-offset-2">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white mb-3 line-clamp-2">
            {post.title}
          </h2>
        </Link>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
          {post.excerpt}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <motion.span
              key={tag}
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              {tag}
            </motion.span>
          ))}
        </div>
        
        <motion.div whileHover={{ x: 3 }}>
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
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
        </motion.div>
      </div>
    </motion.article>
  );
}