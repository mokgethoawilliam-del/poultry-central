import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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
    { name: 'Our Farm', path: `/${farm.slug}` },
    { name: 'Products', path: `/${farm.slug}/products` },
    { name: 'Farm Services', path: `/${farm.slug}/services` },
    { name: 'Contact', path: `/${farm.slug}/contact` },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-nav py-4 shadow-sm' : 'bg-transparent py-8'}`}>
      <div className="container flex items-center justify-between">
        <Link to={`/${farm.slug}`} className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary text-secondary shadow-lg group-hover:rotate-6 transition-transform">
            <span className="font-display ital font-bold text-2xl">N</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-display font-bold text-2xl tracking-tight leading-none ${isScrolled ? 'text-primary' : 'text-white'}`}>
              New Dawn
            </span>
            <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${isScrolled ? 'text-accent' : 'text-secondary'}`}>
              Poultry Farm
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm uppercase tracking-widest font-bold transition-all hover:text-accent relative group ${
                location.pathname === link.path 
                  ? 'text-accent' 
                  : (isScrolled ? 'text-primary' : 'text-white')
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full ${location.pathname === link.path ? 'w-full' : ''}`}></span>
            </Link>
          ))}
          <Link to={`/${farm.slug}/order`} className="btn btn-primary ml-4">
            Order Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden p-2 rounded-xl bg-primary text-secondary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 bg-primary z-[60] transition-transform duration-500 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-end p-8">
          <button className="p-2 text-secondary" onClick={() => setIsOpen(false)}>
            <X size={32} />
          </button>
        </div>
        <div className="flex flex-col items-center gap-8 mt-12">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-3xl font-display font-bold text-secondary hover:text-accent transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <Link 
            to={`/${farm.slug}/order`} 
            onClick={() => setIsOpen(false)} 
            className="btn bg-secondary text-primary mt-8 px-12 py-5 text-xl"
          >
            Order Now
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
