"use client";

import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface Tag {
  id: string;
  name: string;
  count: number;
}

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Only fetch when the dropdown is open
  useEffect(() => {
    if (!isOpen) return;

    const fetchTags = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/tags?search=${encodeURIComponent(debouncedSearch)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data = await response.json();
        setTags(data.tags);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [debouncedSearch, isOpen]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  }, []);

  const handleTagSelect = useCallback((tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    setIsOpen(false);
    setSearchTerm('');
  }, [selectedTags, onTagsChange]);

  const handleTagRemove = useCallback((tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  }, [selectedTags, onTagsChange]);

  // Close dropdown on outside click — ref is on the container so input clicks are included
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen && tags.length > 0) {
      // Move focus to the first option in the listbox
      const listbox = document.getElementById(listboxId);
      const firstOption = listbox?.querySelector('[role="option"]') as HTMLElement | null;
      firstOption?.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-label="Search and select tags"
        placeholder="Search tags..."
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Available tags"
          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg"
        >
          {isLoading ? (
            <div className="flex justify-center items-center p-4" role="status" aria-label="Loading tags">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" aria-hidden="true"></div>
            </div>
          ) : error ? (
            <p className="p-2 text-red-500" role="alert">{error}</p>
          ) : (
            <ul className="max-h-60 overflow-auto">
              {tags.map((tag) => (
                <li
                  key={tag.id}
                  role="option"
                  aria-selected={selectedTags.includes(tag.name)}
                  tabIndex={0}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700 outline-none"
                  onClick={() => handleTagSelect(tag.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTagSelect(tag.name);
                    } else if (e.key === 'ArrowDown') {
                      (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus();
                    } else if (e.key === 'ArrowUp') {
                      (e.currentTarget.previousElementSibling as HTMLElement | null)?.focus();
                    } else if (e.key === 'Escape') {
                      setIsOpen(false);
                    }
                  }}
                >
                  {tag.name} ({tag.count})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Selected tags">
        {selectedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleTagRemove(tag)}
              aria-label={`Remove tag: ${tag}`}
              className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:text-indigo-600 dark:text-indigo-300 dark:hover:text-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
