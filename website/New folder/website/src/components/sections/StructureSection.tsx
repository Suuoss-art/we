// src/components/sections/StructureSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

interface StructureItem {
  id: string;
  name: string;
  position: string;
  level: number;
  parentId?: string;
  image?: string;
  bio?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  children?: StructureItem[];
}

interface StructureSectionProps {
  title: string;
  subtitle: string;
  description: string;
  structure: StructureItem[];
  className?: string;
}

const StructureSection: React.FC<StructureSectionProps> = ({
  title,
  subtitle,
  description,
  structure,
  className = ''
}) => {
  const renderStructureItem = (item: StructureItem, index: number, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="mb-6"
        style={{ marginLeft: `${level * 2}rem` }}
      >
        <Card
          variant="elevated"
          className="p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center space-x-4">
            {item.image && (
              <div className="flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {item.name}
              </h3>
              <p className="text-lg text-primary-600 font-medium mb-2">
                {item.position}
              </p>
              {item.bio && (
                <p className="text-gray-600 mb-3">
                  {item.bio}
                </p>
              )}
              
              {item.contact && (
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {item.contact.email && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {item.contact.email}
                    </span>
                  )}
                  {item.contact.phone && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {item.contact.phone}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
        
        {/* Render children */}
        {hasChildren && (
          <div className="mt-4">
            {item.children?.map((child, childIndex) =>
              renderStructureItem(child, childIndex, level + 1)
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <section className={`py-20 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-100 rounded-full mb-4">
            {subtitle}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Structure */}
        <div className="max-w-4xl mx-auto">
          {structure.map((item, index) => renderStructureItem(item, index))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Card variant="outlined" className="p-8">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Bergabung dengan Tim Kami
              </h3>
              <p className="text-gray-600 mb-6">
                KOPMA UNNES selalu membuka kesempatan bagi mahasiswa yang ingin berkontribusi 
                dalam pengembangan koperasi dan pelayanan kepada anggota.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                  Daftar Sekarang
                </button>
                <button className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors duration-200">
                  Pelajari Lebih Lanjut
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default StructureSection;