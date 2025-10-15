// src/components/animations/AnimatedCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  hover?: boolean;
  click?: boolean;
  variant?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  delay = 0,
  duration = 0.5,
  hover = true,
  click = true,
  variant = 'fadeIn'
}: AnimatedCardProps) => {
  const variants: Record<string, any> = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 }
    },
    slideRight: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    rotate: {
      hidden: { opacity: 0, rotate: -10 },
      visible: { opacity: 1, rotate: 0 }
    }
  };



  return (
    <motion.div
      className={className}
      variants={variants[variant]}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      whileTap={click ? "tap" : undefined}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;


