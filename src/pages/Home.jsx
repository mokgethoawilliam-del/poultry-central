import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getFarmProducts, getFarmTestimonials } from '../services/supabase';
import { 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2, 
  Quote, 
  ChevronRight,
  TrendingUp,
  Award,
  ShieldCheck
} from 'lucide-react';

const Home = () => {
  const { farm } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const contact = farm?.contact_info || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodData, testData] = await Promise.all([
          getFarmProducts(farm.id),
          getFarmTestimonials(farm.id)
        ]);
        setProducts(prodData);
        setTestimonials(testData);
      } catch (err) {
        console.error("Home data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (farm?.id) fetchData();
  }, [farm?.id]);

  const openWhatsApp = (message = "Hello, I would like to enquire about your poultry products.") => {
    const phone = contact.whatsapp || "27150040130"; 
    window.open(
      `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const services = [
    {
      title: "Bulk Supply",
      text: "For resellers, butcheries, schools, events, and local businesses that need consistent poultry supply.",
    },
    {
      title: "Reliable Delivery",
      text: "Fast and careful delivery across Polokwane and nearby areas so your order arrives fresh and on time.",
    },
    {
      title: "Advance Bookings",
      text: "Reserve chickens, eggs, or chicks ahead of time to avoid shortages during busy periods.",
    },
    {
      title: "Event Supply",
      text: "Reliable poultry supply for weddings, funerals, church gatherings, and community events.",
    },
  ];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#fcfaf5]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d4d35]"></div>
    </div>
  );

  return (
    <div className="bg-[#fcfaf5] text-[#183126]">
      {/* Hero Section */}
      <section id="home" className="pt-32 pb-16 md:pt-48 md:pb-24">
        <div className="container mx-auto px-[5%] max-w-[1200px]">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <div className="inline-block bg-[#edf4ee] text-[#1d4d35] border border-[#d9e7dc] px-4 py-2 rounded-full font-bold text-sm mb-6">
                Trusted Local Poultry Supplier
              </div>
              <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
                {farm?.branding?.hero_headline || "Fresh Poultry. Trusted Farm. Delivered to You."}
              </h1>
              <p className="text-lg md:text-xl text-[#526259] mb-10 max-w-[600px] leading-relaxed">
                {farm?.name || "The New Dawn Poultry Farm"} supplies quality chickens, eggs, chicks,
                and poultry services in Polokwane. We serve families, resellers,
                local businesses, and community events with freshness and care.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <button
                  onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-5 rounded-full bg-[#1d4d35] text-white font-black text-base shadow-xl hover:bg-[#153a28] transition-all"
                >
                  View Products
                </button>
                <button
                  onClick={() => openWhatsApp("Hello, I want to place an order.")}
                  className="px-8 py-5 rounded-full bg-white border border-[#d8d0c1] text-[#183126] font-black text-base shadow-sm hover:bg-gray-50 transition-all"
                >
                  WhatsApp Order
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-[520px]">
                {['Locally Raised', 'Fresh Daily', 'Bulk Orders Available', 'Reliable Delivery'].map(badge => (
                  <div key={badge} className="bg-white border border-[#e4dccf] rounded-2xl p-4 font-bold text-[#294837] shadow-sm">
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80"
                  alt="Farm life"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent h-1/2"></div>
              </div>
              <div className="absolute left-6 bottom-6 right-6 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl max-w-[300px] border border-white/20">
                <p className="font-black text-[#183126] mb-2">From Our Farm to Your Table</p>
                <p className="text-[#5f6c65] text-sm leading-relaxed">
                  Fresh poultry products delivered with care and consistency across Polokwane.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Strip */}
      <section id="about" className="py-16 bg-[#fcfaf5]">
        <div className="container mx-auto px-[5%] max-w-[1200px]">
          <div className="bg-white border border-[#e6dfd1] rounded-[40px] p-8 md:p-16 grid lg:grid-cols-2 gap-12 items-center shadow-sm">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight tracking-tight">
                From Our Farm <br /><span className="text-[#8b6b2f] italic">to Your Table</span>
              </h2>
              <div className="space-y-6 text-[#5f6c65] text-lg leading-relaxed">
                <p>
                  At <strong>{farm?.name || "The New Dawn Poultry Farm"}</strong>, we believe good food starts with
                  trust, consistency, and proper care. Our goal is to serve
                  Polokwane with quality poultry products that people can rely on
                  for everyday meals, resale, and special events.
                </p>
                <p>
                  We are building a farm brand that feels close to the community:
                  fresh products, practical service, and simple ordering through
                  WhatsApp and direct enquiries.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80"
                alt="Chicks"
                className="w-full h-[400px] object-cover rounded-[32px] shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-24">
        <div className="container mx-auto px-[5%] max-w-[1200px]">
          <div className="text-center max-w-[800px] mx-auto mb-20">
            <span className="text-[#8b6b2f] font-black uppercase tracking-[0.2em] text-sm mb-4 block">Our Products</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Fresh poultry products for homes and businesses</h2>
            <p className="text-[#5f6c65] text-lg leading-relaxed">
              Whether you need a few birds for home or larger supply for resale
              and events, we make ordering simple and reliable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white border border-[#e6dfd1] rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="h-72 overflow-hidden relative">
                  <img 
                    src={product.image_url || "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80"} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-[#183126] font-bold text-xs uppercase tracking-widest rounded-full shadow-lg">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-black mb-4 group-hover:text-[#1d4d35] transition-colors">{product.name}</h3>
                  <p className="text-[#5f6c65] text-lg mb-8 leading-relaxed h-[3.5em] overflow-hidden">
                    {product.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <span className="text-3xl font-black text-[#1d4d35]">
                      {product.is_price_on_request ? 'R??' : `R${product.price}`}
                    </span>
                    <Link
                      to={`/${farm.slug}/order?product=${product.id}`}
                      className="w-full sm:w-auto px-8 py-4 bg-[#1d4d35] text-white font-black rounded-full hover:bg-[#153a28] flex items-center justify-center gap-2"
                    >
                      Order Now <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-[#f5f0e6]">
        <div className="container mx-auto px-[5%] max-w-[1200px]">
          <div className="text-center max-w-[800px] mx-auto mb-20">
            <span className="text-[#8b6b2f] font-black uppercase tracking-[0.2em] text-sm mb-4 block">Farm Services</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6">Practical services built around your needs</h2>
            <p className="text-[#5f6c65] text-lg">
              We do more than sell poultry. We help customers, resellers, and
              communities get the supply they need in a simple way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-[32px] p-10 border border-[#e6dfd1] shadow-sm hover:-translate-y-2 transition-transform">
                <div className="w-12 h-12 rounded-full bg-[#edf4ee] text-[#1d4d35] flex items-center justify-center mb-6 font-black text-xl">
                  ✓
                </div>
                <h3 className="text-2xl font-black mb-4">{service.title}</h3>
                <p className="text-[#5f6c65] text-lg leading-relaxed">{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12">
        <div className="container mx-auto px-[5%] max-w-[1200px]">
          <div className="bg-[#183126] text-white rounded-[40px] p-10 md:p-16 flex flex-col md:flex-row justify-between items-center gap-12 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 text-center md:text-left">
              <span className="text-[#d6c27c] font-black uppercase tracking-[0.2em] text-sm mb-4 block">Need quick assistance?</span>
              <h2 className="text-4xl md:text-5xl font-black mb-4">Order faster through WhatsApp</h2>
              <p className="text-[#d3ddd7] text-lg max-w-[500px]">
                Send your product, quantity, and location directly to us for a quick response.
              </p>
            </div>
            <button
               onClick={() => openWhatsApp("Hello, I want to place an order. Product: , Quantity: ")}
               className="relative z-10 px-10 py-6 rounded-full bg-[#28c76f] text-white font-black text-lg shadow-xl hover:bg-[#21a55c] transition-all flex items-center gap-3 animate-bounce-slow"
            >
              <MessageCircle size={24} /> Start WhatsApp Order
            </button>
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-24">
        <div className="container mx-auto px-[5%] max-w-[1200px]">
          <div className="text-center mb-16">
            <span className="text-[#8b6b2f] font-black uppercase tracking-[0.2em] text-sm mb-4 block">Why People Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-black">Built on trust, freshness, and reliable supply</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[ 
              { title: "Freshness You Can Trust", text: "We focus on clean, quality poultry products that customers can feel good about buying.", icon: <ShieldCheck className="text-[#1d4d35]" /> },
              { title: "Simple Ordering", text: "We keep the process easy through direct enquiries, WhatsApp, and quick support.", icon: <TrendingUp className="text-[#1d4d35]" /> },
              { title: "Local Convenience", text: "Serving Polokwane and nearby areas with practical delivery and booking options.", icon: <Award className="text-[#1d4d35]" /> }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-[#e6dfd1] rounded-[32px] p-10 shadow-sm hover:border-[#1d4d35] transition-colors">
                <div className="w-14 h-14 bg-[#fcfaf5] rounded-2xl flex items-center justify-center mb-8 border border-[#e6dfd1]">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 font-display">{item.title}</h3>
                <p className="text-[#5f6c65] leading-relaxed text-lg">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#f5f0e6]">
        <div className="container mx-auto px-[5%] max-w-[1200px]">
          <div className="text-center mb-20">
            <span className="text-[#8b6b2f] font-black uppercase tracking-[0.2em] text-sm mb-4 block">What Customers Say</span>
            <h2 className="text-4xl md:text-5xl font-black">Trusted by local buyers</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test) => (
              <div key={test.id} className="bg-white rounded-[32px] p-10 border border-[#e6dfd1] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-4xl text-[#c2ab67] font-black mb-6 leading-none">“</div>
                  <p className="text-[#46554d] text-lg leading-relaxed italic mb-8">
                    {test.quote}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1d4d35] text-white flex items-center justify-center font-black">
                    {test.author_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-[#183126]">{test.author_name}</h4>
                    <p className="text-sm text-[#8b6b2f] font-bold uppercase tracking-widest">{test.author_role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating CTA */}
      <button
        onClick={() => openWhatsApp()}
        className="fixed right-6 bottom-6 bg-[#25D366] text-white px-8 py-5 rounded-full font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all z-[100] flex items-center gap-3"
      >
        <MessageCircle size={24} /> WhatsApp
      </button>
    </div>
  );
};

export default Home;
