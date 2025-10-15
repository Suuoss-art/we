import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'BERANDA', href: '/' },
    {
      name: 'TENTANG KAMI',
      href: '/tentang',
      children: [
        { name: 'PROFIL', href: '/tentang#profil' },
        { name: 'STRUKTUR ORGANISASI', href: '/struktur' }
      ]
    },
    { name: 'KEANGGOTAAN', href: '/keanggotaan' },
    { name: 'ACARA', href: '/blog' },
    { name: 'INVENTARIS', href: '/inventaris' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (itemName: string) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    } ${className}`}>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center space-x-3">
              <img
                src="/assets/images/kopma-unnes-logo.png"
                alt="KOPMA UNNES Logo"
                className="h-12 w-12 object-contain"
              />
              <div className="hidden sm:block">
                <div className="text-xl font-bold text-gray-900">KOPMA UNNES</div>
                <div className="text-xs text-gray-600">Koperasi Mahasiswa</div>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.children ? (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.name ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {activeDropdown === item.name && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          {item.children.map((child) => (
                            <a
                              key={child.name}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {child.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <a
              href="/keanggotaan"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Daftar Sekarang!
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className="flex items-center justify-between w-full text-left text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === item.name ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {activeDropdown === item.name && (
                        <div className="pl-4 space-y-1">
                          {item.children.map((child) => (
                            <a
                              key={child.name}
                              href={child.href}
                              className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                            >
                              {child.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                <a
                  href="/keanggotaan"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Daftar Sekarang!
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
