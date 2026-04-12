import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from 'lucide-react';

const Contact = () => {
  const { farm } = useOutletContext();
  const contact = farm.contact_info || {};

  return (
    <div className="pt-24 pb-20">
      <section className="bg-primary py-20 text-white text-center">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-secondary opacity-80 max-w-2xl mx-auto text-lg">
            Have questions about our stock or services? Get in touch with the team at The New Dawn Poultry Farm.
          </p>
        </div>
      </section>

      <section className="section container">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-1 space-y-8">
            <h2 className="text-3xl font-bold text-primary">Get In Touch</h2>
            <p className="text-gray-500">We appreciate your interest in our farm. Reach out to us via any of these channels or fill out the form.</p>
            
            <div className="space-y-6">
              <div className="flex gap-4 p-6 bg-secondary bg-opacity-20 rounded-2xl">
                <div className="p-3 bg-primary text-secondary rounded-xl">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-bold text-primary">Our Farm</p>
                  <p className="text-gray-600">{contact.address || '123 Farm Road, Polokwane, 0700'}</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-secondary bg-opacity-20 rounded-2xl">
                <div className="p-3 bg-primary text-secondary rounded-xl">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="font-bold text-primary">Call Us</p>
                  <p className="text-gray-600">{contact.phone || '+27 12 345 6789'}</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-secondary bg-opacity-20 rounded-2xl">
                <div className="p-3 bg-primary text-secondary rounded-xl">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="font-bold text-primary">Operating Hours</p>
                  <p className="text-gray-600">{contact.operating_hours || 'Mon-Sat: 08:00 - 17:00'}</p>
                </div>
              </div>
            </div>

            <a 
              href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}`}
              className="btn btn-whatsapp w-full py-4 text-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2" /> Message on WhatsApp
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-3xl shadow-xl border">
            <h3 className="text-2xl font-bold text-primary mb-8">Send a Message</h3>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary" placeholder="john@example.com" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <select className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option>General Inquiry</option>
                  <option>Bulk Quote Request</option>
                  <option>Delivery Question</option>
                  <option>Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea rows="5" className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-primary" placeholder="How can we help you?"></textarea>
              </div>

              <button className="btn btn-primary w-full py-4 text-lg">
                Send Message <Send size={20} className="ml-2" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="container mb-20 h-96 bg-gray-200 rounded-3xl overflow-hidden flex items-center justify-center relative">
        <div className="absolute inset-0 bg-primary opacity-10"></div>
        <div className="text-center relative z-10">
          <MapPin size={48} className="mx-auto text-primary mb-4" />
          <p className="text-xl font-bold text-primary">Google Maps Integration Coming Soon</p>
          <p className="text-gray-500">{contact.address || 'Polokwane, South Africa'}</p>
        </div>
      </section>
    </div>
  );
};

export default Contact;
