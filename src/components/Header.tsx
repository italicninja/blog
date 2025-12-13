"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { signIn, signOut } from 'next-auth/react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isSessionLoading = status === "loading";
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicks outside the dropdown menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        avatarRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle menu hover events with delay
  const handleMenuMouseEnter = () => {
    // Clear any existing timeout when mouse enters the menu
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMenuMouseLeave = () => {
    // Set a timeout to close the menu after 1 second
    closeTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
      closeTimeoutRef.current = null;
    }, 1000);
  };

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-sm transition-all duration-300 ${
        scrolled
          ? 'bg-background/80 shadow-sm py-3'
          : 'bg-background py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="font-medium tracking-tight hover:opacity-80 transition-all duration-300 text-xl"
          >
            italicninja
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-foreground transition-colors px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-foreground transition-colors px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-foreground transition-colors px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              About
            </Link>
            {isSessionLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : session ? (
              <div className="relative">
                <button
                  ref={avatarRef}
                  className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
                  aria-label="User menu"
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {session.user?.image && !session.user.image.includes('null') ? (
                    <div className="rounded-full overflow-hidden transition-all duration-300 w-9 h-9 border-2 border-transparent hover:border-accent">
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User avatar"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://github.com/ghost.png'; // fallback image
                        }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-full bg-accent text-white flex items-center justify-center transition-all duration-300 w-9 h-9 text-sm">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                    </div>
                  )}
                </button>
                <div
                  ref={menuRef}
                  className={`absolute right-0 mt-2 w-48 bg-background border border-gray-200 dark:border-gray-800 rounded-md shadow-lg py-1 z-10 transition-opacity duration-150 ${
                    isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                  }`}
                  onMouseEnter={handleMenuMouseEnter}
                  onMouseLeave={handleMenuMouseLeave}
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-foreground truncate">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                    {session.user?.githubLogin && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{session.user.githubLogin}</p>
                    )}
                  </div>
                  <Link
                    href="/blog/submit"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Submit Blog Post
                  </Link>
                  <Link
                    href="/admin/authorized-posters"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Manage Posters
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-800 my-1"></div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsButtonLoading(true);
                  signIn(process.env.NODE_ENV === 'development' ? 'dev-bypass' : 'github');
                }}
                disabled={isButtonLoading}
                className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-foreground transition-colors px-2 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {isButtonLoading ? (
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : process.env.NODE_ENV === 'development' ? (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
                  </svg>
                )}
                {process.env.NODE_ENV === 'development' ? 'Dev Sign In' : 'Sign in'}
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}