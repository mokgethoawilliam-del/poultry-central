import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Clock, Send, ShieldCheck, ArrowRight } from 'lucide-react';

const Contact = () => {
  const { farm } = useOutletContext();
  const contact = farm.contact_info || {};

  return (
    <div className="pt-24 bg-white">
      {/* Header */}
      <section className="bg-primary pt-32 pb-24 text-white text-center relative overflow-hidden">
        <div className="container relative z-10">
          <span className="uppercase tracking-[0.3em] font-bold text-accent mb-6 inline-block">Connect With the Farm</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">Contact <span className="text-secondary italic">Us</span></h1>
          <p className="text-secondary opacity-80 max-w-3xl mx-auto text-xl leading-relaxed">
            Have questions about our poultry stock, services, or farm visits? Reach out to our team in Polokwane directly.
          </p>
        </div>
        <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Contact Form */}
            <div className="bg-secondary bg-organic p-10 md:p-16 rounded-[60px] border border-primary/5">
              <h2 className="text-4xl font-display font-bold text-primary mb-8">Send a Message</h2>
              <form className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Full Name</label>
                    <input type="text" className="w-full bg-white px-6 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-accent border-none shadow-sm" placeholder="Your Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Phone Number</label>
                    <input type="tel" className="w-full bg-white px-6 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-accent border-none shadow-sm" placeholder="012 345 6789" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Inquiry Type</label>
                  <select className="w-full bg-white px-6 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-accent border-none shadow-sm appearance-none">
                    <option>General Inquiry</option>
                    <option>Bulk Quote Request</option>
                    <option>Day-Old Chick Booking</option>
                    <option>Farm Visit Schedule</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Your Message</label>
                  <textarea rows="5" className="w-full bg-white px-6 py-4 rounded-3xl outline-none focus:ring-2 focus:ring-accent border-none shadow-sm resize-none" placeholder="Tell us how we can help..."></textarea>
                </div>
                <button className="btn btn-primary w-full py-5 text-lg shadow-xl">
                  Send Your Inquiry <Send size={20} />
                </button>
              </form>
            </div>

            {/* Info & Map Column */}
            <div className="flex flex-col justify-center">
              <div className="space-y-12 mb-12">
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-primary mb-1">Our Location</h3>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed">
                      {contact.address || '123 Farm Road, Polokwane, 0700'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center text-primary flex-shrink-0">
                    <Phone size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-primary mb-1">Call Us</h3>
                    <p className="text-lg text-gray-500 font-bold leading-relaxed">
                      {contact.phone || '+27 12 345 6789'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center text-primary flex-shrink-0">
                    <Clock size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-primary mb-1">Operating Hours</h3>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed whitespace-pre-line">
                      {contact.operating_hours || 'Mon-Sat: 08:00 - 17:00\nClosed on Sundays'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="aspect-video w-full bg-secondary bg-organic rounded-[60px] relative overflow-hidden flex items-center justify-center border border-primary/5">
                <div className="text-center relative z-10 p-10">
                  <MapPin size={48} className="mx-auto text-accent mb-4" />
                  <p className="text-xl font-display font-bold text-primary mb-2">Live Map Coming Soon</p>
                  <p className="text-gray-500 text-sm">Polokwane, Limpopo Province</p>
                </div>
                <div className="absolute inset-0 bg-primary opacity-[0.03]"></div>
              </div>

              <a 
                href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}`}
                className="btn btn-whatsapp w-full py-5 text-lg mt-12 shadow-xl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={24} className="mr-2" /> Message on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="container mb-32">
        <div className="bg-primary p-12 md:p-24 rounded-[60px] text-secondary text-center">
          <ShieldCheck size={64} className="mx-auto text-accent mb-8" />
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Our Quality Promise</h2>
          <p className="text-xl opacity-80 max-w-3xl mx-auto leading-relaxed mb-12">
            Every product that leaves our farm is inspected for quality and freshness. We take pride in our bio-security standards and ethical farming practices.
          </p>
          <Link to={`/${farm.slug}/order`} className="btn bg-secondary text-primary font-bold px-12 py-5 shadow-2xl">
            Start Your Fresh Order Today <ArrowRight size={20} className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Contact;
