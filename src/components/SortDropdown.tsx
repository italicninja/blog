"use client";

import { useRouter } from 'next/navigation';
import { usePathname, useSearchParams } from 'next/navigation';

interface SortDropdownProps {
  currentSort: string;
}

export default function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    // Use replace to avoid stacking sort-change entries in browser history
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="sort-select"
        name="sort"
        value={currentSort}
        onChange={handleSortChange}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="title">Title A-Z</option>
      </select>
    </div>
  );
}
