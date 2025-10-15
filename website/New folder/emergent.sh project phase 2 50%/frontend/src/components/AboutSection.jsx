import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Users, Globe, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const roles = [
  {
    title: "Agen Pembaharuan",
    description: "Bahwa sebagai suatu kesatuan yang integral, KOPMA UNNES beserta seluruh anggota merupakan agent pembaharu dan pelopor pembangunan. Kemurnian sikap dan gagasannya tercermin dalam setiap kegiatan dan aktifitasnya.",
    icon: Lightbulb,
    gradient: "from-emerald-400 to-teal-500"
  },
  {
    title: "Kader Koperasi",
    description: "Bahwa sebagai suatu kesatuan yang integral, KOPMA UNNES beserta seluruh anggota merupakan agent pembaharu dan pelopor pembangunan. Kemurnian sikap dan gagasannya tercermin dalam setiap kegiatan dan aktifitasnya.",
    icon: Users,
    gradient: "from-green-400 to-emerald-500"
  },
  {
    title: "Kader Bangsa",
    description: "Bahwa sebagai suatu kesatuan yang integral, KOPMA UNNES beserta seluruh anggota merupakan agent pembaharu dan pelopor pembangunan. Kemurnian sikap dan gagasannya tercermin dalam setiap kegiatan dan aktifitasnya.",
    icon: Globe,
    gradient: "from-teal-400 to-green-500"
  }
];

const AboutSection = ({ data }) => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        {/* About KOPMA */}
        <div className="max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.img
              src="/images/kopma-logo.png"
              alt="KOPMA UNNES Logo"
              className="w-32 h-32 mx-auto mb-6"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/128x128/10b981/ffffff?text=KOPMA';
              }}
              animate={{
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {data.about.title}
            </h2>
            <p className="text-emerald-600 font-semibold text-lg">
              {data.about.subtitle}
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-700 text-lg leading-relaxed text-center mb-8"
          >
            {data.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-full group"
            >
              <a href="/tentang">
                See More
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Roles */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-bold text-center mb-4 text-gray-900"
          >
            Peran Kami
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-gray-600 mb-12 max-w-3xl mx-auto"
          >
            Dengan modal dan potensi yang dimiliki Koperasi Mahasiswa Universitas Negeri Semarang, maka Koperasi Mahasiswa UNNES dapat memegang posisi dan peranan sebagai berikut:
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full">
                  <motion.div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
