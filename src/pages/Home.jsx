import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Truck, Package, Star, MessageCircle } from 'lucide-react';

const Home = () => {
  const { farm } = useOutletContext();
  const branding = farm.branding || {};

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image / Placeholder */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary opacity-60"></div>
          <img 
            src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=2000" 
            alt="Farm Background" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {branding.hero_headline || "Fresh Poultry. Trusted Supply. Delivered with Care."}
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90 text-secondary">
            Your reliable local supplier of healthy chickens, fresh eggs, and quality chicks in Polokwane.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={`/${farm.slug}/order`} className="btn btn-primary px-10 py-4 text-lg">
              Order Now <ArrowRight size={20} />
            </Link>
            <a 
              href={`https://wa.me/${farm.contact_info?.whatsapp?.replace(/[^0-9]/g, '')}`}
              className="btn btn-whatsapp px-10 py-4 text-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us <MessageCircle size={20} />
            </a>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-12 border-b">
        <div className="container overflow-x-auto">
          <div className="flex justify-between items-center gap-8 min-w-[800px]">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-primary" size={32} />
              <div>
                <p className="font-bold">Fresh Stock</p>
                <p className="text-sm text-gray-500">Quality Guaranteed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="text-primary" size={32} />
              <div>
                <p className="font-bold">Bulk Orders</p>
                <p className="text-sm text-gray-500">For Events & Resellers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="text-primary" size={32} />
              <div>
                <p className="font-bold">Local Delivery</p>
                <p className="text-sm text-gray-500">Fast & Reliable</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star className="text-accent" size={32} />
              <div>
                <p className="font-bold">Reliable Service</p>
                <p className="text-sm text-gray-500">Polokwane's Choice</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Intro */}
      <section className="section bg-secondary bg-opacity-30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Premium Supply</h2>
            <p className="text-text-light max-w-2xl mx-auto">
              We take pride in our farm-to-table process, ensuring every bird and egg meets our high standards of quality and freshness.
            </p>
          </div>
          
          <div className="grid-3">
            {/* Live Chickens */}
            <div className="card group">
              <div className="h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800" alt="Live Chickens" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Live Chickens</h3>
                <p className="text-gray-600 mb-4">Broilers and Layers raised in a healthy, natural environment.</p>
                <Link to={`/${farm.slug}/products`} className="text-primary font-bold flex items-center gap-2">
                  View Pricing <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Fresh Eggs */}
            <div className="card group">
              <div className="h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=800" alt="Fresh Eggs" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Fresh Eggs</h3>
                <p className="text-gray-600 mb-4">Daily harvested, large-sized eggs delivered fresh to you.</p>
                <Link to={`/${farm.slug}/products`} className="text-primary font-bold flex items-center gap-2">
                  View Pricing <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Day-Old Chicks */}
            <div className="card group">
              <div className="h-64 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?auto=format&fit=crop&q=80&w=800" alt="Day old chicks" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Day-Old Chicks</h3>
                <p className="text-gray-600 mb-4">Start your own flock with our grade-A day-old chicks.</p>
                <Link to={`/${farm.slug}/products`} className="text-primary font-bold flex items-center gap-2">
                  View Pricing <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-16">What Our Customers Say</h2>
          <div className="grid grid-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-8 bg-secondary bg-opacity-20 rounded-2xl">
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className="text-accent fill-accent" />
                  ))}
                </div>
                <p className="italic text-gray-700 mb-6">"The best service in Polokwane. The chickens are always healthy and the eggs are incredibly fresh. Highly recommended!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-secondary font-bold">JD</div>
                  <div>
                    <p className="font-bold">John Doe</p>
                    <p className="text-sm text-gray-500">Local Business Owner</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Placeholder */}
      <section className="section bg-secondary bg-opacity-10">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Do you deliver in Polokwane?", a: "Yes, we offer reliable delivery services within Polokwane and surrounding areas for bulk orders." },
              { q: "How can I pay for my order?", a: "We accept Paystack, Netcash, EFT, and Cash on Delivery." },
              { q: "Can I book a visit to the farm?", a: "Absolutely! Please contact us via WhatsApp to schedule a farm visit or consultaion." }
            ].map((faq, i) => (
              <div key={i} className="p-6 bg-white rounded-xl shadow-sm">
                <p className="font-bold text-lg mb-2">{faq.q}</p>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
