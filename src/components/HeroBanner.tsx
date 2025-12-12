"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroBannerProps {
  coverImages: string[]; // Array of blog post cover image URLs
}

export default function HeroBanner({ coverImages }: HeroBannerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Only cycle if we have images
    if (coverImages.length === 0) return;

    // Change background every 5 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % coverImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [coverImages.length]);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Animated Background Images */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          {coverImages.length > 0 && (
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${coverImages[currentImageIndex]})`,
                  filter: 'blur(8px) brightness(0.4)',
                  transform: 'scale(1.1)', // Slight scale to hide blur edges
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95" />
        <div className="absolute inset-0 bg-gradient-primary opacity-20" />

        {/* Optional: Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
          >
            <span className="text-gradient">Italicninja</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
          >
            My random thoughts on DevOps, automation, and teaching robots to do my job{' '}
            <span className="inline-block animate-pulse-slow">🤖</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/blog" className="btn btn-primary">
              Read the Blog
            </Link>
            <Link href="/about" className="btn btn-outline">
              About Me
            </Link>
          </motion.div>

          {/* Image Indicators */}
          {coverImages.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex justify-center gap-2 mt-12"
            >
              {coverImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-accent w-8'
                      : 'bg-gray-500 hover:bg-gray-400'
                  }`}
                  aria-label={`View background ${index + 1}`}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
