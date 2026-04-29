import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { getFarmProducts } from '../services/supabase';
import { ShoppingCart, Search, Filter, AlertCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { phoneDigits, safeSlug, safeText } from '../utils/content';
import { addCartItem, getCartCount } from '../utils/cart';

const Products = () => {
  const { farm } = useOutletContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [cartNotice, setCartNotice] = useState('');
  const contact = farm.contact_info || {};
  const farmSlug = safeSlug(farm.slug, 'new-dawn');
  const farmName = safeText(farm?.name, 'the farm');
  const whatsappNumber = phoneDigits(contact.whatsapp || contact.phone);

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

  useEffect(() => {
    if (!farm.id) return;
    const syncCartCount = () => setCartCount(getCartCount(farm.id));
    syncCartCount();
    window.addEventListener('storage', syncCartCount);
    window.addEventListener('poultry-cart-updated', syncCartCount);
    return () => {
      window.removeEventListener('storage', syncCartCount);
      window.removeEventListener('poultry-cart-updated', syncCartCount);
    };
  }, [farm.id]);

  const handleAddToCart = (product) => {
    addCartItem(farm.id, product.id, 1);
    setCartNotice(`${safeText(product.name, 'Product')} added to cart.`);
    window.setTimeout(() => setCartNotice(''), 2400);
  };

  const categories = ['All', ...new Set(products.map(p => safeText(p.category, 'Other')))];
  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => safeText(p.category, 'Other') === filter);
  const displayPrice = (product) => (
    product?.is_price_on_request || product?.price === null || product?.price === undefined ? 'Quote' : `R${product.price}`
  );

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfaf5]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c2410c]"></div>
    </div>
  );

  return (
    <div className="pt-24 bg-[#fcfaf5]">
      {/* Header */}
      <section className="bg-[#b91c1c] pt-32 pb-24 text-white text-center relative overflow-hidden">
        <div className="container mx-auto px-[5%] max-w-[1200px] relative z-10">
          <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-6 inline-block text-sm">Farm Fresh Selection</span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">Our <span className="text-[#fcfaf5] italic">Products</span></h1>
          <p className="text-[#d3ddd7] max-w-2xl mx-auto text-xl leading-relaxed font-medium">
            Quality poultry, fresh daily eggs, and healthy chicks raised with care in Polokwane. From our farm straight to your table.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(`/${farmSlug}/order`)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-black text-[#7f1d1d] shadow-lg"
            >
              <ShoppingCart size={18} />
              View Cart{cartCount > 0 ? ` (${cartCount})` : ''}
            </button>
            {cartNotice && <p className="text-sm font-black text-[#fcfaf5]">{cartNotice}</p>}
          </div>
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
                  filter === cat ? 'bg-[#b91c1c] text-white border-[#b91c1c]' : 'bg-transparent text-[#183126] border-[#183126]/10 hover:border-[#b91c1c]'
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
                    alt={safeText(product.name, 'Product')} 
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
                  <div className="absolute top-6 right-6">
                    <span className="px-4 py-2 text-[10px] tracking-widest font-black uppercase rounded-full shadow-lg bg-[#d6c27c] text-[#183126]">
                      {safeText(product.category, 'Other')}
                    </span>
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-3xl font-black text-[#183126] leading-tight">{safeText(product.name, 'Farm Product')}</h3>
                    <p className="font-black text-2xl text-[#b91c1c]">
                      {displayPrice(product)}
                    </p>
                  </div>
                  <p className="text-[#5f6c65] mb-10 leading-relaxed font-medium text-lg h-[3em] overflow-hidden">{safeText(product.description, 'Fresh poultry product from the farm.')}</p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button 
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="w-full sm:w-auto px-10 py-5 bg-[#b91c1c] text-white font-black rounded-full hover:bg-[#991b1b] flex-grow flex items-center justify-center gap-2 shadow-lg"
                    >
                      <ShoppingCart size={18} />
                      {product.is_price_on_request ? 'Add Quote Item' : 'Add to Cart'}
                    </button>
                    <Link 
                      to={`/${farmSlug}/order?product=${product.id}`}
                      className="w-full sm:w-auto px-8 py-5 bg-white text-[#7f1d1d] font-black rounded-full border border-[#ead9d6] flex-grow flex items-center justify-center gap-2 shadow-sm"
                    >
                      Checkout Now <ArrowRight size={18} />
                    </Link>
                    <a 
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi ${farmName}, I'm interested in ${safeText(product.name, 'your poultry products')}.`)}`}
                      className="w-16 h-16 rounded-full bg-[#f5f0e6] text-[#b91c1c] flex items-center justify-center hover:bg-[#b91c1c] hover:text-white transition-all shadow-md border border-[#e6dfd1]"
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
              <AlertCircle size={64} className="mx-auto text-[#b91c1c] opacity-20 mb-6" />
              <p className="text-2xl font-black text-[#183126]">No products available in this category.</p>
              <p className="text-[#5f6c65] mt-2 font-medium">Please check back later or contact us for advance bookings.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bulk Quote Banner */}
      <section className="container mx-auto px-[5%] max-w-[1200px] mb-32">
        <div className="bg-[#7f1d1d] p-12 md:p-24 rounded-[60px] relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
          <div className="relative z-10">
            <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-6 inline-block text-sm">Wholesale & Events</span>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">Need bulk supply?</h2>
            <p className="text-xl text-[#d3ddd7] max-w-lg leading-relaxed font-medium">
              We offer consistent quality and discounted rates for resellers, butcheries, and large community events in Polokwane.
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
            <Link to={`/${farmSlug}/services`} className="px-10 py-5 bg-white text-[#183126] font-black rounded-full shadow-xl hover:bg-gray-50 flex items-center justify-center gap-2">
              View Wholesale Rates <ArrowRight size={20} />
            </Link>
            <a 
              href={`https://wa.me/${whatsappNumber}?text=Hi, I'm interested in a bulk quote for my business/event.`}
              className="px-10 py-5 bg-[#b91c1c] text-white font-black rounded-full shadow-lg hover:bg-[#991b1b] flex items-center justify-center gap-2"
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

