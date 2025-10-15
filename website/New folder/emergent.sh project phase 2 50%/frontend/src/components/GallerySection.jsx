import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const galleryImages = [
  { id: 1, src: '/images/gallery/1.jpg', alt: 'Kegiatan KOPMA 1' },
  { id: 2, src: '/images/gallery/2.jpg', alt: 'Kegiatan KOPMA 2' },
  { id: 3, src: '/images/gallery/3.jpg', alt: 'Kegiatan KOPMA 3' },
  { id: 4, src: '/images/gallery/4.jpg', alt: 'Kegiatan KOPMA 4' },
  { id: 5, src: '/images/gallery/5.jpg', alt: 'Kegiatan KOPMA 5' },
  { id: 6, src: '/images/gallery/6.jpg', alt: 'Kegiatan KOPMA 6' }
];

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const getPlaceholder = (id) => {
    const colors = ['10b981', '059669', '047857', '065f46', '064e3b', '34d399'];
    return `https://via.placeholder.com/400x400/${colors[id % colors.length]}/ffffff?text=Gallery+${id}`;
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Let's See Our Activities
          </h2>
          <p className="text-gray-600 text-lg">
            Dokumentasi kegiatan dan momen berharga KOPMA UNNES
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="relative aspect-square cursor-pointer group overflow-hidden rounded-2xl"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.target.src = getPlaceholder(image.id);
                }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
              >
                <p className="text-white font-semibold">{image.alt}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <button
                className="absolute top-4 right-4 text-white hover:text-emerald-400 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-8 h-8" />
              </button>
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GallerySection;
