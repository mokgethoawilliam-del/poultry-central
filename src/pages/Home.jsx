import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { getFarmProducts, getFarmTestimonials } from "../services/supabase";

export default function NewDawnPoultryLanding() {
  const { farm } = useOutletContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const contact = farm?.contact_info || {};
  const whatsappNumber = contact.whatsapp?.replace(/[^0-9]/g, "") || "27150040130";
  const farmName = farm?.name || "The New Dawn Poultry Farm";
  const farmSlug = farm?.slug || "new-dawn";
  const primaryColor = farm?.primary_color || "#1d4d35";

  // Dynamic Styles
  const primaryBg = { backgroundColor: primaryColor };
  const primaryText = { color: primaryColor };
  const primaryBorder = { borderColor: primaryColor };
  const primaryBgHover = { backgroundColor: primaryColor, opacity: 0.9 };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, testData] = await Promise.all([
          getFarmProducts(farm.id),
          getFarmTestimonials(farm.id),
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

  const displayProducts =
    products.length > 0
      ? products.map((p) => ({
          id: p.id,
          title: p.name,
          desc: p.description,
          image:
            p.image_url ||
            "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80",
          cta: `Order ${p.name}`,
          price: p.price,
          is_price_on_request: p.is_price_on_request,
        }))
      : [
          {
            title: "Live Chickens",
            desc: "Healthy, farm-raised chickens available for households, resellers, and events.",
            image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80",
            cta: "Order Live Chickens",
          },
          {
            title: "Fresh Eggs",
            desc: "Clean, fresh eggs supplied daily for homes, shops, and bulk buyers.",
            image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=1200&q=80",
            cta: "Order Fresh Eggs",
          },
          {
            title: "Day-Old Chicks",
            desc: "Reliable supply of chicks for farmers and poultry growers looking to scale.",
            image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80",
            cta: "Order Day-Old Chicks",
          },
        ];

  const displayTestimonials =
    testimonials.length > 0 ? testimonials : [
      { id: 1, quote: "The New Dawn Poultry Farm delivers fresh chickens right to our door. Best quality in Polokwane!", author_name: "Mama Dlamini", author_role: "Regular Customer" },
      { id: 2, quote: "I've been ordering day-old chicks from them for 6 months. Always healthy, always on time.", author_name: "Bongani M.", author_role: "Poultry Farmer" },
    ];

  return (
    <div className="font-sans text-gray-800 bg-white min-h-screen">
      {/* Navbar - Exactly as user provided */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {farm?.logo_url ? (
              <img src={farm.logo_url} alt={farmName} className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
                {farmName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs text-green-700 font-bold uppercase tracking-widest leading-none mb-1">
                {farmName}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">{farm?.site_title || "Fresh poultry in Polokwane"}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <a href="#home" className="hover:text-green-700 transition-colors">Home</a>
            <Link to={`/${farmSlug}/products`} className="hover:text-green-700 transition-colors">Products</Link>
            <Link to={`/${farmSlug}/services`} className="hover:text-green-700 transition-colors">Farm Services</Link>
            <a href="#about" className="hover:opacity-75 transition-colors" style={primaryText}>About</a>
            <Link to={`/${farmSlug}/contact`} className="hover:opacity-75 transition-colors" style={primaryText}>Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white px-5 py-2 rounded-full text-xs font-bold transition shadow-md"
              style={primaryBg}
            >
              WhatsApp Us
            </a>
            <Link
              to={`/${farmSlug}/order`}
              className="bg-gray-800 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-black transition shadow-md"
            >
              Order Now
            </Link>
          </div>

          <button className="md:hidden text-gray-800 focus:outline-none" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-6 flex flex-col gap-4 text-sm font-bold text-gray-800 animate-slideDown shadow-xl">
             <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
             <Link to={`/${farmSlug}/products`} onClick={() => setMenuOpen(false)}>Products</Link>
             <Link to={`/${farmSlug}/services`} onClick={() => setMenuOpen(false)}>Farm Services</Link>
             <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
             <Link to={`/${farmSlug}/contact`} onClick={() => setMenuOpen(false)}>Contact</Link>
             <div className="flex flex-col gap-2 pt-2">
                <a href={`https://wa.me/${whatsappNumber}`} className="bg-green-600 text-white py-3 rounded-full text-center shadow-lg">WhatsApp Us</a>
                <Link to={`/${farmSlug}/order`} className="bg-gray-800 text-white py-3 rounded-full text-center shadow-lg" onClick={() => setMenuOpen(false)}>Order Now</Link>
             </div>
          </div>
        )}
      </nav>

      {/* Hero Section - User provided design */}
      <section id="home" className="relative pt-12 pb-20 md:pb-32 overflow-hidden bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <p className="font-bold uppercase tracking-widest text-sm mb-4 inline-block px-3 py-1 rounded-md" style={{ ...primaryText, backgroundColor: `${primaryColor}15` }}>
               {farm?.site_title || "Fresh poultry in Polokwane"}
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tight">
               {farm?.branding?.hero_headline?.split('.').map((part, idx) => (
                 <React.Fragment key={idx}>
                    <span style={idx === 2 ? primaryText : { color: '#111' }}>{part}</span>
                    <br />
                 </React.Fragment>
               )) || (
                 <>
                   Farm.
                   <br />
                   <span>Delivered</span>
                   <br />
                   <span style={primaryText}>to You.</span>
                 </>
               )}
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-medium">
               {farm?.branding?.hero_subtitle || "We supply fresh, farm-raised chickens and eggs daily across our region. From our gates straight to your kitchen."}
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link
                to={`/${farmSlug}/order`}
                className="text-white font-bold px-10 py-5 rounded-full text-lg transition shadow-xl hover:-translate-y-1 block"
                style={primaryBg}
              >
                Order Now
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                className="bg-white border-2 font-bold px-10 py-5 rounded-full text-lg transition shadow-lg hover:bg-gray-50 block"
                style={{ ...primaryText, ...primaryBorder }}
              >
                WhatsApp Enquiries
              </a>
            </div>
          </div>

          <div className="relative">
            {/* The Green Arch - From the screenshot logic */}
            <div className="absolute -bottom-10 -left-10 w-96 h-48 bg-green-800/90 rounded-t-full hidden lg:block z-20 shadow-2xl backdrop-blur-sm border-t border-green-700/30"></div>
            
            <div className="rounded-[40px] overflow-hidden shadow-2xl h-[550px] relative">
              <img
                src={farm?.hero_image_url || "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80"}
                alt={farm?.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              
              <div className="absolute bottom-10 right-10 bg-white p-6 rounded-3xl shadow-2xl max-w-xs border border-gray-100 animate-fadeInScale">
                <p className="font-bold text-xs uppercase tracking-widest mb-2" style={primaryText}>Fresh Quality</p>
                <p className="text-gray-900 font-bold leading-snug">{farm?.why_content || "Locally raised chickens, fresh daily eggs, and specialized services."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-sm font-bold uppercase tracking-[0.2em]">
          <div className="flex flex-col gap-2">
            <span className="text-green-500 text-2xl">✓</span>
            Locally Raised
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-green-500 text-2xl">✓</span>
            Fresh Daily
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-green-500 text-2xl">✓</span>
            Bulk Available
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-green-500 text-2xl">✓</span>
            Reliable Delivery
          </div>
        </div>
      </section>

      {/* Products - User code logic */}
      <section id="products" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Farm Highlights</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">Quality products raised with heart. Explore our fresh daily selections.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {displayProducts.map((product, index) => (
              <div key={index} className="bg-gray-50 rounded-[40px] overflow-hidden border border-gray-100 hover:shadow-2xl transition duration-500 group">
                <div className="h-64 overflow-hidden relative">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
                <div className="p-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">{product.title}</h3>
                  <p className="text-gray-600 text-sm mb-8 leading-relaxed font-medium">{product.desc}</p>
                  <Link
                    to={product.id ? `/${farmSlug}/order?product=${product.id}` : `/${farmSlug}/order`}
                    className="block w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-full text-center transition shadow-lg group-hover:-translate-y-1"
                  >
                    {product.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About - Wired story */}
      <section id="about" className="py-24 bg-gray-50 border-y border-gray-100 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-50"></div>
            <div className="rounded-[40px] overflow-hidden shadow-2xl h-[500px]">
              <img 
                src={farm?.about_image_url || "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80"} 
                alt="Our Farm" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-700/10 rounded-full"></div>
          </div>
          <div>
            <p className="font-bold uppercase tracking-widest text-sm mb-6 inline-block px-3 py-1 rounded-md" style={{ ...primaryText, backgroundColor: `${primaryColor}15` }}>Our Story</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tight italic leading-tight">Authentic farming, <br/>built on Trust.</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6 font-medium">
               {farm?.about_story || "We believe good food starts with trust, consistency, and proper care. Our goal is to serve our community with quality poultry products that people can rely on for everyday meals, resale, and special events."}
            </p>
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
               {farm?.about_headline || "We serve families, retailers, and local businesses with the same dedication to freshness and reliability."}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight italic">Verified Feedback</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {displayTestimonials.map((t) => (
              <div key={t.id} className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 hover:border-green-200 transition-colors">
                <p className="text-gray-800 text-xl leading-relaxed italic mb-8 font-serif leading-relaxed font-medium">"{t.quote}"</p>
                <div className="flex items-center gap-4 border-t border-gray-50 pt-8">
                  <div className="w-12 h-12 bg-green-700 text-white rounded-2xl flex items-center justify-center font-black">
                    {t.author_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 tracking-tight uppercase text-sm">{t.author_name}</h4>
                    <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest leading-none mt-1">{t.author_role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <p className="font-black text-2xl tracking-tighter mb-4 italic leading-none" style={primaryText}>{farmName}</p>
            <p className="text-gray-500 text-sm max-w-sm font-medium leading-relaxed">
               {farm?.footer_desc || `Quality poultry supply. We serve families, businesses, and community events with freshness and care.`}
            </p>
          </div>
          <div className="md:col-span-3">
             <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6">Explore</h4>
             <div className="flex flex-col gap-4 text-sm font-bold text-gray-500">
                <Link to={`/${farmSlug}/products`} className="hover:text-green-700">All Products</Link>
                <Link to={`/${farmSlug}/services`} className="hover:text-green-700">Farm Services</Link>
                <Link to={`/${farmSlug}/contact`} className="hover:text-green-700">Contact Us</Link>
             </div>
          </div>
          <div className="md:col-span-4">
             <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6">Contact</h4>
             <div className="flex flex-col gap-4 text-sm text-gray-600 font-medium">
                <p>{contact.address || "Polokwane, Limpopo Province, SA"}</p>
                <p>{contact.phone || "015 004 0130"}</p>
                <a href={`https://wa.me/${whatsappNumber}`} className="text-green-700 font-black">WhatsApp Enquiry</a>
             </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pt-16 mt-16 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
           <p>© {new Date().getFullYear()} {farmName}. ALL RIGHTS RESERVED.</p>
           <p className="flex gap-4"><span>KASI BUSINESS HUB</span> <span>POLOKWANE</span></p>
        </div>
      </footer>
    </div>
  );
}
