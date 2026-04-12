import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  Check, 
  ArrowRight, 
  Truck, 
  MapPin, 
  Star, 
  Heart, 
  ShieldCheck, 
  MessageCircle,
  Clock,
  Instagram,
  Facebook
} from 'lucide-react';

// Custom assets
import heroImg from '../assets/premium_farm_hero_1776000531649.png';
import eggsImg from '../assets/fresh_organic_eggs_1776000562761.png';
import chickensImg from '../assets/healthy_broiler_poultry_1776000591785.png';

const Home = () => {
  const { farm } = useOutletContext();
  const contact = farm.contact_info || {};

  const products = [
    {
      title: 'Live Chickens',
      category: 'Broilers & Layers',
      desc: 'Healthy, farm-raised birds ready for your coop or kitchen. Natural diet and plenty of care.',
      img: chickensImg,
      badge: 'Locally Raised'
    },
    {
      title: 'Fresh Eggs',
      category: 'Daily Harvest',
      desc: 'Crisp, fresh eggs harvested daily. Large sized and naturally produced for the best taste.',
      img: eggsImg,
      badge: 'Fresh Daily'
    },
    {
      title: 'Day-Old Chicks',
      category: 'Premium Stock',
      desc: 'Start your own journey with our grade-A day-old chicks. Strong, healthy, and high-yielding.',
      img: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&q=80&w=800',
      badge: 'Best Sellers'
    },
    {
      title: 'Slaughtered Chicken',
      category: 'Cleaned & Ready',
      desc: 'Cleaned, dressed, and ready for your recipes. Farm freshness delivered straight to you.',
      img: 'https://images.unsplash.com/photo-1587593817658-2930d8f072fd?auto=format&fit=crop&q=80&w=800',
      badge: 'Popular Choice'
    }
  ];

  const services = [
    { title: "Bulk Supply", desc: "For resellers, butcheries, and events — consistent quality poultry in large quantities.", icon: <Star /> },
    { title: "Delivery", desc: "Fast and safe delivery across Polokwane. Fresh products straight to your location.", icon: <Truck /> },
    { title: "Advance Booking", desc: "Reserve your chickens or chicks in advance to avoid shortages.", icon: <ShieldCheck /> },
    { title: "Event Supply", desc: "Reliable poultry supply for weddings, funerals, and community events.", icon: <MapPin /> }
  ];

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="The New Dawn Farm" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent"></div>
        </div>

        <div className="container relative z-10 text-white">
          <div className="max-w-3xl fade-in">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-px bg-accent"></span>
              <span className="uppercase tracking-[0.3em] font-bold text-sm text-secondary">A Premium Polokwane Farm</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-bold mb-8 leading-[1.1]">
              Fresh Poultry. Trusted Farm. <br />
              <span className="text-accent italic">Delivered to You.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl font-medium text-secondary">
              Quality chickens, eggs, and poultry services in Polokwane. From our pastures to your plate.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link to={`/${farm.slug}/order`} className="btn btn-primary px-12 py-5 text-xl shadow-2xl w-full sm:w-auto">
                Order Now <ArrowRight size={20} />
              </Link>
              <a 
                href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}`}
                className="btn bg-secondary text-primary px-12 py-5 text-xl border-none shadow-xl w-full sm:w-auto hover:bg-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Us <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-secondary bg-organic py-16 border-y border-primary/5">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[ 
              { label: 'Locally Raised', value: 'Polokwane, LP' },
              { label: 'Fresh Daily', value: 'Handpicked Every AM' },
              { label: 'Bulk Orders', value: 'B2B & Event Pricing' },
              { label: 'Reliable Delivery', value: 'Farm to Doorstep' }
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <p className="uppercase tracking-widest text-[11px] font-bold text-accent mb-2">{item.label}</p>
                <p className="text-lg md:text-xl font-display font-bold text-primary group-hover:text-brown transition-colors">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Section: "From Our Farm to Your Table" */}
      <section className="section bg-white overflow-hidden">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=1000" 
                  alt="Farm Story" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Accents */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent/10 rounded-full -z-10"></div>
              <div className="absolute top-1/2 -left-10 bg-primary p-10 rounded-3xl shadow-xl text-secondary max-w-xs -translate-y-1/2 hidden md:block">
                <p className="font-display italic text-2xl mb-4">"We don't just sell poultry; we raise them with care and respect."</p>
                <p className="text-sm uppercase tracking-tighter opacity-70">— Our Quality Promise</p>
              </div>
            </div>
            <div>
              <span className="uppercase tracking-[0.2em] font-extrabold text-accent mb-6 inline-block">Our Story</span>
              <h2 className="section-title text-left mb-8">From Our Farm <br /> <span className="text-brown">to Your Table</span></h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  At <strong>The New Dawn Poultry Farm</strong>, we believe that real taste comes from real care. Based in the heart of Polokwane, our daily focus is providing the freshest, healthiest poultry products to our community.
                </p>
                <p>
                  Every bird is raised with ample space, high-quality feed, and consistent health monitoring. When you choose us, you're not just buying food; you're supporting a local farm that puts trust and quality first.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center"><Heart /></div>
                  <p className="font-bold text-primary">Certified Quality</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center"><ShieldCheck /></div>
                  <p className="font-bold text-primary">Local & Fresh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fresh Stock Section: Products Over Services */}
      <section className="section bg-secondary bg-organic">
        <div className="container text-center">
          <span className="uppercase tracking-[0.2em] font-extrabold text-accent mb-6 inline-block">Available Stock</span>
          <h2 className="section-title mb-16">Fresh Poultry <span className="italic">&</span> Farm Eggs</h2>
          <div className="grid-3">
            {products.map((p, i) => (
              <div key={i} className="card group bg-white border-primary/5">
                <div className="h-72 overflow-hidden relative">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-primary font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-full shadow-sm">
                      {p.badge}
                    </span>
                  </div>
                </div>
                <div className="p-8 text-left">
                  <span className="text-[10px] uppercase font-bold text-accent tracking-[0.3em] mb-2 block">{p.category}</span>
                  <h3 className="text-3xl font-display font-bold mb-4">{p.title}</h3>
                  <p className="text-gray-500 mb-8 leading-relaxed">
                    {p.desc}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <Link to={`/${farm.slug}/order?product=${p.title}`} className="btn btn-primary flex-grow text-sm py-4">
                      Order Now
                    </Link>
                    <a 
                      href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi, I'd like to order some ${p.title} from New Dawn.`}
                      className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-secondary transition-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={22} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Farm Services: Practical & Real */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-16 items-center">
            <div className="lg:col-span-1">
              <span className="uppercase tracking-[0.2em] font-extrabold text-accent mb-6 inline-block">Our Support</span>
              <h2 className="section-title text-left mb-8">Farm <br /> <span className="text-brown">Services</span></h2>
              <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                We support local businesses, resellers, and community families with dedicated supply services designed for reliability.
              </p>
              <Link to={`/${farm.slug}/services`} className="btn btn-outline">
                View All Services <ArrowRight size={20} />
              </Link>
            </div>
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
              {services.map((s, i) => (
                <div key={i} className="p-10 rounded-[32px] bg-secondary bg-opacity-30 border border-primary/5 hover:border-accent transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-primary text-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <h4 className="text-2xl font-display font-bold text-primary mb-3">{s.title}</h4>
                  <p className="text-gray-500 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Highlight */}
      <section className="section bg-primary text-secondary">
        <div className="container text-center">
          <span className="uppercase tracking-[0.2em] font-extrabold text-accent mb-6 inline-block">Authentic Farm Life</span>
          <h2 className="section-title text-white mb-16">Life at New Dawn</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden rounded-[40px]">
            <img src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=600" className="w-full h-80 object-cover" alt="Gallery" />
            <img src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=600" className="w-full h-80 object-cover mt-8" alt="Gallery" />
            <img src="https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&q=80&w=600" className="w-full h-80 object-cover" alt="Gallery" />
            <img src="https://images.unsplash.com/photo-1587593817658-2930d8f072fd?auto=format&fit=crop&q=80&w=600" className="w-full h-80 object-cover mt-8" alt="Gallery" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white overflow-hidden">
        <div className="container relative">
          <div className="text-center mb-20">
            <h2 className="section-title">Trusted in <span className="text-accent italic">Polokwane</span></h2>
          </div>
          <div className="grid-3">
            {[ 
              { quote: "Best poultry supplier in Polokwane. The birds are healthy and the delivery is always on point.", author: "Marcus M., Reseller" },
              { quote: "Always fresh and reliable. My family only buys eggs from New Dawn. Highly recommended!", author: "Selloane T., Local Resident" },
              { quote: "Superb service. They supplied my daughter's wedding and everything was perfect. Fresh from the farm!", author: "Mrs. Khumalo" }
            ].map((t, i) => (
              <div key={i} className="p-10 rounded-3xl bg-secondary bg-opacity-20 relative">
                <Star className="text-accent mb-6" fill="currentColor" size={24} />
                <p className="text-lg italic text-primary leading-relaxed mb-6">"{t.quote}"</p>
                <p className="font-bold text-primary font-display">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="section bg-primary relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-5 rounded-full blur-3xl -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary opacity-5 rounded-full blur-3xl translate-y-1/2"></div>
        
        <div className="container relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-8">Ready to Order?</h2>
          <p className="text-xl md:text-2xl text-secondary opacity-80 mb-12 max-w-2xl mx-auto">
            Experience the taste of real, farm-fresh poultry today. Get in touch for retail or bulk orders.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to={`/${farm.slug}/order`} className="btn bg-accent text-primary px-12 py-5 text-xl shadow-2xl">
              Start Your Order
            </Link>
            <a 
              href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi, I'm ready to place an order.`}
              className="btn btn-whatsapp px-12 py-5 text-xl shadow-xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Order on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
