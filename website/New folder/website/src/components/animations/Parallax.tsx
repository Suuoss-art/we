// src/components/animations/Parallax.tsx
import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  offset?: number;
  scale?: boolean;
  rotate?: boolean;
}

const Parallax: React.FC<ParallaxProps> = ({
  children,
  className = '',
  speed = 0.5,
  direction = 'up',
  offset = 0,
  scale = false,
  rotate = false
}) => {
  const [elementTop, setElementTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    const element = document.querySelector('[data-parallax]') as HTMLElement;
    if (element) {
      setElementTop(element.offsetTop);
      setClientHeight(window.innerHeight);
    }
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return useTransform(scrollY, [elementTop - clientHeight, elementTop + clientHeight], [speed * 100, -speed * 100]);
      case 'down':
        return useTransform(scrollY, [elementTop - clientHeight, elementTop + clientHeight], [-speed * 100, speed * 100]);
      case 'left':
        return useTransform(scrollY, [elementTop - clientHeight, elementTop + clientHeight], [speed * 100, -speed * 100]);
      case 'right':
        return useTransform(scrollY, [elementTop - clientHeight, elementTop + clientHeight], [-speed * 100, speed * 100]);
      default:
        return useTransform(scrollY, [elementTop - clientHeight, elementTop + clientHeight], [speed * 100, -speed * 100]);
    }
  };

  const y = direction === 'up' || direction === 'down' ? getTransform() : 0;
  const x = direction === 'left' || direction === 'right' ? getTransform() : 0;
  
  const scaleTransform = scale ? useTransform(scrollY, [elementTop - clientHeight, elementTop + clientHeight], [0.8, 1.2]) : 1;
  const rotateTransform = rotate ? useTransform(scrollY, [elementTop - clientHeight, elementTop + clientHeight], [-10, 10]) : 0;

  return (
    <motion.div
      className={className}
      data-parallax
      style={{
        y: direction === 'up' || direction === 'down' ? y : undefined,
        x: direction === 'left' || direction === 'right' ? x : undefined,
        scale: scale ? scaleTransform : undefined,
        rotate: rotate ? rotateTransform : undefined,
        transformOrigin: 'center center'
      }}
    >
      {children}
    </motion.div>
  );
};

export default Parallax;




