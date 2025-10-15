import React, { useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface SmoothScrollProps {
  children: React.ReactNode;
}

const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Smooth scroll behavior
  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add custom scroll animation for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-kopma_yellow-500 origin-left z-50"
        style={{ scaleX }}
      />
      
      {children}
    </>
  );
};

export default SmoothScroll;
