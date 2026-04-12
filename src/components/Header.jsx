import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, MessageCircle } from 'lucide-react';

const Header = ({ farm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: `/${farm.slug}` },
    { name: 'Products', path: `/${farm.slug}/products` },
    { name: 'Services', path: `/${farm.slug}/services` },
    { name: 'About', path: `/${farm.slug}/about` },
    { name: 'Contact', path: `/${farm.slug}/contact` },
  ];

  const brandColor = farm.branding?.primary_color || '#1b4332';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}>
      <div className="container flex items-center justify-between">
        <Link to={`/${farm.slug}`} className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-secondary">
            <span className="font-bold text-xl">N</span>
          </div>
          <span className={`font-display font-bold text-xl tracking-tight ${isScrolled ? 'text-primary' : 'text-white'}`}>
            {farm.name}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-semibold transition-colors hover:text-accent ${
                location.pathname === link.path 
                  ? 'text-accent' 
                  : (isScrolled ? 'text-primary' : 'text-white')
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link to={`/${farm.slug}/order`} className="btn btn-primary">
            Order Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} className={isScrolled ? 'text-primary' : 'text-white'} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t p-5 flex flex-col gap-4 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-lg font-semibold text-primary"
            >
              {link.name}
            </Link>
          ))}
          <Link to={`/${farm.slug}/order`} onClick={() => setIsOpen(false)} className="btn btn-primary w-full">
            Order Now
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
