import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
}

interface GallerySectionProps {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
}

const defaultImages: GalleryImage[] = [
  { src: '/assets/images/activity-1.jpg', alt: 'Member Gathering', category: 'Kegiatan' },
  { src: '/assets/images/activity-2.jpg', alt: 'Pelatihan Excel', category: 'Pelatihan' },
  { src: '/assets/images/activity-3.jpg', alt: 'Orientasi Anggota Baru', category: 'Kegiatan' },
  { src: '/assets/images/activity-4.jpg', alt: 'Workshop Koperasi', category: 'Workshop' },
  { src: '/assets/images/activity-5.jpg', alt: 'Upgrading Pengurus', category: 'Internal' },
  { src: '/assets/images/activity-6.jpg', alt: 'Halal Bihalal', category: 'Kegiatan' },
];

const GallerySection: React.FC<GallerySectionProps> = ({
  title = "Galeri Kegiatan",
  subtitle = "Momen-momen berharga bersama KOPMA UNNES",
  images = defaultImages
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const categories = ['Semua', ...Array.from(new Set(images.map(img => img.category)))];
  const filteredImages = selectedCategory === 'Semua' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-kopma_yellow-500/10 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-kopma_yellow-400 to-kopma_yellow-600 rounded-full mb-4 shadow-lg"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-bold text-primary-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((image, index) => (
              <motion.div
                key={`${image.src}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="relative group cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-lg mb-1">{image.alt}</p>
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                        {image.category}
                      </span>
                    </div>
                    
                    {/* View Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring" }}
                className="relative max-w-4xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={selectedImage.src} 
                  alt={selectedImage.alt}
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Image Info */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="text-white font-bold text-xl mb-1">{selectedImage.alt}</h3>
                  <span className="inline-block px-3 py-1 bg-kopma_yellow-500/80 text-white text-sm rounded-full">
                    {selectedImage.category}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GallerySection;
