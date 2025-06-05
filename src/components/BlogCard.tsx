import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/utils/date';

interface BlogCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    coverImage: string;
  };
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="card group flex flex-col overflow-hidden bg-background border border-gray-200 dark:border-gray-800 rounded-lg transition-all duration-200 hover:shadow-medium">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col flex-grow p-6">
        <div className="mb-3">
          <time dateTime={post.date} className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase">
            {formatDate(post.date)}
          </time>
        </div>
        <Link href={`/blog/${post.slug}`} className="group-hover:underline decoration-1 underline-offset-2">
          <h2 className="text-xl font-medium tracking-tight text-foreground mb-3 line-clamp-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
          {post.excerpt}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-sm font-medium text-accent hover:text-accent-light transition-colors"
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
      </div>
    </article>
  );
}