import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import newDawnLogo from '../assets/new-dawn-logo.jpg';
import { firstLetter, safeSlug, safeText } from '../utils/content';
import StorefrontLegalModal from './StorefrontLegalModal';

const Footer = ({ farm }) => {
  const [legalView, setLegalView] = useState(null);
  const contact = farm?.contact_info || {};
  const farmName = safeText(farm?.name, 'The New Dawn Poultry Farm');
  const farmSlug = safeSlug(farm?.slug, 'new-dawn');
  const siteTitle = safeText(farm?.site_title, 'Fresh poultry, eggs, and practical farm supply for local customers.');
  const email = safeText(contact.email);
  const phone = safeText(contact.phone);
  const whatsapp = safeText(contact.whatsapp, phone);
  const displayLogo = safeText(farm?.logo_url) || (farmSlug === 'new-dawn' ? newDawnLogo : '');
  
  return (
    <>
      <footer className="bg-[#7f1d1d] text-[#fff4f4] pt-20 pb-10">
        <div className="container mx-auto px-[5%] max-w-[1200px]">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16">
          {/* Brand Info */}
          <div className="max-w-[480px]">
          <div className="flex items-center gap-4 mb-6">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt={`${farmName} logo`}
                  className="h-16 w-16 rounded-2xl bg-white object-contain p-1.5 border border-white/10 shadow-lg"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-[#c2410c] text-white flex items-center justify-center font-black text-2xl border border-white/10 shadow-lg">
                  {firstLetter(farmName)}
                </div>
              )}
              <h3 className="text-2xl font-black">{farmName}</h3>
            </div>
            <p className="text-[#f6d7d7] text-lg leading-relaxed mb-8">
              {siteTitle}
            </p>
            <div className="flex gap-4">
              {email && (
              <a 
                href={`mailto:${email}`} 
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#b91c1c] transition-all"
              >
                <Mail size={20} />
              </a>
              )}
              {phone && (
              <a 
                href={`tel:${phone}`} 
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#b91c1c] transition-all"
              >
                <Phone size={20} />
              </a>
              )}
            </div>
          </div>

          {/* Practical Contact Info */}
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">Quick Navigation</h4>
              <ul className="space-y-4">
                <li><Link to={`/${farmSlug}`} className="text-[#f6d7d7] hover:text-white transition-colors">Our Farm Home</Link></li>
                <li><Link to={`/${farmSlug}/products`} className="text-[#f6d7d7] hover:text-white transition-colors">Fresh Products</Link></li>
                <li><Link to={`/${farmSlug}/services`} className="text-[#f6d7d7] hover:text-white transition-colors">Farm Services</Link></li>
                <li><Link to={`/${farmSlug}/gallery`} className="text-[#f6d7d7] hover:text-white transition-colors">Gallery</Link></li>
                <li><Link to={`/${farmSlug}/about`} className="text-[#f6d7d7] hover:text-white transition-colors">About the Farm</Link></li>
                <li><Link to={`/${farmSlug}/contact`} className="text-[#f6d7d7] hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-8">Visit & Contact</h4>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <MapPin size={22} className="text-[#d6c27c] flex-shrink-0" />
                  <p className="text-[#f6d7d7]">{safeText(contact.address, 'Polokwane, Limpopo, SA')}</p>
                </div>
                <div className="flex gap-4 items-start">
                  <Clock size={22} className="text-[#d6c27c] flex-shrink-0" />
                  <div className="text-[#f6d7d7]">
                    <p className="font-bold text-white">Business Hours:</p>
                    <p>{safeText(contact.operating_hours, 'Monday to Saturday')}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <MessageCircle size={22} className="text-[#fecaca] flex-shrink-0" />
                  <div className="text-[#f6d7d7]">
                    <p className="font-bold text-white">WhatsApp Order:</p>
                    <p>{whatsapp}</p>
                  </div>
                </div>
                {email && (
                  <div className="flex gap-4 items-start">
                    <Mail size={22} className="text-[#d6c27c] flex-shrink-0" />
                    <div className="text-[#f6d7d7]">
                      <p className="font-bold text-white">Email:</p>
                      <p>{email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[#f0c8c8] text-sm tracking-wide">
          <p>&copy; {new Date().getFullYear()} {farmName}. Freshness Guaranteed.</p>
          <div className="flex gap-8">
            <button type="button" onClick={() => setLegalView('terms')} className="hover:text-white">Terms & Conditions</button>
            <button type="button" onClick={() => setLegalView('privacy')} className="hover:text-white">Privacy Policy</button>
          </div>
        </div>
        </div>
      </footer>

      {legalView === 'terms' && (
        <StorefrontLegalModal title="Terms & Conditions" businessName={farmName} onClose={() => setLegalView(null)}>
          <p><strong>{farmName}</strong> manages the products, pricing, availability, order fulfilment, delivery promises, and customer service shown on this storefront.</p>
          <p className="mt-4">Orders placed through this site are treated as requests until the farm confirms stock, collection timing, or delivery details. Bulk or quote-based listings may require direct confirmation before payment or dispatch.</p>
          <p className="mt-4">Customers should provide accurate contact, order, and delivery details. Incorrect details may delay fulfilment or require the farm to contact the customer again before processing.</p>
          <p className="mt-4">Delivery areas, delivery times, payment handling, substitutions, and cancellation decisions remain subject to the farm’s operating rules and product availability.</p>
          <p className="mt-4">Poultry Central provides the software storefront and admin tools, but product responsibility and day-to-day trade remain with {farmName}.</p>
        </StorefrontLegalModal>
      )}

      {legalView === 'privacy' && (
        <StorefrontLegalModal title="Privacy Policy" businessName={farmName} onClose={() => setLegalView(null)}>
          <p><strong>{farmName}</strong> collects customer information needed to respond to enquiries, process orders, arrange collection or delivery, and provide support.</p>
          <p className="mt-4">This may include customer names, phone numbers, email addresses, delivery details, and order notes submitted through the storefront.</p>
          <p className="mt-4">Poultry Central and Kasi Business Hub power the storefront platform and may process this information as a technology provider so the site and order tools can function correctly.</p>
          <p className="mt-4">Customer information should only be used for legitimate business communication, order processing, and service follow-up. It should not be sold or misused for unrelated marketing.</p>
          <p className="mt-4">If a customer wants their submitted information corrected or removed, they should contact {farmName} directly using the contact details shown on this storefront.</p>
        </StorefrontLegalModal>
      )}
    </>
  );
};

export default Footer;

