import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from 'lucide-react';

const Footer = ({ farm }) => {
  const contact = farm.contact_info || {};
  
  return (
    <footer className="bg-charcoal text-white pt-16 pb-8">
      <div className="container grid grid-3 border-b border-gray-700 pb-12">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-display font-bold text-accent">{farm.name}</h3>
          <p className="text-gray-400 max-w-sm">
            Premium poultry and fresh supply from the heart of Polokwane. 
            Trusted by the local community for quality and reliability.
          </p>
          <div className="flex gap-4">
            <Facebook className="text-gray-400 hover:text-accent cursor-pointer" />
            <Instagram className="text-gray-400 hover:text-accent cursor-pointer" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-bold">Quick Links</h4>
          <ul className="flex flex-col gap-2 text-gray-400">
            <li><Link to={`/${farm.slug}/products`} className="hover:text-accent">Products</Link></li>
            <li><Link to={`/${farm.slug}/services`} className="hover:text-accent">Services</Link></li>
            <li><Link to={`/${farm.slug}/order`} className="hover:text-accent">Place Order</Link></li>
            <li><Link to={`/${farm.slug}/contact`} className="hover:text-accent">Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-bold">Visit Us</h4>
          <ul className="flex flex-col gap-3 text-gray-400">
            <li className="flex items-center gap-2"><MapPin size={18} className="text-accent" /> {contact.address || 'Polokwane, South Africa'}</li>
            <li className="flex items-center gap-2"><Phone size={18} className="text-accent" /> {contact.phone || '+27 12 345 6789'}</li>
            <li className="flex items-right gap-2"><MessageCircle size={18} className="text-[#25D366]" /> WhatsApp: {contact.whatsapp || '+27 12 345 6789'}</li>
            <li className="flex items-center gap-2"><Mail size={18} className="text-accent" /> info@newdawnfarm.co.za</li>
          </ul>
        </div>
      </div>
      
      <div className="container mt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} {farm.name}. All Rights Reserved. | 
        <Link to="/admin" className="ml-2 hover:text-white">Admin Login</Link>
      </div>
    </footer>
  );
};

export default Footer;
