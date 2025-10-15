import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const UnitUsahaSection = ({ data }) => {
  const getLogoPlaceholder = (name) => {
    const color = ['10b981', '059669', '047857', '065f46', '064e3b'];
    return `https://via.placeholder.com/200x200/${color[Math.floor(Math.random() * color.length)]}/ffffff?text=${encodeURIComponent(name)}`;
  };

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-emerald-50 relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)',
          backgroundSize: '100% 100%'
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Unit Usaha
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Unit usaha yang dikelola oleh KOPMA UNNES untuk melayani kebutuhan mahasiswa dan masyarakat
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.unitUsaha.map((unit, index) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-green-400/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 90, 0]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <img
                    src={`/images/${unit.logo}.png`}
                    alt={unit.name}
                    className="relative z-10 w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = getLogoPlaceholder(unit.name);
                    }}
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {unit.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                    {unit.description}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-full group/btn"
                  >
                    <a href={unit.link} target="_blank" rel="noopener noreferrer">
                      <MapPin className="w-4 h-4 mr-2" />
                      See Our Location
                      <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UnitUsahaSection;
