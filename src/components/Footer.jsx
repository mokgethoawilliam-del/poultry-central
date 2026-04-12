import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Globe, Share2, MessageCircle, Clock } from 'lucide-react';

const Footer = ({ farm }) => {
  const contact = farm.contact_info || {};
  
  return (
    <footer className="bg-primary text-secondary pt-24 pb-12">
      <div className="container">
        <div className="grid lg:grid-cols-4 gap-16 mb-20">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to={`/${farm.slug}`} className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary text-primary shadow-lg">
                <span className="font-display ital font-bold text-2xl">N</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-2xl tracking-tight leading-none text-white">
                  New Dawn
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent">
                  Poultry Farm
                </span>
              </div>
            </Link>
            <p className="opacity-70 leading-relaxed mb-8">
              Premium, organic poultry products from the heart of Polokwane. We believe in quality, care, and the freshness of farm-to-table supply.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-12 h-12 rounded-full border border-secondary/20 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
                <Share2 size={20} />
              </a>
              <a href="#" className="w-12 h-12 rounded-full border border-secondary/20 flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
                <Globe size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-xl text-white mb-8">Navigation</h4>
            <ul className="space-y-4 opacity-80 decoration-none list-none uppercase tracking-widest text-[11px] font-bold">
              <li><Link to={`/${farm.slug}`} className="hover:text-accent">Our Farm</Link></li>
              <li><Link to={`/${farm.slug}/products`} className="hover:text-accent">Products</Link></li>
              <li><Link to={`/${farm.slug}/services`} className="hover:text-accent">Farm Services</Link></li>
              <li><Link to={`/${farm.slug}/order`} className="hover:text-accent">Place Order</Link></li>
              <li><Link to={`/${farm.slug}/contact`} className="hover:text-accent">Contact</Link></li>
            </ul>
          </div>

          {/* Practical Info */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-bold text-xl text-white mb-8">Visit the Farm</h4>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="text-accent flex-shrink-0" size={24} />
                  <p className="opacity-80 leading-relaxed">
                    {contact.address || '123 Farm Road, Polokwane, 0700'}
                  </p>
                </div>
                <div className="flex gap-4">
                  <Phone className="text-accent flex-shrink-0" size={24} />
                  <p className="opacity-80 font-bold">
                    {contact.phone || '+27 12 345 6789'}
                  </p>
                </div>
                <div className="flex gap-4">
                  <MessageCircle className="text-[#25D366] flex-shrink-0" size={24} />
                  <p className="opacity-80 font-bold">
                    WhatsApp: {contact.whatsapp || '+27 12 345 6789'}
                  </p>
                </div>
              </div>
              <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="text-accent" size={20} />
                  <h5 className="font-bold text-white uppercase tracking-widest text-xs">Operating Hours</h5>
                </div>
                <p className="opacity-80 text-sm leading-relaxed whitespace-pre-line">
                  {contact.operating_hours || 'Mon-Sat: 08:00 - 17:00\nClosed on Sundays'}
                </p>
                <Link to={`/${farm.slug}/order`} className="mt-8 block text-accent font-bold text-sm uppercase tracking-widest hover:underline">
                  Book Farm Visit &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-secondary/40">
          <p>&copy; {new Date().getFullYear()} The New Dawn Poultry Farm. All Rights Reserved.</p>
          <div className="flex gap-8">
            <Link to="/admin" className="hover:text-white transition-colors">Farmer Login</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
