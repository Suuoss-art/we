// src/components/animations/SlideIn.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface SlideInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  stagger?: boolean;
  staggerChildren?: number;
}

const SlideIn: React.FC<SlideInProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  direction = 'left',
  distance = 50,
  stagger = false,
  staggerChildren = 0.1
}: SlideInProps) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { opacity: 0, x: -distance };
      case 'right':
        return { opacity: 0, x: distance };
      case 'up':
        return { opacity: 0, y: -distance };
      case 'down':
        return { opacity: 0, y: distance };
      default:
        return { opacity: 0, x: -distance };
    }
  };

  const getAnimatePosition = () => {
    return { opacity: 1, x: 0, y: 0 };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger ? staggerChildren : 0
      }
    }
  };

  const itemVariants = {
    hidden: getInitialPosition(),
    visible: getAnimatePosition()
  };

  return (
    <motion.div
      className={className}
      variants={stagger ? containerVariants : undefined}
      initial={stagger ? "hidden" : getInitialPosition()}
      animate={stagger ? "visible" : getAnimatePosition()}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
    >
      {stagger ? (
        <motion.div variants={itemVariants}>
          {children}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  );
};

export default SlideIn;


