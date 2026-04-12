import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getFarmProducts } from '../services/supabase';
import { ShoppingCart, Search, Filter, AlertCircle } from 'lucide-react';

const Products = () => {
  const { farm } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

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

  if (loading) return <div className="section container text-center">Loading products...</div>;

  return (
    <div className="pt-24 pb-20">
      <section className="bg-primary py-16 text-white text-center">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
          <p className="text-secondary opacity-80 max-w-2xl mx-auto">
            Quality poultry, fresh eggs, and healthy chicks. Select a category below to browse our current stock.
          </p>
        </div>
      </section>

      <section className="section container">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between mb-12 gap-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                  filter === cat ? 'bg-primary text-secondary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid-3">
          {filteredProducts.map(product => (
            <div key={product.id} className="card group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={product.image_url || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800'} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-4 right-4">
                  <span className={`badge ${
                    product.stock_status === 'in_stock' ? 'badge-stock' : 
                    product.stock_status === 'low_stock' ? 'badge-low' : 'badge-out'
                  }`}>
                    {product.stock_status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-primary">{product.name}</h3>
                  <p className="font-bold text-lg text-accent">
                    {product.is_price_on_request ? 'Price on Request' : `R${product.price}`}
                  </p>
                </div>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <Link 
                    to={`/${farm.slug}/order?product=${product.id}`}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} /> Order Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">No products found in this category.</p>
          </div>
        )}
      </section>

      {/* Bulk Order Banner */}
      <section className="container mb-20">
        <div className="bg-charcoal rounded-3xl p-8 md:p-16 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Bulk Supply for Events?</h2>
              <p className="text-gray-400 max-w-md">We provide discounted rates for resellers, catering businesses, and large community events.</p>
            </div>
            <Link to={`/${farm.slug}/services`} className="btn bg-accent text-primary px-10 py-4 font-bold rounded-full">
              Request Bulk Quote
            </Link>
          </div>
          {/* Subtle background circle */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary opacity-20 rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default Products;
