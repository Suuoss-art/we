import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ModernHeroProps {
  title: string;
  subtitle: string;
  description: string;
  mascotImage?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  stats?: { label: string; value: string }[];
}

const ModernHero: React.FC<ModernHeroProps> = ({
  title,
  subtitle,
  description,
  mascotImage,
  ctaText,
  ctaLink = '#',
  secondaryCtaText,
  secondaryCtaLink = '#',
  stats = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700"
    >
      {/* Animated background layers */}
      <motion.div 
        style={{ y }} 
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Geometric patterns */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <circle cx="25" cy="25" r="1" fill="#edb421" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </motion.div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ opacity }}
            className="text-white space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-kopma_yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-kopma_yellow-500/30"
            >
              <span className="w-2 h-2 bg-kopma_yellow-500 rounded-full animate-pulse" />
              <span className="text-kopma_yellow-300 text-sm font-medium">{subtitle}</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold leading-tight"
            >
              <span className="block">{title.split(' ')[0]}</span>
              <span className="block text-kopma_yellow-500">{title.split(' ').slice(1).join(' ')}</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-200 leading-relaxed"
            >
              {description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a 
                href={ctaLink}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-primary-900 transition-all duration-200 bg-kopma_yellow-500 rounded-lg hover:bg-kopma_yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kopma_yellow-500"
              >
                <span className="relative">{ctaText}</span>
                <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              
              {secondaryCtaText && (
                <a 
                  href={secondaryCtaLink}
                  className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50"
                >
                  <span className="relative">{secondaryCtaText}</span>
                  <svg className="w-5 h-5 ml-2 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </motion.div>

            {/* Stats */}
            {stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/20"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-kopma_yellow-500 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-300 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Mascot Image */}
          {mascotImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              style={{ scale }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <img 
                  src={mascotImage} 
                  alt="KOPMA UNNES Mascot"
                  className="w-full h-auto max-w-md mx-auto filter drop-shadow-2xl"
                />
                
                {/* Glow effect */}
                <div className="absolute inset-0 blur-3xl opacity-30">
                  <div className="w-full h-full bg-kopma_yellow-500 rounded-full" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-wider">Scroll</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ModernHero;
