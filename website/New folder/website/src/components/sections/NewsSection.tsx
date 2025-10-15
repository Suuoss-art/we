import React from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '../animations/ScrollReveal';
import { HoverGlow } from '../animations/MicroInteractions';

interface NewsItem {
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  link: string;
}

interface NewsSectionProps {
  title?: string;
  subtitle?: string;
  news?: NewsItem[];
}

const defaultNews: NewsItem[] = [
  {
    title: "Sukses di Era Digital: KOPMA UNNES Gelar Webinar HARKOPNAS ke-76",
    excerpt: "KOPMA UNNES menggelar webinar menarik dalam rangka memperingati Hari Koperasi Nasional ke-76 dengan tema digitalisasi koperasi.",
    image: "/assets/images/activity-1.jpg",
    date: "2024-01-15",
    category: "Event",
    link: "#"
  },
  {
    title: "Malam Keakraban KOPMA UNNES di Villa 15 Bandungan",
    excerpt: "Mempererat tali persaudaraan antar anggota KOPMA UNNES melalui kegiatan malam keakraban yang penuh kehangatan.",
    image: "/assets/images/malam-keakraban.jpg",
    date: "2024-01-10",
    category: "Kegiatan",
    link: "#"
  },
  {
    title: "Pembubaran Staf KOPMA UNNES: Apresiasi Perjalanan Kinerja",
    excerpt: "Acara pembubaran staf sebagai bentuk apresiasi dan penghargaan untuk dedikasi dalam memajukan KOPMA UNNES.",
    image: "/assets/images/activity-3.jpg",
    date: "2024-01-05",
    category: "Internal",
    link: "#"
  }
];

const NewsSection: React.FC<NewsSectionProps> = ({
  title = "Berita & Kegiatan",
  subtitle = "Informasi terkini seputar KOPMA UNNES",
  news = defaultNews
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-kopma_yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
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
          <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
            NEWS & UPDATES
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-primary-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* News Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {news.map((item, index) => (
            <ScrollReveal key={`news-${index}`} delay={index * 0.1} direction="up">
              <HoverGlow>
                <motion.article
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group cursor-pointer"
                >
                  <a href={item.link} className="block">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-700 text-sm font-semibold rounded-full">
                        {item.category}
                      </span>
                    </div>
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Date */}
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(item.date).toLocaleDateString('id-ID', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-primary-900 mb-3 group-hover:text-kopma_yellow-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {item.excerpt}
                    </p>

                    {/* Read More Link */}
                    <div className="flex items-center text-kopma_yellow-600 font-medium group-hover:text-kopma_yellow-700">
                      <span>Baca Selengkapnya</span>
                      <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            </motion.article>
              </HoverGlow>
            </ScrollReveal>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <a 
            href="/blog"
            className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors duration-200"
          >
            Lihat Semua Berita
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
