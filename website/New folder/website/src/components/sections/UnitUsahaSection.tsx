import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ScrollReveal from '../animations/ScrollReveal';
import { ParallaxSection } from '../animations/MultiLayerParallax';
import { HoverGlow } from '../animations/MicroInteractions';

interface UnitUsaha {
  name: string;
  description: string;
  image: string;
  location: string;
}

interface UnitUsahaSectionProps {
  title: string;
  description: string;
  units: UnitUsaha[];
}

const UnitUsahaSection: React.FC<UnitUsahaSectionProps> = ({
  title,
  description,
  units
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['100px', '-100px']);

  return (
    <section ref={containerRef} className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full">
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#35513b" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-kopma_yellow-500/10 rounded-full mb-4"
          >
            <svg className="w-8 h-8 text-kopma_yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-bold text-primary-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Units Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {units.map((unit, index) => (
            <ScrollReveal key={`unit-${index}`} delay={index * 0.1} direction="up">
              <ParallaxSection speed={0.2 + (index * 0.05)}>
                <HoverGlow>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="group relative"
                  >
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary-100 to-kopma_yellow-100">
                  <motion.div
                    style={{ y }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <img 
                      src={unit.image} 
                      alt={unit.name}
                      className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </motion.div>
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-primary-900 mb-2 group-hover:text-kopma_yellow-600 transition-colors">
                    {unit.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {unit.description}
                  </p>
                  
                  {/* Location Link */}
                  <a 
                    href={unit.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-kopma_yellow-600 hover:text-kopma_yellow-700 font-medium group/link"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="group-hover/link:underline">Lihat Lokasi</span>
                    <svg className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-kopma_yellow-500/10 rounded-full flex items-center justify-center">
                  <span className="text-kopma_yellow-600 font-bold text-lg">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </motion.div>
                </HoverGlow>
              </ParallaxSection>
            </ScrollReveal>
          ))}
        </div>

        {/* Special highlight for new business */}
        {units.some(unit => unit.name.includes('Mie Sarjana')) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 p-6 bg-gradient-to-r from-kopma_yellow-500/10 to-primary-500/10 rounded-2xl border border-kopma_yellow-500/30"
          >
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center px-4 py-2 bg-kopma_yellow-500 text-white font-bold rounded-full">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Unit Usaha Terbaru
              </span>
              <p className="ml-4 text-gray-700 font-medium">
                Mie Sarjana - Nikmati kuliner spesial dari KOPMA UNNES!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default UnitUsahaSection;
