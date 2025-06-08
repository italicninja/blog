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
          ? 'bg-background/80 shadow-sm py-2'
          : 'bg-background py-6'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className={`font-medium tracking-tight hover:opacity-80 transition-all duration-300 ${
              scrolled ? 'text-lg' : 'text-2xl'
            }`}
          >
            italicninja
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/blog" className="text-sm text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-foreground dark:hover:text-foreground transition-colors">
              About
            </Link>
            {isSessionLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : session ? (
              <div className="relative">
                <button
                  ref={avatarRef}
                  className="flex items-center focus:outline-none"
                  aria-label="User menu"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                      width={32}
                      height={32}
                      className={`rounded-full transition-all duration-300 ${
                        scrolled ? 'w-8 h-8' : 'w-10 h-10'
                      } border-2 border-transparent hover:border-accent`}
                    />
                  ) : (
                    <div className={`rounded-full bg-accent text-white flex items-center justify-center transition-all duration-300 ${
                      scrolled ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'
                    }`}>
                      {session.user?.name?.charAt(0) || "U"}
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
                  </div>
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
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}