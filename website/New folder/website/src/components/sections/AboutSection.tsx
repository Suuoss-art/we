// src/components/sections/AboutSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import ScrollReveal from '../animations/ScrollReveal';
import { ParallaxSection } from '../animations/MultiLayerParallax';
import { HoverGlow } from '../animations/MicroInteractions';

interface AboutSectionProps {
  title: string;
  subtitle: string;
  description: string;
  image?: string;
  features?: {
    icon: string;
    title: string;
    description: string;
  }[];
  stats?: {
    label: string;
    value: string;
    description: string;
  }[];
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  title,
  subtitle,
  description,
  image,
  features = [],
  stats = [],
  ctaText = 'Pelajari Lebih Lanjut',
  ctaLink = '/about',
  className = ''
}) => {
  return (
    <section className={`py-20 bg-gray-50 relative overflow-hidden ${className}`}>
      {/* Background decorative elements */}
      <ParallaxSection speed={0.3} className="absolute top-20 left-10 w-64 h-64 bg-kopma_yellow-500/5 rounded-full blur-3xl" />
      <ParallaxSection speed={0.5} className="absolute bottom-20 right-10 w-96 h-96 bg-kopma_green-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <ScrollReveal direction="left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
            <div className="mb-6">
              <span className="inline-block px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-100 rounded-full mb-4">
                {subtitle}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {features.map((feature, index) => (
                  <ScrollReveal key={`feature-${index}`} delay={index * 0.1} direction="up">
                    <HoverGlow>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {feature.icon === 'users' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        )}
                        {feature.icon === 'shield' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        )}
                        {feature.icon === 'heart' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        )}
                        {feature.icon === 'star' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                    </HoverGlow>
                  </ScrollReveal>
                ))}
              </div>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <a href={ctaLink}>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4"
                >
                  {ctaText}
                </Button>
              </a>
            </motion.div>
          </motion.div>
          </ScrollReveal>

          {/* Image */}
          {image && (
            <ScrollReveal direction="right">
              <ParallaxSection speed={0.2}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative"
                >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              
              {/* Floating Cards */}
              {stats.length > 0 && (
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-1">
                      {stats[0]?.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats[0]?.label}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
              </ParallaxSection>
            </ScrollReveal>
          )}
        </div>

        {/* Stats Section */}
        {stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {stat.label}
                  </div>
                  <div className="text-gray-600">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;