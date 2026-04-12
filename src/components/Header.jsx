import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';

const Header = ({ farm }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const contact = farm?.contact_info || {};

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openWhatsApp = (message = "Hello, I would like to enquire about your poultry products.") => {
    const phone = contact.whatsapp || "27150040130"; 
    window.open(
      `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const navLinks = [
    { name: 'Home', path: `/${farm?.slug}` },
    { name: 'Products', path: `/${farm?.slug}/products` },
    { name: 'Farm Services', path: `/${farm?.slug}/services` },
    { name: 'Contact', path: `/${farm?.slug}/contact` },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      isScrolled ? 'bg-white/95 backdrop-blur-md py-3 shadow-sm border-[#e6dfd1]' : 'bg-transparent py-5 border-transparent'
    }`}>
      <div className="container mx-auto px-[5%] max-w-[1200px]">
        <div className="flex items-center justify-between gap-5">
          {/* Logo Section */}
          <Link to={`/${farm?.slug}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#1d4d35] text-white flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
              {farm?.name?.charAt(0) || 'N'}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[#183126] text-base md:text-lg leading-tight uppercase tracking-tight">
                {farm?.name || 'New Dawn Poultry'}
              </span>
              <span className="text-[11px] md:text-xs text-[#6b756d] font-medium">
                Fresh poultry in Polokwane
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path.startsWith('/') && link.path === `/${farm?.slug}` ? '#home' : link.path}
                className={`text-[15px] font-bold transition-all hover:text-[#1d4d35] ${
                  location.pathname === link.path ? 'text-[#1d4d35]' : 'text-[#183126]'
                }`}
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => openWhatsApp()}
              className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-full border border-[#d8d0c1] bg-white text-[#183126] font-bold text-sm hover:bg-[#fcfaf5] transition-colors"
            >
              WhatsApp Us
            </button>
            <Link
              to={`/${farm?.slug}/order`}
              className="px-6 py-3 rounded-full bg-[#1d4d35] text-white font-extrabold text-sm hover:bg-[#153a28] transition-all shadow-md active:scale-95"
            >
              Order Now
            </Link>
            
            {/* Mobile Menu Btn */}
            <button 
              className="lg:hidden p-2 text-[#183126] hover:bg-black/5 rounded-xl transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="lg:hidden py-6 animate-fadeIn space-y-4 border-t border-[#e6dfd1] mt-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="block text-lg font-bold text-[#183126] hover:text-[#1d4d35] px-2"
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => { openWhatsApp(); setMenuOpen(false); }}
              className="w-full text-center py-4 rounded-2xl bg-[#fcfaf5] border border-[#d8d0c1] font-bold text-[#183126]"
            >
              Message Us on WhatsApp
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
