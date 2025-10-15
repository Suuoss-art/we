import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Youtube, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { kopmaData } from '../data/kopmaData';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <img
              src="/images/kopma-logo.png"
              alt="KOPMA UNNES"
              className="h-16 w-auto mb-4"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/64x64/10b981/ffffff?text=K';
              }}
            />
            <h3 className="text-xl font-bold mb-4">KOPMA UNNES</h3>
            <p className="text-gray-400 leading-relaxed">
              Koperasi Mahasiswa Universitas Negeri Semarang. Kami Ada Karena Anda.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="/tentang" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="/keanggotaan" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Keanggotaan
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Acara
                </a>
              </li>
              <li>
                <a href="/inventaris" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Inventaris
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                <span className="text-gray-400 text-sm">
                  Gedung E5 Lantai 1, Kampus Sekaran, Gunungpati, Semarang
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a href={`tel:${kopmaData.contact.whatsapp}`} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                  {kopmaData.contact.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <a href={`mailto:${kopmaData.contact.email}`} className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                  {kopmaData.contact.email}
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <motion.a
                href={kopmaData.contact.whatsapp.startsWith('+') ? `https://wa.me/${kopmaData.contact.whatsapp.replace('+', '')}` : kopmaData.contact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
              </motion.a>
              <motion.a
                href={kopmaData.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </motion.a>
              <motion.a
                href={kopmaData.contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </motion.a>
              <motion.a
                href={kopmaData.contact.youtube}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -5 }}
                className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center transition-colors"
              >
                <Youtube className="w-6 h-6" />
              </motion.a>
            </div>
            <p className="text-gray-400 text-sm mt-6 leading-relaxed">
              Bergabunglah dengan komunitas KOPMA UNNES dan ikuti perkembangan terbaru kami.
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            Copyright © {currentYear} KOPMA UNNES. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Kami Ada Karena Anda
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
