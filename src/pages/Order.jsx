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
  const [activeOrder, setActiveOrder] = useState(null);
  const [notifiedArrival, setNotifiedArrival] = useState(false);
  
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

    // Check for active order in localStorage
    const savedOrderId = localStorage.getItem(`active_order_${farm.id}`);
    if (savedOrderId) {
      fetchActiveOrder(savedOrderId);
    } else {
      fetchProducts();
    }
  }, [farm.id]);

  const fetchActiveOrder = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('id', orderId)
        .single();
      
      if (data) {
        setActiveOrder(data);
        setSuccess(true);
        setNotifiedArrival(data.customer_arrived);
        // Subscribe to changes
        subscribeToOrder(orderId);
      }
    } catch (err) {
      console.error("Fetch active order error:", err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToOrder = (orderId) => {
    supabase
      .channel(`order-tracking-${orderId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, payload => {
        setActiveOrder(curr => ({ ...curr, ...payload.new }));
      })
      .subscribe();
  };

  const handleNotifyArrival = async () => {
    if (!activeOrder) return;
    try {
      await supabase.from('orders').update({ customer_arrived: true }).eq('id', activeOrder.id);
      setNotifiedArrival(true);
    } catch (err) {
      console.error("Notify arrival error:", err);
    }
  };

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

      localStorage.setItem(`active_order_${farm.id}`, order.id);
      setActiveOrder(order);
      setSuccess(true);
      subscribeToOrder(order.id);
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
        <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-2xl border border-[#e6dfd1] animate-fadeIn">
          <div className="w-20 h-20 bg-[#1d4d35] rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-xl">
            <CheckCircle2 size={40} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-[#183126] mb-4">Order {activeOrder?.status === 'pending' ? 'Received' : 'Updated'}!</h1>
          <div className="bg-[#fcfaf5] py-3 px-6 rounded-full inline-block font-black text-[#1d4d35] text-sm mb-8 border border-[#e6dfd1]">
            REF: {activeOrder?.order_number}
          </div>

          {/* --- LIVE STATUS TRACKER --- */}
          <div className="mb-12">
             <div className="flex justify-between mb-4">
               {['pending', 'confirmed', 'ready', 'completed'].map((s, idx) => {
                 const isActive = activeOrder?.status === s;
                 const isPast = ['pending', 'confirmed', 'ready', 'completed'].indexOf(activeOrder?.status) >= idx;
                 return (
                   <div key={s} className="flex flex-col items-center gap-2 flex-1 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${isPast ? 'bg-[#1d4d35] text-white' : 'bg-gray-200 text-gray-400'}`}>
                         {isPast ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[9px] uppercase font-black tracking-widest ${isActive ? 'text-[#1d4d35]' : 'text-gray-400'}`}>{s}</span>
                      {idx < 3 && <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 ${isPast ? 'bg-[#1d4d35]' : 'bg-gray-200'}`}></div>}
                   </div>
                 );
               })}
             </div>
             <div className="p-6 bg-[#fcfaf5] rounded-3xl border border-[#e6dfd1] text-left">
               <p className="font-bold text-[#183126] text-sm mb-1">Status: {activeOrder?.status?.toUpperCase()}</p>
               <p className="text-xs text-[#5f6c65]">
                 {activeOrder?.status === 'pending' && "Your order has been sent to the farm staff."}
                 {activeOrder?.status === 'confirmed' && "The farm has confirmed your order and is packing it now."}
                 {activeOrder?.status === 'ready' && "Your order is ready! You can now make your way to the farm."}
                 {activeOrder?.status === 'completed' && "This order has been fulfilled. Thank you!"}
               </p>
             </div>
          </div>

          {/* --- ARRIVAL ALERT BUTTON --- */}
          {activeOrder?.status !== 'completed' && activeOrder?.fulfillment_method === 'pickup' && (
            <div className="mb-10">
               {!notifiedArrival ? (
                 <button 
                   onClick={handleNotifyArrival}
                   className="w-full py-6 bg-[#d6c27c] text-[#183126] font-black rounded-3xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 border-2 border-[#183126]"
                 >
                   🚜 I'M AT THE FARM / I'VE ARRIVED
                 </button>
               ) : (
                 <div className="py-6 bg-[#1d4d35] text-white font-black rounded-3xl flex items-center justify-center gap-3 shadow-inner">
                   <CheckCircle2 size={20} /> FARM STAFF NOTIFIED
                 </div>
               )}
               <p className="text-[10px] text-[#5f6c65] mt-4 font-bold uppercase tracking-widest italic">Click this only once you are outside the gates</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={openWhatsApp}
              className="px-8 py-4 bg-[#28c76f] text-white font-bold rounded-full shadow-lg hover:bg-[#21a55c] transition-all flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle size={18} /> Chat with Farm
            </button>
            <button 
              onClick={() => { localStorage.removeItem(`active_order_${farm.id}`); setSuccess(false); setActiveOrder(null); window.location.reload(); }}
              className="px-8 py-4 bg-white border border-[#d8d0c1] text-[#183126] font-bold rounded-full hover:bg-gray-50 transition-all text-sm"
            >
              New Order
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
