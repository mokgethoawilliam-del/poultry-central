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

  // Map DB products to the card format the original design expects.
  // Falls back to the original 3 static cards if no DB products exist yet.
  const staticProducts = [
    {
      title: "Live Chickens",
      desc: "Healthy, farm-raised chickens available for households, resellers, and events.",
      image:
        "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=1200&q=80",
      cta: "Order Live Chickens",
    },
    {
      title: "Fresh Eggs",
      desc: "Clean, fresh eggs supplied daily for homes, shops, and bulk buyers.",
      image:
        "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=1200&q=80",
      cta: "Order Fresh Eggs",
    },
    {
      title: "Day-Old Chicks",
      desc: "Reliable supply of chicks for farmers and poultry growers looking to scale.",
      image:
        "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80",
      cta: "Order Day-Old Chicks",
    },
  ];

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
      : staticProducts;

  const staticTestimonials = [
    {
      id: 1,
      quote:
        "The New Dawn Poultry Farm delivers fresh chickens right to our door. Best quality in Polokwane!",
      author_name: "Mama Dlamini",
      author_role: "Regular Customer",
    },
    {
      id: 2,
      quote:
        "I've been ordering day-old chicks from them for 6 months. Always healthy, always on time.",
      author_name: "Bongani M.",
      author_role: "Poultry Farmer",
    },
    {
      id: 3,
      quote:
        "Great bulk pricing for our butchery. Reliable people doing real business.",
      author_name: "Lucky's Butchery",
      author_role: "Business Owner",
    },
  ];

  const displayTestimonials =
    testimonials.length > 0 ? testimonials : staticTestimonials;

  return (
    <div className="font-sans text-gray-800 bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-green-700 font-semibold uppercase tracking-widest">
              {farmName}
            </p>
            <p className="text-[11px] text-gray-400">
              Fresh poultry in Polokwane
            </p>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#home" className="hover:text-green-700">
              Home
            </a>
            <Link to={`/${farmSlug}/products`} className="hover:text-green-700">
              Products
            </Link>
            <Link to={`/${farmSlug}/services`} className="hover:text-green-700">
              Farm Services
            </Link>
            <a href="#about" className="hover:text-green-700">
              About
            </a>
            <Link to={`/${farmSlug}/contact`} className="hover:text-green-700">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition"
            >
              WhatsApp Us
            </a>
            <Link
              to={`/${farmSlug}/order`}
              className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-yellow-600 transition"
            >
              Order Now
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-3 text-sm font-medium">
            <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
            <Link to={`/${farmSlug}/products`} onClick={() => setMenuOpen(false)}>Products</Link>
            <Link to={`/${farmSlug}/services`} onClick={() => setMenuOpen(false)}>Farm Services</Link>
            <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            <Link to={`/${farmSlug}/contact`} onClick={() => setMenuOpen(false)}>Contact</Link>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded-full text-center"
            >
              WhatsApp Us
            </a>
            <Link
              to={`/${farmSlug}/order`}
              className="bg-yellow-500 text-white px-4 py-2 rounded-full text-center"
              onClick={() => setMenuOpen(false)}
            >
              Order Now
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section
        id="home"
        className="relative min-h-screen flex items-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-white">
          <p className="text-green-300 font-semibold uppercase tracking-widest text-sm mb-4">
            Trusted Local Poultry Supplier
          </p>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Farm. Delivered
            <br />
            <span className="text-yellow-400">to You.</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl max-w-xl mb-10">
            {farmName} supplies quality chickens, eggs, chicks, and poultry
            services in Polokwane. We serve families, resellers, local
            businesses, and community events with freshness and care.
          </p>
          <div className="flex flex-wrap gap-4 mb-10">
            <Link
              to={`/${farmSlug}/products`}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-full text-base transition"
            >
              View Products
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hello, I want to place an order.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-green-800 hover:bg-gray-100 font-bold px-8 py-4 rounded-full text-base transition"
            >
              WhatsApp Order
            </a>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {["Locally Raised", "Fresh Daily", "Bulk Orders Available", "Reliable Delivery"].map(
              (badge) => (
                <div
                  key={badge}
                  className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-4 py-3 text-sm font-semibold text-center"
                >
                  {badge}
                </div>
              )
            )}
          </div>
        </div>

        {/* WhatsApp Float */}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 hover:bg-green-600 transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
      </section>

      {/* Trust Strip */}
      <section className="bg-green-700 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-sm font-bold uppercase tracking-widest">
          <span>✓ Farm Fresh</span>
          <span>✓ Polokwane Based</span>
          <span>✓ Bulk Supply</span>
          <span>✓ WhatsApp Ordering</span>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-green-700 font-bold uppercase tracking-widest text-sm mb-2">
              Our Products
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-800">
              Fresh from the Farm
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              Quality poultry products available for home, resale, and events.
              Order directly or enquire via WhatsApp.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {displayProducts.map((product, index) => (
                <div
                  key={product.id || index}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition group"
                >
                  <div className="h-64 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-black text-gray-800 mb-2">
                      {product.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                      {product.desc}
                    </p>
                    {product.price && (
                      <p className="text-green-700 font-black text-lg mb-4">
                        {product.is_price_on_request ? "Price on Request" : `R${product.price}`}
                      </p>
                    )}
                    <Link
                      to={
                        product.id
                          ? `/${farmSlug}/order?product=${product.id}`
                          : `/${farmSlug}/order`
                      }
                      className="block w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-full text-center transition text-sm"
                    >
                      {product.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-green-700 font-bold uppercase tracking-widest text-sm mb-2">
              Farm Services
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-800">
              More than just chickens
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Bulk Supply",
                icon: "📦",
                desc: "Consistent supply for butcheries, resellers, schools, and local businesses at competitive rates.",
              },
              {
                title: "Local Delivery",
                icon: "🚚",
                desc: "Fast delivery across Polokwane and nearby areas. Fresh products at your door.",
              },
              {
                title: "Advance Bookings",
                icon: "📅",
                desc: "Reserve chickens or chicks in advance to secure your supply for events.",
              },
              {
                title: "Event Supply",
                icon: "🎉",
                desc: "Funerals, weddings, church events — we supply bulk poultry for large gatherings.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="flex gap-5 p-8 border border-gray-100 rounded-3xl hover:border-green-200 hover:shadow-md transition"
              >
                <div className="text-4xl mt-1">{s.icon}</div>
                <div>
                  <h3 className="text-xl font-black text-gray-800 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-green-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-green-700 font-bold uppercase tracking-widest text-sm mb-4">
              Our Story
            </p>
            <h2 className="text-4xl font-black text-gray-800 mb-6">
              {farm?.about_story
                ? farm.about_story.split(".")[0]
                : "A real farm built on trust"}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              {farm?.about_story ||
                `At ${farmName}, we believe good food starts with trust, consistency, and proper care. Our goal is to serve Polokwane with quality poultry products that people can rely on for everyday meals, resale, and special events.`}
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              We are building a farm brand that feels close to the community:
              fresh products, practical service, and simple ordering.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl h-96">
            <img
              src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80"
              alt="Farm chicks"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-green-700 font-bold uppercase tracking-widest text-sm mb-2">
              What Customers Say
            </p>
            <h2 className="text-4xl font-black text-gray-800">
              Trusted by locals
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {displayTestimonials.map((t) => (
              <div
                key={t.id}
                className="bg-green-50 border border-green-100 rounded-3xl p-8 flex flex-col justify-between"
              >
                <p className="text-gray-700 italic text-lg leading-relaxed mb-8">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-700 text-white rounded-full flex items-center justify-center font-black text-sm">
                    {t.author_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-gray-800 text-sm">
                      {t.author_name}
                    </p>
                    <p className="text-[11px] text-green-700 font-bold uppercase tracking-widest">
                      {t.author_role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-green-700 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to place your order?
          </h2>
          <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">
            Order online or send us a WhatsApp message. We'll confirm stock and
            arrange delivery or pickup in Polokwane.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to={`/${farmSlug}/order`}
              className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-black px-10 py-4 rounded-full text-lg transition"
            >
              Order Now
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hello, I want to place an order.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-gray-100 text-green-800 font-black px-10 py-4 rounded-full text-lg transition"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="text-white font-black text-base mb-2">{farmName}</p>
            <p className="text-xs uppercase tracking-widest text-green-400 font-bold mb-4">
              Fresh. Local. Reliable.
            </p>
            <p>{contact.address || "Polokwane, Limpopo, South Africa"}</p>
            <p className="mt-1">{contact.phone || "015 004 0130"}</p>
          </div>
          <div>
            <p className="text-white font-bold mb-4">Quick Links</p>
            <ul className="space-y-2">
              <li><Link to={`/${farmSlug}/products`} className="hover:text-white">Products</Link></li>
              <li><Link to={`/${farmSlug}/services`} className="hover:text-white">Services</Link></li>
              <li><Link to={`/${farmSlug}/order`} className="hover:text-white">Place an Order</Link></li>
              <li><Link to={`/${farmSlug}/contact`} className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-bold mb-4">Business Hours</p>
            <p>{contact.operating_hours || "Mon – Sat: 08:00 – 17:00"}</p>
            <p className="mt-4">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 font-bold hover:text-green-300"
              >
                WhatsApp: +{whatsappNumber}
              </a>
            </p>
          </div>
        </div>
        <div className="text-center text-xs text-gray-600 mt-10">
          © {new Date().getFullYear()} {farmName}. All rights reserved. Powered by Kasi Business Hub.
        </div>
      </footer>
    </div>
  );
}
