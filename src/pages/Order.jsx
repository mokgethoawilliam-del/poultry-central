import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase, getFarmProducts } from '../services/supabase';
import { Calendar, User, Phone, MapPin, CreditCard, ChevronRight, Check, ShieldCheck, Truck, MessageCircle } from 'lucide-react';

const Order = () => {
  const { farm } = useOutletContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    productId: searchParams.get('product') || '',
    quantity: 1,
    fulfillmentMethod: 'pickup',
    deliveryAddress: '',
    preferredDate: '',
    paymentMethod: 'cash',
    notes: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const orderNumber = `ORD-${Math.floor(Math.random() * 900000 + 100000)}`;
      const selectedProduct = products.find(p => p.id === formData.productId);
      const totalPrice = selectedProduct ? selectedProduct.price * formData.quantity : 0;

      const { data, error } = await supabase.from('orders').insert({
        farm_id: farm.id,
        order_number: orderNumber,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        total_price: totalPrice,
        status: 'pending',
        fulfillment_method: formData.fulfillmentMethod,
        delivery_address: formData.deliveryAddress,
        preferred_date: formData.preferredDate,
        payment_method: formData.paymentMethod,
        notes: formData.notes
      }).select();

      if (error) throw error;

      if (data?.[0]) {
        await supabase.from('order_items').insert({
          order_id: data[0].id,
          product_id: formData.productId,
          quantity: formData.quantity,
          price_at_time: selectedProduct.price
        });
      }

      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="pt-40 pb-32 px-4 bg-white">
        <div className="container max-w-2xl bg-secondary bg-organic p-12 md:p-20 rounded-[60px] shadow-2xl text-center border border-primary/5">
          <div className="w-24 h-24 bg-primary text-secondary rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl rotate-6">
            <Check size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-6">Order Received!</h1>
          <p className="text-xl text-gray-500 mb-12 leading-relaxed">
            Thank you for choosing **{farm.name}**. We've received your request and will contact you via WhatsApp for final confirmation and payment.
          </p>
          <div className="bg-white p-8 rounded-[32px] mb-12 text-left border border-primary/5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-accent" />
              <p className="text-sm font-bold text-primary uppercase tracking-widest">Your Next Steps</p>
            </div>
            <ul className="text-gray-600 space-y-4 font-medium">
              <li className="flex gap-3"><span className="text-accent font-bold">01.</span> Farm manager verifies stock availability</li>
              <li className="flex gap-3"><span className="text-accent font-bold">02.</span> We send a WhatsApp confirmation & invoice</li>
              <li className="flex gap-3"><span className="text-accent font-bold">03.</span> Payment processed & fulfillment scheduled</li>
            </ul>
          </div>
          <button onClick={() => navigate(`/${farm.slug}`)} className="btn btn-primary px-12 py-5 shadow-2xl w-full sm:w-auto">
            Back to Our Farm Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-32 px-4 bg-white min-h-screen">
      <div className="container max-w-5xl">
        <div className="text-center mb-16">
          <span className="uppercase tracking-[0.3em] font-bold text-accent mb-4 inline-block">Direct From Farm</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-primary">Place Your <span className="text-brown italic">Order</span></h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-16 bg-secondary bg-organic rounded-[60px] border border-primary/5 shadow-2xl overflow-hidden p-8 md:p-12">
          {/* Info Side */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <div className="bg-primary p-12 rounded-[40px] text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                <h2 className="text-3xl font-display font-bold mb-6 italic text-secondary">Simple & Reliable</h2>
                <p className="text-lg opacity-80 mb-10 leading-relaxed">
                  Every order is hand-picked and verified for quality. Raising our poultry with care means delivering only the best to your table.
                </p>
                
                <div className="space-y-8 mb-12">
                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="text-accent" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Quality Promise</p>
                      <p className="text-sm opacity-60">Naturally raised & healthy stock.</p>
                    </div>
                  </div>
                  <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Truck className="text-accent" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Local Transport</p>
                      <p className="text-sm opacity-60">Safe delivery across Polokwane.</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8 border-t border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Bulk Request?</p>
                  <a 
                    href={`https://wa.me/${farm.contact_info?.whatsapp?.replace(/[^0-9]/g, '')}`}
                    className="btn btn-whatsapp w-full shadow-lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={20} className="mr-2" /> Chat for Bulk Pricing
                  </a>
                </div>
              </div>
              {/* Abstract overlay */}
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-30" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full bg-white pl-14 pr-6 py-5 rounded-3xl outline-none focus:ring-2 focus:ring-accent border-none shadow-sm"
                      placeholder="e.g. Samuel Mofa"
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">WhatsApp / Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-30" size={18} />
                    <input 
                      required
                      type="tel" 
                      className="w-full bg-white pl-14 pr-6 py-5 rounded-3xl outline-none focus:ring-2 focus:ring-accent border-none shadow-sm"
                      placeholder="012 345 6789"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-8">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Choose Product</label>
                  <select 
                    required
                    className="w-full bg-white px-6 py-5 rounded-3xl outline-none focus:ring-2 focus:ring-accent border-none shadow-sm appearance-none font-bold text-primary"
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  >
                    <option value="">Select a Farm Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — R{p.price}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Quantity</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="w-full bg-white px-6 py-5 rounded-3xl outline-none focus:ring-2 focus:ring-accent border-none shadow-sm font-bold text-primary"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Fulfillment Preference</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, fulfillmentMethod: 'pickup'})}
                    className={`py-5 rounded-3xl font-bold uppercase tracking-widest text-[11px] transition-all border-2 ${
                      formData.fulfillmentMethod === 'pickup' ? 'bg-primary text-secondary border-primary' : 'bg-white text-primary border-primary/10'
                    }`}
                  >
                    Self-Pickup at Farm
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, fulfillmentMethod: 'delivery'})}
                    className={`py-5 rounded-3xl font-bold uppercase tracking-widest text-[11px] transition-all border-2 ${
                      formData.fulfillmentMethod === 'delivery' ? 'bg-primary text-secondary border-primary' : 'bg-white text-primary border-primary/10'
                    }`}
                  >
                    Local Polokwane Delivery
                  </button>
                </div>
              </div>

              {formData.fulfillmentMethod === 'delivery' && (
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-6 text-primary opacity-30" size={18} />
                    <textarea 
                      className="w-full bg-white pl-14 pr-6 py-5 rounded-3xl outline-none focus:ring-2 focus:ring-accent border-none shadow-sm resize-none"
                      placeholder="Your street address or landmark in Polokwane"
                      rows="2"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={submitting}
                className="btn btn-primary w-full py-6 text-xl mt-6 shadow-2xl disabled:opacity-50"
              >
                {submitting ? 'Authenticating Order...' : 'Confirm Farm Order'} <ChevronRight size={24} />
              </button>
              <div className="flex items-center justify-center gap-2 text-primary opacity-40">
                <ShieldCheck size={14} />
                <p className="text-[10px] uppercase tracking-widest font-bold">Secure Local Order Processing</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
