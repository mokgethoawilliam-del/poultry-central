import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Star, Truck, ShieldCheck, MapPin, ArrowRight, MessageCircle } from 'lucide-react';

const Services = () => {
  const { farm } = useOutletContext();
  const contact = farm.contact_info || {};

  const services = [
    {
      title: "Bulk Supply",
      icon: <Star size={32} />,
      desc: "For resellers, butcheries, and events — consistent quality poultry in large quantities.",
      btnText: "Request Bulk Quote"
    },
    {
      title: "Reliable Delivery",
      icon: <Truck size={32} />,
      desc: "Fast and safe delivery across Polokwane. Fresh products straight to your location.",
      btnText: "Check delivery areas"
    },
    {
      title: "Advance Booking",
      icon: <ShieldCheck size={32} />,
      desc: "Reserve your chickens or chicks in advance to avoid shortages and ensure stock for your needs.",
      btnText: "Book in advance"
    },
    {
      title: "Event Supply",
      icon: <MapPin size={32} />,
      desc: "Reliable poultry supply for weddings, funerals, and community events in the heart of Polokwane.",
      btnText: "Inquire for event"
    }
  ];

  return (
    <div className="pt-24 pb-20">
      <section className="bg-primary pt-32 pb-24 text-white text-center">
        <div className="container">
          <span className="uppercase tracking-[0.3em] font-bold text-accent mb-6 inline-block">Professional Support</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">Farm <span className="text-secondary italic">Services</span></h1>
          <p className="text-secondary opacity-80 max-w-3xl mx-auto text-xl leading-relaxed">
            We support local businesses, resellers, and community families with dedicated supply services designed for reliability and freshness.
          </p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10">
            {services.map((service, i) => (
              <div key={i} className="p-12 bg-secondary bg-organic border border-primary/5 rounded-[40px] group hover:border-accent transition-all">
                <div className="w-20 h-20 rounded-3xl bg-primary text-secondary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                <h3 className="text-3xl font-display font-bold mb-4 text-primary">{service.title}</h3>
                <p className="text-xl text-gray-500 mb-10 leading-relaxed font-medium">
                  {service.desc}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to={`/${farm.slug}/order?service=${service.title}`}
                    className="btn btn-primary text-sm px-8"
                  >
                    {service.btnText}
                  </Link>
                  <a 
                    href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in your ${service.title} service.`}
                    className="btn btn-whatsapp text-sm px-8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Enquire on WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="section bg-primary text-secondary overflow-hidden relative">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-display italic font-bold mb-10 leading-tight">
              "Consistency and quality are our top priorities. You can rely on our farm to support your business or event requirements."
            </h2>
            <div className="flex items-center justify-center gap-4">
              <span className="w-12 h-px bg-accent"></span>
              <p className="uppercase tracking-widest font-bold">The New Dawn Quality Promise</p>
              <span className="w-12 h-px bg-accent"></span>
            </div>
          </div>
        </div>
        {/* Abstract Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen bg-secondary opacity-[0.03] rounded-full blur-3xl"></div>
      </section>

      {/* Practical Info Grid */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-16">
            <div>
              <h3 className="text-2xl font-display font-bold text-primary mb-4">Location & Access</h3>
              <p className="text-gray-500 mb-6">Based in Polokwane, we offer both farm pickup and delivery options for all our services.</p>
              <Link to={`/${farm.slug}/contact`} className="text-primary font-bold flex items-center gap-2 group">
                Find our farm <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-primary mb-4">Service Reliability</h3>
              <p className="text-gray-500 mb-6">We maintain strict health and hygiene standards across all our supply chains and distribution services.</p>
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-primary mb-4">Direct Contact</h3>
              <p className="text-gray-500 mb-6">Speak directly to our farm manager for large bulk orders or special event scheduling.</p>
              <p className="font-bold text-primary">{contact.phone || '+27 12 345 6789'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
