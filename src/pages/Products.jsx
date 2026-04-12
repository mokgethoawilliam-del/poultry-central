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
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfaf5]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d4d35]"></div>
    </div>
  );

  return (
    <div className="pt-24 bg-[#fcfaf5]">
      {/* Header */}
      <section className="bg-[#1d4d35] pt-32 pb-24 text-white text-center relative overflow-hidden">
        <div className="container mx-auto px-[5%] max-w-[1200px] relative z-10">
          <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-6 inline-block text-sm">Farm Fresh Selection</span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">Our <span className="text-[#fcfaf5] italic">Products</span></h1>
          <p className="text-[#d3ddd7] max-w-2xl mx-auto text-xl leading-relaxed font-medium">
            Quality poultry, fresh daily eggs, and healthy chicks raised with care in Polokwane. From our farm straight to your table.
          </p>
        </div>
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
      </section>

      <section className="py-24 bg-[#fcfaf5]">
        <div className="container mx-auto px-[5%] max-w-[1200px]">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center mb-16 gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-8 py-3 rounded-full font-black uppercase tracking-widest text-[11px] transition-all border-2 ${
                  filter === cat ? 'bg-[#1d4d35] text-white border-[#1d4d35]' : 'bg-transparent text-[#183126] border-[#183126]/10 hover:border-[#1d4d35]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white border border-[#e6dfd1] rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6">
                    <span className={`px-4 py-2 text-[10px] tracking-widest font-black uppercase rounded-full shadow-lg ${
                      product.stock_status === 'in_stock' ? 'bg-white/95 text-[#183126]' : 
                      product.stock_status === 'low_stock' ? 'bg-[#8b6b2f] text-white' : 'bg-[#183126] text-white'
                    }`}>
                      {product.stock_status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-3xl font-black text-[#183126] leading-tight">{product.name}</h3>
                    <p className="font-black text-2xl text-[#1d4d35]">
                      {product.is_price_on_request ? 'R??' : `R${product.price}`}
                    </p>
                  </div>
                  <p className="text-[#5f6c65] mb-10 leading-relaxed font-medium text-lg h-[3em] overflow-hidden">{product.description}</p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Link 
                      to={`/${farm.slug}/order?product=${product.id}`}
                      className="w-full sm:w-auto px-10 py-5 bg-[#1d4d35] text-white font-black rounded-full hover:bg-[#153a28] flex-grow flex items-center justify-center gap-2 shadow-lg"
                    >
                      Process Order <ArrowRight size={18} />
                    </Link>
                    <a 
                      href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi New Dawn, I'm interested in ${product.name}.`}
                      className="w-16 h-16 rounded-full bg-[#f5f0e6] text-[#1d4d35] flex items-center justify-center hover:bg-[#1d4d35] hover:text-white transition-all shadow-md border border-[#e6dfd1]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={26} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-32 bg-[#f5f0e6] rounded-[40px] border border-dashed border-[#e6dfd1]">
              <AlertCircle size={64} className="mx-auto text-[#1d4d35] opacity-20 mb-6" />
              <p className="text-2xl font-black text-[#183126]">No products available in this category.</p>
              <p className="text-[#5f6c65] mt-2 font-medium">Please check back later or contact us for advance bookings.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bulk Quote Banner */}
      <section className="container mx-auto px-[5%] max-w-[1200px] mb-32">
        <div className="bg-[#183126] p-12 md:p-24 rounded-[60px] relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
          <div className="relative z-10">
            <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-6 inline-block text-sm">Wholesale & Events</span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Need bulk supply?</h2>
            <p className="text-xl text-[#d3ddd7] max-w-lg leading-relaxed font-medium">
              We offer consistent quality and discounted rates for resellers, butcheries, and large community events in Polokwane.
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
            <Link to={`/${farm.slug}/services`} className="px-10 py-5 bg-white text-[#183126] font-black rounded-full shadow-xl hover:bg-gray-50 flex items-center justify-center gap-2">
              View Wholesale Rates <ArrowRight size={20} />
            </Link>
            <a 
              href={`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}?text=Hi, I'm interested in a bulk quote for my business/event.`}
              className="px-10 py-5 bg-[#28c76f] text-white font-black rounded-full shadow-lg hover:bg-[#21a55c] flex items-center justify-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={20} /> Request Bulk Quote
            </a>
          </div>
          {/* Decorative accents */}
          <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
        </div>
      </section>
    </div>
  );
};

export default Products;
