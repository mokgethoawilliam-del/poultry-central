import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { 
  ShoppingBag, 
  Truck, 
  MapPin, 
  CreditCard, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';

const Order = () => {
  const { farm } = useOutletContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('product');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    product_id: productId || '',
    quantity: 1,
    fulfillment_method: 'pickup',
    delivery_address: '',
    payment_method: 'Cash/EFT',
    notes: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('farm_id', farm.id)
        .eq('is_active', true);
      setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, [farm.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const selectedProduct = products.find(p => p.id === formData.product_id);
      const totalPrice = (selectedProduct?.price || 0) * formData.quantity;
      const orderNumber = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { data: order, error } = await supabase.from('orders').insert({
        farm_id: farm.id,
        order_number: orderNumber,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        total_price: totalPrice,
        fulfillment_method: formData.fulfillment_method,
        delivery_address: formData.delivery_address,
        payment_method: formData.payment_method,
        notes: formData.notes,
        status: 'pending'
      }).select().single();

      if (error) throw error;

      // Add order item
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: formData.product_id,
        quantity: formData.quantity,
        price_at_time: selectedProduct?.price || 0
      });

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Order error:", err);
      alert("There was an error placing your order. Please try again or contact us via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const contact = farm.contact_info || {};
    const msg = `Hi New Dawn, I've just placed an order (or would like to) for ${products.find(p => p.id === formData.product_id)?.name}. My name is ${formData.customer_name}.`;
    window.open(`https://wa.me/${contact.whatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfaf5]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d4d35]"></div>
    </div>
  );

  if (success) return (
    <div className="pt-32 pb-24 bg-[#fcfaf5] min-h-screen">
      <div className="container mx-auto px-[5%] max-w-[800px] text-center">
        <div className="bg-white p-12 md:p-20 rounded-[40px] shadow-2xl border border-[#e6dfd1] animate-fadeIn">
          <div className="w-24 h-24 bg-[#1d4d35] rounded-full flex items-center justify-center text-white mx-auto mb-10 shadow-xl">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#183126] mb-6">Order Received!</h1>
          <p className="text-xl text-[#5f6c65] mb-12 font-medium">
            Thank you for choosing **{farm.name}**. We've received your inquiry and will contact you shortly to confirm stock and delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={openWhatsApp}
              className="px-10 py-5 bg-[#28c76f] text-white font-black rounded-full shadow-lg hover:bg-[#21a55c] transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle size={22} /> Confirm on WhatsApp
            </button>
            <button 
              onClick={() => navigate(`/${farm.slug}`)}
              className="px-10 py-5 bg-[#fcfaf5] border border-[#d8d0c1] text-[#183126] font-black rounded-full hover:bg-gray-50 transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const selectedProduct = products.find(p => p.id === formData.product_id);

  return (
    <div className="pt-24 bg-[#fcfaf5] min-h-screen">
      <section className="bg-[#1d4d35] pt-32 pb-24 text-white relative overflow-hidden">
        <div className="container mx-auto px-[5%] max-w-[1200px] relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Secure Your <span className="text-[#fcfaf5] italic">Order</span></h1>
          <p className="text-[#d3ddd7] text-xl max-w-2xl font-medium">
            Fill in your details below. We'll verify stock levels and get back to you immediately for payment and fulfillment.
          </p>
        </div>
        <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
      </section>

      <div className="container mx-auto px-[5%] max-w-[1200px] -mt-12 mb-24 relative z-20">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Order Form */}
          <div className="lg:col-span-8">
            <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-2xl border border-[#e6dfd1]">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35]">Your Full Name</label>
                    <input 
                      required
                      className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-bold text-[#183126] focus:ring-2 focus:ring-[#1d4d35] outline-none transition-all"
                      placeholder="e.g. Sipho Nkosi"
                      value={formData.customer_name}
                      onChange={e => setFormData({...formData, customer_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35]">Phone Number (WhatsApp)</label>
                    <input 
                      required
                      className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-bold text-[#183126] focus:ring-2 focus:ring-[#1d4d35] outline-none transition-all"
                      placeholder="e.g. 015 004 0130"
                      value={formData.customer_phone}
                      onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35]">Select Product</label>
                    <select 
                      className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-bold text-[#183126] focus:ring-2 focus:ring-[#1d4d35] outline-none transition-all appearance-none"
                      value={formData.product_id}
                      onChange={e => setFormData({...formData, product_id: e.target.value})}
                    >
                      <option value="">Choose a product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - R{p.price}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35]">Quantity</label>
                    <input 
                      type="number"
                      min="1"
                      className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-bold text-[#183126] focus:ring-2 focus:ring-[#1d4d35] outline-none transition-all"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35] block">Fulfillment Method</label>
                  <div className="grid grid-cols-2 gap-6">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, fulfillment_method: 'pickup'})}
                      className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
                        formData.fulfillment_method === 'pickup' ? 'bg-[#1d4d35] border-[#1d4d35] text-white shadow-lg' : 'bg-white border-[#e6dfd1] text-[#183126] hover:border-[#1d4d35]'
                      }`}
                    >
                      <ShoppingBag size={24} />
                      <span className="font-black text-sm uppercase tracking-widest">Farm Pickup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, fulfillment_method: 'delivery'})}
                      className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${
                        formData.fulfillment_method === 'delivery' ? 'bg-[#1d4d35] border-[#1d4d35] text-white shadow-lg' : 'bg-white border-[#e6dfd1] text-[#183126] hover:border-[#1d4d35]'
                      }`}
                    >
                      <Truck size={24} />
                      <span className="font-black text-sm uppercase tracking-widest">Local Delivery</span>
                    </button>
                  </div>
                </div>

                {formData.fulfillment_method === 'delivery' && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35]">Delivery Address (Polokwane & Surroundings)</label>
                    <textarea 
                      required
                      rows="3"
                      className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-3xl font-bold text-[#183126] focus:ring-2 focus:ring-[#1d4d35] outline-none transition-all resize-none"
                      placeholder="e.g. 123 Main St, Polokwane, 0700"
                      value={formData.delivery_address}
                      onChange={e => setFormData({...formData, delivery_address: e.target.value})}
                    />
                  </div>
                )}

                <div className="pt-10 border-t border-[#e6dfd1]">
                  <button 
                    disabled={submitting}
                    className="w-full py-6 bg-[#1d4d35] text-white font-black text-xl rounded-full shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Processing...' : 'Complete Order Request'}
                    <ArrowRight size={24} />
                  </button>
                  <p className="text-center text-[#5f6c65] text-xs font-bold mt-6 uppercase tracking-widest">No immediate payment required</p>
                </div>
              </form>
            </div>
          </div>

          {/* Checkout Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              <div className="bg-[#183126] text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                <h3 className="text-2xl font-black mb-10 border-b border-white/10 pb-6 uppercase tracking-tight">Order Summary</h3>
                <div className="space-y-6 mb-10">
                  <div className="flex justify-between items-center">
                    <span className="text-[#d3ddd7] font-bold">Product</span>
                    <span className="font-black">{selectedProduct?.name || '---'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#d3ddd7] font-bold">Quantity</span>
                    <span className="font-black">x {formData.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#d3ddd7] font-bold">Price</span>
                    <span className="font-black">R{selectedProduct?.price || 0}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-8 mt-10">
                  <span className="text-xl font-black text-[#d6c27c]">Estimated Total</span>
                  <span className="text-3xl font-black">R{(selectedProduct?.price || 0) * formData.quantity}</span>
                </div>
                {/* Pattern */}
                <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
              </div>

              <div className="bg-[#f5f0e6] p-10 rounded-[40px] border border-[#e6dfd1] space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1d4d35] flex-shrink-0 shadow-sm">
                    <Info size={20} />
                  </div>
                  <div>
                    <p className="font-black text-[#183126] mb-1">What happens next?</p>
                    <p className="text-sm text-[#5f6c65] leading-relaxed">We will verify current stock and send you a confirmation message via WhatsApp to finalize your delivery or pickup time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
