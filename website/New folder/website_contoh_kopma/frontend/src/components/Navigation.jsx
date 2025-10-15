import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'BERANDA', href: '/' },
    { 
      name: 'TENTANG KAMI', 
      href: '/tentang',
      children: [
        { name: 'PROFIL', href: '/profil' },
        { name: 'STRUKTUR ORGANISASI', href: '/struktur' }
      ]
    },
    { name: 'KEANGGOTAAN', href: '/keanggotaan' },
    { name: 'ACARA', href: '/blog' },
    { name: 'INVENTARIS', href: '/inventaris' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src="/images/kopma-logo.png"
                alt="KOPMA UNNES"
                className="h-12 w-auto"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/48x48/10b981/ffffff?text=K';
                }}
              />
              <div className="hidden md:block">
                <div className={`font-bold text-lg transition-colors ${
                  scrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  KOPMA UNNES
                </div>
                <div className={`text-xs transition-colors ${
                  scrolled ? 'text-emerald-600' : 'text-emerald-200'
                }`}>
                  Kami Ada Karena Anda
                </div>
              </div>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Button
                    asChild
                    variant="ghost"
                    className={`transition-colors ${
                      scrolled
                        ? 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
                        : 'text-white hover:text-emerald-200 hover:bg-white/10'
                    }`}
                  >
                    <a href={item.href}>{item.name}</a>
                  </Button>
                  {item.children && (
                    <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[200px]">
                        {item.children.map((child) => (
                          <a
                            key={child.name}
                            href={child.href}
                            className="block px-4 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            {child.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Button
                asChild
                className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full"
              >
                <a href="https://berbagi.link/OPRECANGGOTA22" target="_blank" rel="noopener noreferrer">
                  Daftar Sekarang
                </a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden ${
                scrolled ? 'text-gray-900' : 'text-white'
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white shadow-2xl lg:hidden"
          >
            <div className="p-6 pt-24 space-y-4">
              {navItems.map((item) => (
                <div key={item.name}>
                  <a
                    href={item.href}
                    className="block py-3 text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                  {item.children && (
                    <div className="pl-4 space-y-2 mt-2">
                      {item.children.map((child) => (
                        <a
                          key={child.name}
                          href={child.href}
                          className="block py-2 text-gray-600 hover:text-emerald-600 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Button
                asChild
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full mt-6"
              >
                <a href="https://berbagi.link/OPRECANGGOTA22" target="_blank" rel="noopener noreferrer">
                  Daftar Sekarang
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
