// src/components/sections/HeroSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage?: string;
  mascotImage?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  features?: string[];
  stats?: {
    label: string;
    value: string;
  }[];
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  backgroundImage,
  mascotImage,
  ctaText = 'Pelajari Lebih Lanjut',
  ctaLink = '/about',
  secondaryCtaText,
  secondaryCtaLink,
  features = [],
  stats = [],
  className = ''
}) => {
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(135deg, #35513b 0%, #6b9c78 100%)' }}
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="inline-block px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-100 rounded-full">
              {subtitle}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto"
          >
            {description}
          </motion.p>

          {/* Features */}
          {features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <ul className="flex flex-wrap justify-center gap-4 text-gray-300">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <a href={ctaLink}>
              <Button
                variant="primary"
                size="lg"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg"
              >
                {ctaText}
              </Button>
            </a>
            
            {secondaryCtaText && secondaryCtaLink && (
              <a href={secondaryCtaLink}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                >
                  {secondaryCtaText}
                </Button>
              </a>
            )}
          </motion.div>

          {/* Stats */}
          {stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-300">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          </div>

          {/* Mascot Image */}
          {mascotImage && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex-1 max-w-md"
            >
              <img
                src={mascotImage}
                alt="KOPMA UNNES Mascot"
                className="w-full h-auto object-contain"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center text-white">
          <span className="text-sm mb-2">Scroll untuk melihat lebih banyak</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;