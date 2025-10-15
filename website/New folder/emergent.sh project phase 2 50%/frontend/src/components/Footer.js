import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    tentang: [
      { name: 'Profil', path: '/profil' },
      { name: 'Struktur Organisasi', path: '/struktur-organisasi' },
      { name: 'Tentang Kami', path: '/tentang-kami' },
    ],
    layanan: [
      { name: 'Keanggotaan', path: '/keanggotaan' },
      { name: 'Unit Usaha', path: '/usaha-kopma-unnes' },
      { name: 'Inventaris', path: '/inventaris' },
    ],
    informasi: [
      { name: 'Acara', path: '/blog' },
      { name: 'Kewirausahaan', path: '/kewirausahaan' },
      { name: 'Laporan', path: '/laporan-perkembangan' },
    ],
  };

  const socialMedia = [
    { 
      name: 'Instagram', 
      icon: '📱',
      url: 'https://instagram.com/kopmaunnes',
      color: 'hover:text-pink-600'
    },
    { 
      name: 'Facebook', 
      icon: '👥',
      url: 'https://facebook.com/kopma.unnes',
      color: 'hover:text-blue-600'
    },
    { 
      name: 'YouTube', 
      icon: '🎥',
      url: 'https://youtube.com/channel/UCjuQc9sYsiox58hN3XFn3iQ',
      color: 'hover:text-red-600'
    },
    { 
      name: 'WhatsApp', 
      icon: '💬',
      url: 'http://wa.me/+6281227473357',
      color: 'hover:text-green-600'
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <div>
                <div className="font-bold text-xl">KOPMA UNNES</div>
                <div className="text-sm text-gray-300">Koperasi Mahasiswa</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Koperasi Mahasiswa Universitas Negeri Semarang didirikan pada 7 Mei 1982. 
              Kami hadir untuk memenuhi kebutuhan kesejahteraan mahasiswa.
            </p>
            <div className="flex space-x-3">
              {socialMedia.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`text-2xl ${social.color} transition-colors`}
                  title={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-bold text-lg mb-4">Tentang</h3>
            <ul className="space-y-2">
              {footerLinks.tentang.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Layanan</h3>
            <ul className="space-y-2">
              {footerLinks.layanan.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Informasi</h3>
            <ul className="space-y-2">
              {footerLinks.informasi.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-green-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-semibold mb-1">Alamat</div>
                <p className="text-sm text-gray-300">
                  Gedung Kewirausahaan UNNES<br />
                  Sekaran, Gunungpati, Semarang
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">📧</span>
              <div>
                <div className="font-semibold mb-1">Email</div>
                <a 
                  href="mailto:kopmaunnes@gmail.com"
                  className="text-sm text-gray-300 hover:text-green-400"
                >
                  kopmaunnes@gmail.com
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🌐</span>
              <div>
                <div className="font-semibold mb-1">Website</div>
                <a 
                  href="https://kopmaukmunnes.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-green-400"
                >
                  www.kopmaukmunnes.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black bg-opacity-50 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>
            Copyright © {currentYear} KOPMA UNNES. All rights reserved.
          </p>
          <p className="mt-1">
            Kami Ada Karena Anda 💚
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
