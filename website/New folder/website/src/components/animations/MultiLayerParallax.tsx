import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

interface ParallaxLayer {
  children: React.ReactNode;
  speed: number; // 0 = no movement, 1 = normal scroll, higher = faster parallax
  className?: string;
  zIndex?: number;
}

interface MultiLayerParallaxProps {
  layers: ParallaxLayer[];
  className?: string;
}

const MultiLayerParallax: React.FC<MultiLayerParallaxProps> = ({ layers, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {layers.map((layer, index) => {
        const y = useTransform(
          scrollYProgress,
          [0, 1],
          ['0%', `${layer.speed * 50}%`]
        );

        const smoothY = useSpring(y, {
          stiffness: 100,
          damping: 30,
          restDelta: 0.001
        });

        return (
          <motion.div
            key={index}
            style={{ 
              y: smoothY,
              zIndex: layer.zIndex || index
            }}
            className={`absolute inset-0 ${layer.className || ''}`}
          >
            {layer.children}
          </motion.div>
        );
      })}
    </div>
  );
};

// Specialized parallax section for hero sections
interface ParallaxHeroProps {
  background?: React.ReactNode;
  midground?: React.ReactNode;
  foreground?: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
  minHeight?: string;
}

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  background,
  midground,
  foreground,
  content,
  className = '',
  minHeight = 'min-h-screen'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Different speeds for each layer
  const bgY = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '50%']), {
    stiffness: 100,
    damping: 30
  });

  const mgY = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '30%']), {
    stiffness: 100,
    damping: 30
  });

  const fgY = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '15%']), {
    stiffness: 100,
    damping: 30
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${minHeight} ${className}`}>
      {/* Background Layer (slowest) */}
      {background && (
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 w-full h-full"
        >
          {background}
        </motion.div>
      )}

      {/* Midground Layer (medium speed) */}
      {midground && (
        <motion.div
          style={{ y: mgY }}
          className="absolute inset-0 w-full h-full"
        >
          {midground}
        </motion.div>
      )}

      {/* Foreground Layer (fastest) */}
      {foreground && (
        <motion.div
          style={{ y: fgY }}
          className="absolute inset-0 w-full h-full"
        >
          {foreground}
        </motion.div>
      )}

      {/* Content (fixed or slight parallax) */}
      {content && (
        <motion.div
          style={{ opacity }}
          className="relative z-10 flex items-center justify-center h-full"
        >
          {content}
        </motion.div>
      )}
    </div>
  );
};

// Parallax for individual sections
interface ParallaxSectionProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down';
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  className = '',
  direction = 'up'
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const range = direction === 'up' ? ['0%', `${-speed * 100}%`] : ['0%', `${speed * 100}%`];
  const y = useSpring(useTransform(scrollYProgress, [0, 1], range), {
    stiffness: 100,
    damping: 30
  });

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Parallax image component
interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
}

export const ParallaxImage: React.FC<ParallaxImageProps> = ({
  src,
  alt,
  speed = 0.5,
  className = '',
  objectFit = 'cover'
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 50}%`]), {
    stiffness: 100,
    damping: 30
  });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        className={`w-full h-full object-${objectFit}`}
      />
    </div>
  );
};

// Floating elements with parallax (for decorative elements)
interface FloatingElementProps {
  children: React.ReactNode;
  speed?: number;
  rotationSpeed?: number;
  className?: string;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  speed = 0.3,
  rotationSpeed = 0,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]), {
    stiffness: 100,
    damping: 30
  });

  const rotate = rotationSpeed > 0 
    ? useTransform(scrollYProgress, [0, 1], [0, rotationSpeed * 360])
    : undefined;

  return (
    <motion.div
      ref={ref}
      style={{ y, rotate }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default MultiLayerParallax;
