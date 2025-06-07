"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedContainer({ children, className = "", delay = 0 }: AnimatedContainerProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.h2
      className={className}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.h2>
  );
}

export function HoverLink({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      whileHover={{ x: 3 }}
    >
      {children}
    </motion.div>
  );
}