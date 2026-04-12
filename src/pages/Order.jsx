import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase, getFarmProducts } from '../services/supabase';
import { Calendar, User, Phone, MapPin, CreditCard, ChevronRight, Check } from 'lucide-react';

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

      // Seed order items
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
      <div className="pt-32 pb-20 px-4">
        <div className="container max-w-lg bg-white p-12 rounded-3xl shadow-xl text-center border-t-8 border-primary">
          <div className="w-20 h-20 bg-primary text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-4">Order Received!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for choosing {farm.name}. We've received your order and will contact you via WhatsApp or phone to confirm the details.
          </p>
          <div className="bg-secondary bg-opacity-30 p-4 rounded-xl mb-8">
            <p className="text-sm text-primary font-bold">What happens next?</p>
            <ul className="text-sm text-gray-700 text-left mt-2 space-y-2">
              <li>1. We'll verify stock availability.</li>
              <li>2. You'll receive a confirmation message.</li>
              <li>3. We'll arrange payment and delivery/pickup.</li>
            </ul>
          </div>
          <button onClick={() => navigate(`/${farm.slug}`)} className="btn btn-primary w-full">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 bg-secondary bg-opacity-10">
      <div className="container max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Info Side */}
          <div className="p-10 bg-primary text-white flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-6">Order / Book Now</h1>
            <p className="text-secondary opacity-90 mb-10 text-lg">
              Place your order for fresh poultry and eggs directly through our platform. 
              We'll handle the rest and contact you for confirmation.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <Check size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-bold">Fresh Guarantee</p>
                  <p className="text-sm opacity-70">Harvested and cleaned on day of delivery.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <Truck size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-bold">Local Delivery</p>
                  <p className="text-sm opacity-70">Reliable transport across Polokwane.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-secondary bg-opacity-10 rounded-2xl border border-white border-opacity-20">
              <p className="text-sm opacity-80 mb-2">Need a Bulk Quote?</p>
              <p className="font-bold mb-4">Contact us via WhatsApp for reseller pricing.</p>
              <a 
                href={`https://wa.me/${farm.contact_info?.whatsapp?.replace(/[^0-9]/g, '')}`}
                className="btn btn-whatsapp w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Form Side */}
          <div className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Your Name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      required
                      type="tel" 
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      placeholder="012 345 6789"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Product</label>
                <select 
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white"
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - R{p.price}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Quantity</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                      required
                      type="date" 
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none font-sans"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Fulfillment</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, fulfillmentMethod: 'pickup'})}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      formData.fulfillmentMethod === 'pickup' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600'
                    }`}
                  >
                    Farm Pickup
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, fulfillmentMethod: 'delivery'})}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      formData.fulfillmentMethod === 'delivery' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600'
                    }`}
                  >
                    Local Delivery
                  </button>
                </div>
              </div>

              {formData.fulfillmentMethod === 'delivery' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea 
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter full address in Polokwane"
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
                className="btn btn-primary w-full py-4 text-lg mt-4 disabled:opacity-50"
              >
                {submitting ? 'Placing Order...' : 'Confirm Order'} <ChevronRight size={20} />
              </button>
              <p className="text-center text-xs text-gray-400">By clicking Confirm, you agree to our terms of supply and quality promise.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
