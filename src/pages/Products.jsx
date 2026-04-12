import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getFarmProducts } from '../services/supabase';
import { ShoppingCart, Search, Filter, AlertCircle, MessageCircle, ArrowRight } from 'lucide-react';

const Products = () => {
  const { farm } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const contact = farm.contact_info || {};

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getFarmProducts(farm.id);
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [farm.id]);

  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="pt-24 bg-white">
      {/* Header */}
      <section className="bg-primary pt-32 pb-24 text-white text-center relative overflow-hidden">
        <div className="container relative z-10">
          <span className="uppercase tracking-[0.3em] font-bold text-accent mb-6 inline-block">Farm Fresh Selection</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">Our <span className="text-secondary italic">Products</span></h1>
          <p className="text-secondary opacity-80 max-w-2xl mx-auto text-xl leading-relaxed">
            Quality poultry, fresh daily eggs, and healthy chicks raised with care in Polokwane. From our farm straight to your table.
          </p>
        </div>
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
      </section>

      <section className="section bg-white">
        <div className="container">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center mb-20 gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[11px] transition-all border-2 ${
                  filter === cat ? 'bg-primary text-secondary border-primary' : 'bg-transparent text-primary border-primary/10 hover:border-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="card group bg-white border-primary/5">
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 right-6">
                    <span className={`badge px-4 py-2 text-[10px] tracking-widest font-bold uppercase rounded-full shadow-lg ${
                      product.stock_status === 'in_stock' ? 'bg-white/95 text-primary' : 
                      product.stock_status === 'low_stock' ? 'bg-accent text-primary' : 'bg-charcoal text-white'
                    }`}>
                      {product.stock_status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-display font-bold text-primary">{product.name}</h3>
                    <p className="font-bold text-xl text-brown">
                      {product.is_price_on_request ? 'Price on Request' : `R${product.price}`}
                    </p>
                  </div>
                  <p className="text-gray-500 mb-10 leading-relaxed font-medium line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center gap-4">
                    <Link 
                      to={`/${farm.slug}/order?product=${product.id}`}
                      className="btn btn-primary flex-grow text-sm py-4"
                    >
                      Process Order
                    </Link>
                    <a 
                      href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi New Dawn, I'm interested in ${product.name}.`}
                      className="w-14 h-14 rounded-full bg-secondary text-primary flex items-center justify-center hover:bg-primary hover:text-secondary transition-all shadow-sm"
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-32 bg-secondary bg-opacity-20 rounded-[40px]">
              <AlertCircle size={64} className="mx-auto text-primary opacity-20 mb-6" />
              <p className="text-2xl font-display font-bold text-primary">No products available in this category.</p>
              <p className="text-gray-500 mt-2">Please check back later or contact us for advance bookings.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bulk Quote Banner */}
      <section className="container mb-32">
        <div className="bg-organic bg-secondary p-12 md:p-24 rounded-[60px] relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="relative z-10">
            <span className="uppercase tracking-[0.3em] font-bold text-accent mb-6 inline-block">Wholesale & Events</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-primary mb-6">Need bulk supply?</h2>
            <p className="text-xl text-gray-500 max-w-lg leading-relaxed font-medium">
              We offer consistent quality and discounted rates for resellers, butcheries, and large community events in Polokwane.
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
            <Link to={`/${farm.slug}/services`} className="btn btn-primary px-12 py-5 shadow-xl">
              View Wholesale Rates
            </Link>
            <a 
              href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in a bulk quote for my business/event.`}
              className="btn btn-whatsapp px-12 py-5 shadow-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Request Bulk Quote
            </a>
          </div>
          {/* Decorative accents */}
          <div className="absolute -right-40 -bottom-40 w-96 h-96 bg-primary opacity-[0.03] rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default Products;
