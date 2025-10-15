import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
// BeeMascot3D removed - using KOPMA logo/mascot image instead

interface EnhancedHeroProps {
  title: string;
  subtitle: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  stats?: { label: string; value: string }[];
  enable3D?: boolean;
}

const EnhancedHero: React.FC<EnhancedHeroProps> = ({
  title,
  subtitle,
  description,
  ctaText = "Gabung Sekarang",
  ctaLink = '#',
  secondaryCtaText = "Pelajari Lebih Lanjut",
  secondaryCtaLink = '#layanan',
  stats = [],
  enable3D = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Smooth parallax effects
  const y = useSpring(useTransform(scrollYProgress, [0, 1], ['0%', '30%']), {
    stiffness: 100,
    damping: 30
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700"
    >
      {/* Animated background with parallax */}
      <motion.div 
        style={{ y }} 
        className="absolute inset-0 z-0"
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        
        {/* Animated geometric patterns */}
        <motion.svg 
          className="absolute inset-0 w-full h-full opacity-10"
          style={{
            x: mousePosition.x * 0.5,
            y: mousePosition.y * 0.5
          }}
        >
          <defs>
            <pattern id="honeycomb" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
              <polygon 
                points="25,0 50,14.43 50,28.87 25,43.3 0,28.87 0,14.43" 
                fill="none" 
                stroke="#edb421" 
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#honeycomb)" />
        </motion.svg>

        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-kopma_yellow-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-20">
          
          {/* Text Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ opacity, scale }}
            className="text-white space-y-8"
          >
            {/* Badge with pulse animation */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center space-x-2 bg-kopma_yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-kopma_yellow-500/30"
            >
              <motion.span 
                className="w-2 h-2 bg-kopma_yellow-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
              <span className="text-kopma_yellow-300 text-sm font-medium tracking-wide">
                {subtitle}
              </span>
            </motion.div>

            {/* Title with gradient text */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="block mb-2">{title.split(' ')[0]}</span>
              <span className="block bg-gradient-to-r from-kopma_yellow-400 to-kopma_yellow-600 bg-clip-text text-transparent">
                {title.split(' ').slice(1).join(' ')}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-200 leading-relaxed max-w-xl"
            >
              {description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              <motion.a
                href={ctaLink}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(237, 180, 33, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-kopma_yellow-500 text-primary-900 rounded-full font-bold text-lg shadow-lg hover:bg-kopma_yellow-400 transition-colors inline-flex items-center space-x-2"
              >
                <span>{ctaText}</span>
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </motion.a>

              <motion.a
                href={secondaryCtaLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-full font-bold text-lg hover:bg-white/20 transition-colors"
              >
                {secondaryCtaText}
              </motion.a>
            </motion.div>

            {/* Stats */}
            {stats.length > 0 && (
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-bold text-kopma_yellow-500 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-300">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* KOPMA Mascot - Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative h-[400px] lg:h-[600px]"
            style={{
              x: mousePosition.x * -0.3,
              y: mousePosition.y * -0.3
            }}
          >
            <motion.img
              src="/assets/images/kopma-unnes-logo.png"
              alt="KOPMA UNNES Mascot"
              className="w-full h-full object-contain drop-shadow-2xl"
              animate={{
                y: [0, -20, 0],
                rotate: [-2, 2, -2],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-kopma_yellow-500/20 blur-3xl -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center space-y-2 text-white/60 cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-sm uppercase tracking-wider">Scroll</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default EnhancedHero;
