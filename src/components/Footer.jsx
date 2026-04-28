import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import { firstLetter, safeSlug, safeText } from '../utils/content';

const Footer = ({ farm }) => {
  const contact = farm?.contact_info || {};
  const farmName = safeText(farm?.name, 'The New Dawn Poultry Farm');
  const farmSlug = safeSlug(farm?.slug, 'new-dawn');
  
  return (
    <footer className="bg-[#10261c] text-[#eaf1ed] pt-20 pb-10">
      <div className="container mx-auto px-[5%] max-w-[1200px]">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16">
          {/* Brand Info */}
          <div className="max-w-[480px]">
          <div className="flex items-center gap-4 mb-6">
              {farm?.logo_url ? (
                <img
                  src={farm.logo_url}
                  alt={`${farmName} logo`}
                  className="w-12 h-12 rounded-full object-cover border border-white/10 shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#1d4d35] text-white flex items-center justify-center font-black text-xl border border-white/10 shadow-lg">
                  {firstLetter(farmName)}
                </div>
              )}
              <h3 className="text-2xl font-black">{farmName}</h3>
            </div>
            <p className="text-[#b9c6bf] text-lg leading-relaxed mb-8">
              Premium, fresh poultry products and practical farm services for Polokwane and surrounding areas. Built on trust and quality.
            </p>
            <div className="flex gap-4">
              <a 
                href={`mailto:${contact.email || '#'}`} 
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1d4d35] transition-all"
              >
                <Mail size={20} />
              </a>
              <a 
                href={`tel:${contact.phone || '#'}`} 
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1d4d35] transition-all"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>

          {/* Practical Contact Info */}
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">Quick Navigation</h4>
              <ul className="space-y-4">
                <li><Link to={`/${farmSlug}`} className="text-[#b9c6bf] hover:text-white transition-colors">Our Farm Home</Link></li>
                <li><Link to={`/${farmSlug}/products`} className="text-[#b9c6bf] hover:text-white transition-colors">Fresh Products</Link></li>
                <li><Link to={`/${farmSlug}/services`} className="text-[#b9c6bf] hover:text-white transition-colors">Farm Services</Link></li>
                <li><Link to={`/${farmSlug}/gallery`} className="text-[#b9c6bf] hover:text-white transition-colors">Gallery</Link></li>
                <li><Link to={`/${farmSlug}/about`} className="text-[#b9c6bf] hover:text-white transition-colors">About the Farm</Link></li>
                <li><Link to={`/${farmSlug}/contact`} className="text-[#b9c6bf] hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">Visit & Contact</h4>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <MapPin size={22} className="text-[#d6c27c] flex-shrink-0" />
                  <p className="text-[#b9c6bf]">{safeText(contact.address, 'Polokwane, Limpopo, SA')}</p>
                </div>
                <div className="flex gap-4 items-start">
                  <Clock size={22} className="text-[#d6c27c] flex-shrink-0" />
                  <div className="text-[#b9c6bf]">
                    <p className="font-bold text-white">Business Hours:</p>
                    <p>{safeText(contact.operating_hours, 'Monday to Saturday')}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <MessageCircle size={22} className="text-[#28c76f] flex-shrink-0" />
                  <div className="text-[#b9c6bf]">
                    <p className="font-bold text-white">WhatsApp Order:</p>
                    <p>{safeText(contact.whatsapp, '015 004 0130')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[#b9c6bf] text-sm tracking-wide">
          <p>&copy; {new Date().getFullYear()} {farmName}. Freshness Guaranteed.</p>
          <div className="flex gap-8">
            <Link to="/admin" className="hover:text-white">Farmer Login</Link>
            <a href="#" className="hover:text-white">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
