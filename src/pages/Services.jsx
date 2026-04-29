import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  BarChart3, 
  Truck, 
  Calendar, 
  Users, 
  ArrowRight, 
  CheckCircle2,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { phoneDigits, safeSlug, safeText } from '../utils/content';
import { supabase } from '../services/supabase';

const Services = () => {
  const { farm } = useOutletContext();
  const contact = farm.contact_info || {};
  const farmSlug = safeSlug(farm.slug, 'new-dawn');
  const farmName = safeText(farm?.name, 'the farm');
  const [cmsServices, setCmsServices] = useState([]);

  const fallbackServices = [
    {
      title: 'Bulk Supply & Wholesale',
      desc: 'Consistent poultry supply for butcheries, retailers, and local businesses in Polokwane. We offer tiered pricing for bulk buyers.',
      icon: <BarChart3 className="w-8 h-8" />,
      features: ['Reliable volume', 'Competitive pricing', 'Priority scheduling']
    },
    {
      title: 'Local Delivery Service',
      desc: 'Direct farm-to-door delivery across Polokwane and surrounding areas. Our specialized transport ensures your order stays fresh.',
      icon: <Truck className="w-8 h-8" />,
      features: ['Home delivery', 'Scheduled routes', 'Careful handling']
    },
    {
      title: 'Advance Stock Booking',
      desc: 'Reserve your chickens or day-old chicks months in advance to ensure supply for your farm or event during peak seasons.',
      icon: <Calendar className="w-8 h-8" />,
      features: ['Guaranteed availability', 'Small deposit required', 'Flexible pickup']
    },
    {
      title: 'Community Event Supply',
      desc: 'Bulk supply for weddings, funerals, and community gatherings. We understand the local needs and provide timely delivery.',
      icon: <Users className="w-8 h-8" />,
      features: ['On-site delivery', 'Custom packaging', 'Bulk broiler specials']
    }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      if (!farm?.id) return;
      const { data, error } = await supabase
        .from('farm_services')
        .select('*')
        .eq('farm_id', farm.id)
        .eq('is_active', true)
        .order('order_index');

      if (!error) setCmsServices(data || []);
    };

    fetchServices();
  }, [farm?.id]);

  const serviceNames = cmsServices.length > 0
    ? cmsServices.map(service => safeText(service.title)).filter(Boolean)
    : [];

  const openWhatsApp = (service) => {
    const msg = `Hi ${farmName}, I'm interested in your ${service} service.`;
    window.open(`https://wa.me/${phoneDigits(contact.whatsapp || contact.phone)}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="pt-24 bg-[#fcfaf5] min-h-screen">
      {/* Hero Header */}
      <section className="bg-[#b91c1c] pt-32 pb-24 text-white relative overflow-hidden">
        <div className="container mx-auto px-[5%] max-w-[1200px] relative z-10">
          <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-6 inline-block text-sm italic">Our Farm Support</span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">Farm <span className="text-[#fcfaf5] italic">Services</span></h1>
          <p className="text-[#d3ddd7] max-w-2xl text-xl leading-relaxed font-medium">
             We do more than sell poultry. We help customers, resellers, and
             communities get the supply they need in a simple, reliable way.
          </p>
        </div>
        <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
      </section>

      <div className="container mx-auto px-[5%] max-w-[1200px] py-24">
        {serviceNames.length > 0 ? (
          <div className="bg-white border border-[#e6dfd1] rounded-[32px] p-8 md:p-12 shadow-sm mb-32">
            <h2 className="text-3xl md:text-5xl font-black text-[#183126] mb-8 tracking-tight">Available Services</h2>
            <ul className="grid md:grid-cols-2 gap-5">
              {serviceNames.map((service) => (
                <li key={service} className="flex items-center gap-4 text-xl font-black text-[#183126]">
                  <CheckCircle2 size={24} className="text-[#b91c1c] flex-shrink-0" />
                  {service}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-10 mb-32">
            {fallbackServices.map((service, index) => (
              <div key={index} className="bg-white p-10 md:p-14 rounded-[40px] shadow-sm border border-[#e6dfd1] hover:shadow-2xl hover:border-[#b91c1c] transition-all group relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#fcfaf5] border border-[#e6dfd1] text-[#b91c1c] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:bg-[#b91c1c] group-hover:text-white transition-all">
                    {service.icon}
                  </div>
                  <h3 className="text-3xl font-black text-[#183126] mb-6 tracking-tight uppercase">{service.title}</h3>
                  <p className="text-[#5f6c65] text-lg leading-relaxed mb-10 font-medium">
                    {service.desc}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {service.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-[#183126] font-black text-sm uppercase tracking-wide">
                        <CheckCircle2 size={18} className="text-[#d6c27c] flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => openWhatsApp(service.title)}
                    className="w-full sm:w-auto px-10 py-5 bg-[#b91c1c] text-white font-black rounded-full shadow-lg hover:bg-[#991b1b] flex items-center justify-center gap-2 transition-all"
                  >
                    Enquire Now <ArrowRight size={18} />
                  </button>
                </div>
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#b91c1c] opacity-[0.02] rounded-full pointer-events-none group-hover:opacity-5 transition-all"></div>
              </div>
            ))}
          </div>
        )}

        {/* Support Section */}
        <div className="bg-[#7f1d1d] p-12 md:p-24 rounded-[60px] text-white shadow-2xl relative overflow-hidden">
           <div className="grid lg:grid-cols-2 gap-16 relative z-10">
             <div>
                <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-6 inline-block text-sm italic">Still have questions?</span>
                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">Practical assistance for Polokwane locals</h2>
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[#d6c27c] shadow-lg flex-shrink-0">
                         <HelpCircle size={22} />
                      </div>
                      <p className="text-lg text-[#d3ddd7] leading-relaxed">
                         Don't see the service you need? Contact us directly. We are always open to supporting local farmers and community projects.
                      </p>
                   </div>
                </div>
             </div>
             <div className="flex flex-col justify-center gap-6">
                <a 
                   href={`https://wa.me/${phoneDigits(contact.whatsapp || contact.phone)}?text=Hi, I have a special service enquiry.`}
                   className="px-12 py-5 bg-[#b91c1c] text-white font-black text-xl rounded-full shadow-lg hover:bg-[#991b1b] transition-all flex items-center justify-center gap-3 text-center"
                   target="_blank"
                   rel="noopener noreferrer"
                >
                   <MessageCircle size={24} /> Message us on WhatsApp
                </a>
                <Link 
                   to={`/${farmSlug}/contact`}
                   className="px-12 py-5 bg-white text-[#183126] font-black text-xl rounded-full shadow-xl hover:bg-gray-50 transition-all text-center"
                >
                   Contact Farm Team
                </Link>
             </div>
           </div>
           <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default Services;

