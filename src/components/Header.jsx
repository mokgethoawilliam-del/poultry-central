import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, ShoppingCart } from 'lucide-react';
import newDawnLogo from '../assets/new-dawn-logo.jpg';
import { firstLetter, phoneDigits, safeSlug, safeText } from '../utils/content';
import { getCartCount } from '../utils/cart';

const Header = ({ farm }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const contact = farm?.contact_info || {};
  const farmName = safeText(farm?.name, 'New Dawn Poultry');
  const farmSlug = safeSlug(farm?.slug, 'new-dawn');
  const siteTitle = safeText(farm?.site_title, 'Fresh poultry, eggs, and farm supply');
  const displayLogo = safeText(farm?.logo_url) || (farmSlug === 'new-dawn' ? newDawnLogo : '');
  const isHomePage = location.pathname === `/${farmSlug}` || location.pathname === `/${farmSlug}/`;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!farm?.id) return;
    const syncCartCount = () => setCartCount(getCartCount(farm.id));
    syncCartCount();
    window.addEventListener('storage', syncCartCount);
    window.addEventListener('poultry-cart-updated', syncCartCount);
    return () => {
      window.removeEventListener('storage', syncCartCount);
      window.removeEventListener('poultry-cart-updated', syncCartCount);
    };
  }, [farm?.id]);

  const openWhatsApp = (message = "Hello, I would like to enquire about your poultry products.") => {
    window.open(
      `https://wa.me/${phoneDigits(contact.whatsapp || contact.phone)}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const navLinks = [
    { name: 'Home', path: `/${farmSlug}` },
    { name: 'Products', path: `/${farmSlug}/products` },
    { name: 'Farm Services', path: `/${farmSlug}/services` },
    { name: 'Gallery', path: `/${farmSlug}/gallery` },
    { name: 'About', path: `/${farmSlug}/about` },
    { name: 'Contact', path: `/${farmSlug}/contact` },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
      isScrolled ? 'bg-white/95 backdrop-blur-md py-3 shadow-sm border-[#e6dfd1]' : 'bg-transparent py-5 border-transparent'
    }`}>
      <div className="container mx-auto px-[5%] max-w-[1200px]">
        <div className="flex items-center justify-between gap-5">
          {/* Logo Section */}
          <Link to={`/${farmSlug}`} className="flex items-center gap-3 group">
            {displayLogo ? (
              <img
                src={displayLogo}
                alt={`${farmName} logo`}
                className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white object-contain p-1.5 border border-[#e6dfd1] shadow-lg group-hover:scale-105 transition-transform"
              />
            ) : (
                <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-[#c2410c] text-white flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                {firstLetter(farmName)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-[#183126] text-base md:text-lg leading-tight uppercase tracking-tight">
                {farmName}
              </span>
              <span className="text-[11px] md:text-xs text-[#6b756d] font-medium">
                {siteTitle}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.name === 'Home' && isHomePage ? (
                <a
                  key={link.name}
                  href="#home"
                  className="text-[15px] font-bold transition-all hover:text-[#c2410c] text-[#183126]"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-[15px] font-bold transition-all hover:text-[#c2410c] ${
                    location.pathname === link.path ? 'text-[#c2410c]' : 'text-[#183126]'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to={`/${farmSlug}/order`}
              className="relative hidden sm:flex h-12 w-12 items-center justify-center rounded-full border border-[#ead9d6] bg-white text-[#7f1d1d] shadow-sm transition-colors hover:bg-[#fff5f5]"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#b91c1c] px-1 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => openWhatsApp()}
              className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-full border border-[#d8d0c1] bg-white text-[#183126] font-bold text-sm hover:bg-[#fcfaf5] transition-colors"
            >
              WhatsApp Us
            </button>
            <Link
              to={`/${farmSlug}/order`}
              className="px-6 py-3 rounded-full bg-[#b91c1c] text-white font-extrabold text-sm hover:bg-[#991b1b] transition-all shadow-md active:scale-95"
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
                className="block text-lg font-bold text-[#183126] hover:text-[#c2410c] px-2"
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
            <Link
              to={`/${farmSlug}/order`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#b91c1c] py-4 text-base font-black text-white"
            >
              <ShoppingCart size={20} />
              Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

