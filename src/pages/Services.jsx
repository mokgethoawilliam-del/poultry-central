import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Truck, Package, Calendar, Users, Briefcase, ArrowRight } from 'lucide-react';

const Services = () => {
  const { farm } = useOutletContext();

  const services = [
    {
      title: "Bulk Supply",
      icon: <Package size={32} />,
      desc: "Wholesale pricing for resellers, butcheries, and catering services. We offer consistent supply of quality birds and eggs.",
      btnText: "Request Quote"
    },
    {
      title: "Reliable Delivery",
      icon: <Truck size={32} />,
      desc: "Fast and safe delivery across Polokwane and surrounding areas. We ensure the birds arrive stressed-free and fresh.",
      btnText: "Check Areas"
    },
    {
      title: "Advance Bookings",
      icon: <Calendar size={32} />,
      desc: "Book your slaughter days or day-old chicks in advance to secure your stock for big events or festive seasons.",
      btnText: "Book Now"
    },
    {
      title: "Event Supply",
      icon: <Users size={32} />,
      desc: "Special catering for weddings, funerals, and large community gatherings. We handle the supply so you can focus on the event.",
      btnText: "Get Quote"
    },
    {
      title: "Poultry Consultation",
      icon: <Briefcase size={32} />,
      desc: "Thinking of starting your own poultry farm? We offer expert advice on housing, feeding, and health management.",
      btnText: "Inquire Now"
    }
  ];

  return (
    <div className="pt-24 pb-20">
      <section className="bg-primary py-20 text-white text-center">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-secondary opacity-80 max-w-2xl mx-auto text-lg">
            Beyond quality supply, we provide professional services to support our community and local businesses in Polokwane.
          </p>
        </div>
      </section>

      <section className="section container">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div key={i} className="p-10 border rounded-3xl hover:border-primary transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-secondary bg-opacity-30 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-secondary transition-all">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                {service.desc}
              </p>
              <Link 
                to={`/${farm.slug}/order`}
                className="text-primary font-bold flex items-center gap-2 group-hover:gap-4 transition-all"
              >
                {service.btnText} <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container mb-20">
        <div className="bg-secondary bg-opacity-20 rounded-3xl p-10 md:p-20 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Need a custom solution?</h2>
          <p className="text-gray-600 max-w-2xl mb-10 text-lg">
            Every business and event is unique. Talk to us about your specific requirements, and we'll create a tailored supply plan for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href={`https://wa.me/${farm.contact_info?.whatsapp?.replace(/[^0-9]/g, '')}`}
              className="btn btn-whatsapp px-10 py-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Consult via WhatsApp
            </a>
            <Link to={`/${farm.slug}/contact`} className="btn btn-outline px-10 py-4">
              Visit the Farm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
