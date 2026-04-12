import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { 
  BarChart3, 
  ShoppingBag, 
  Package, 
  Calendar as CalendarIcon, 
  Users, 
  CreditCard, 
  Bell, 
  Settings,
  ChevronRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Layout,
  Image as ImageIcon,
  CheckCircle2,
  Save,
  MessageSquare,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [farmData, setFarmData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch farm directly — /admin is a standalone global route
        const { data: farm } = await supabase.from('farms').select('*').single();
        setFarmData(farm);

        // Fetch testimonials
        const { data: testData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('farm_id', farm.id)
          .order('created_at', { ascending: false });
        setTestimonials(testData || []);

        // Simulated orders and inventory
        setOrders([
          { id: 1, number: 'ORD-123456', customer: 'John Smith', total: 450, status: 'New', time: '10 mins ago' },
          { id: 2, number: 'ORD-123457', customer: 'Sarah Jones', total: 120, status: 'Confirmed', time: '1 hour ago' },
          { id: 3, number: 'ORD-123458', customer: 'David Mike', total: 850, status: 'Delivered', time: '3 hours ago' },
        ]);
        setInventory([
          { id: 1, item: 'Live Broilers (Batch A)', stock: 45, unit: 'heads', status: 'In Stock' },
          { id: 2, item: 'Fresh Eggs', stock: 12, unit: 'crates', status: 'Low Stock' },
          { id: 3, item: 'Day-Old Chicks', stock: 150, unit: 'heads', status: 'In Stock' },
        ]);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateFarm = async (e) => {
    e?.preventDefault();
    setSaveStatus('Saving...');
    try {
      const { error } = await supabase.from('farms').update({
        name: farmData.name,
        about_story: farmData.about_story,
        branding: farmData.branding,
        contact_info: farmData.contact_info,
        location: farmData.location,
        why_content: farmData.why_content
      }).eq('id', farmData.id);
      if (error) throw error;
      setSaveStatus('Saved Successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setSaveStatus('Error Saving');
    }
  };

  const toggleTestimonial = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setTestimonials(testimonials.map(t => t.id === id ? {...t, is_active: !currentStatus} : t));
    } catch (err) {
      console.error("Testimonial toggle error:", err);
    }
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      setTestimonials(testimonials.filter(t => t.id !== id));
    } catch (err) {
      console.error("Testimonial delete error:", err);
    }
  };

  const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-all ${
        active 
          ? 'bg-[#1d4d35] text-white border-r-4 border-[#8b6b2f]' 
          : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      <span className="font-bold">{label}</span>
    </button>
  );

  const StatCard = ({ label, value, trend, trendUp, icon: Icon }) => (
    <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-[#fcfaf5] rounded-2xl text-[#1d4d35] border border-[#e6dfd1]">
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
          {trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {trend}
        </div>
      </div>
      <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-black text-[#183126] mt-1">{value}</h3>
    </div>
  );

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfaf5]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d4d35]"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#fcfaf5] font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-[#e6dfd1] flex flex-col pt-8">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1d4d35] flex items-center justify-center text-white font-black text-lg shadow-lg">N</div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-[#183126] leading-none uppercase tracking-tight">New Dawn</span>
            <span className="text-[10px] uppercase tracking-widest text-[#8b6b2f] font-bold">Farmer Portal</span>
          </div>
        </div>
        
        <nav className="flex-grow">
          <SidebarItem icon={BarChart3} label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <SidebarItem icon={ShoppingBag} label="Orders" active={activeTab === 'Orders'} onClick={() => setActiveTab('Orders')} />
          <SidebarItem icon={Package} label="Inventory" active={activeTab === 'Inventory'} onClick={() => setActiveTab('Inventory')} />
          <SidebarItem icon={Layout} label="Site Editor" active={activeTab === 'Site Editor'} onClick={() => setActiveTab('Site Editor')} />
          <SidebarItem icon={MessageSquare} label="Testimonials" active={activeTab === 'Testimonials'} onClick={() => setActiveTab('Testimonials')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
        </nav>

        <div className="p-6 border-t border-[#e6dfd1]">
          <div className="bg-[#1d4d35] bg-opacity-5 p-4 rounded-2xl border border-[#e6dfd1]">
            <p className="text-xs font-bold text-[#1d4d35] uppercase tracking-widest mb-1">Subscription</p>
            <p className="text-sm font-black text-[#1d4d35]">Farmer Pro Plan</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#e6dfd1] px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-[#183126] uppercase tracking-tight">{activeTab}</h2>
            {saveStatus && <span className="px-4 py-1.5 bg-[#1d4d35] text-white rounded-full text-xs font-bold animate-pulse">{saveStatus}</span>}
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-[#1d4d35] transition-colors">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-[#e6dfd1] pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-[#183126]">{farmData?.name}</p>
                <p className="text-[10px] text-[#8b6b2f] font-bold uppercase tracking-widest">Administrator</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#f5f0e6] border border-[#e6dfd1] flex items-center justify-center text-[#1d4d35] font-black shadow-sm">
                ND
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-grow overflow-y-auto p-10">
          {activeTab === 'Overview' && (
            <div className="space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Today's Sales" value="R4,250" trend="+12.5%" trendUp={true} icon={CreditCard} />
                <StatCard label="Pending Orders" value="12" trend="+3" trendUp={false} icon={ShoppingBag} />
                <StatCard label="Total Stock" value="1,240" trend="-50" trendUp={false} icon={Package} />
                <StatCard label="Customer Rating" value="4.8/5" trend="Excellent" trendUp={true} icon={MessageSquare} />
              </div>

              <div className="grid lg:grid-cols-2 gap-10">
                {/* Recent Orders */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#e6dfd1]">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-[#183126]">Recent Orders</h3>
                    <button className="text-sm font-bold text-[#1d4d35] uppercase tracking-widest hover:underline">View All &rarr;</button>
                  </div>
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-5 bg-[#fcfaf5] rounded-[24px] border border-transparent hover:border-[#e6dfd1] transition-all cursor-pointer group">
                        <div className="flex items-center gap-5">
                          <div className={`w-3 h-12 rounded-full ${order.status === 'New' ? 'bg-[#8b6b2f]' : 'bg-[#1d4d35]'}`}></div>
                          <div>
                            <p className="font-black text-[#183126] group-hover:text-[#1d4d35] transition-colors">{order.customer}</p>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{order.number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-[#1d4d35] text-lg">R{order.total}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1 justify-end">
                            <Clock size={12} /> {order.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stock Quick View */}
                <div className="bg-[#183126] p-10 rounded-[40px] shadow-2xl text-white relative overflow-hidden">
                   <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-8">Stock Overview</h3>
                    <div className="space-y-6">
                      {inventory.map(item => (
                        <div key={item.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all">
                          <div>
                            <p className="font-black mb-1">{item.item}</p>
                            <p className="text-xs font-bold text-[#d6c27c] uppercase tracking-widest">{item.stock} {item.unit} available</p>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            item.status === 'Low Stock' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-organic opacity-5 pointer-events-none"></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Site Editor' && (
            <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
              <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-sm border border-[#e6dfd1]">
                <h3 className="text-3xl font-black text-[#183126] mb-12 uppercase tracking-tight">Main Content & Branding</h3>

                <form onSubmit={handleUpdateFarm} className="space-y-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35]">Logo / Brand Name</label>
                      <input 
                        className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-black text-[#183126] focus:ring-2 focus:ring-[#1d4d35] outline-none transition-all"
                        value={farmData?.name || ''} 
                        onChange={(e) => setFarmData({...farmData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35]">Hero Headline</label>
                      <input 
                        className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-black text-[#183126] focus:ring-2 focus:ring-[#1d4d35] outline-none transition-all"
                        value={farmData?.branding?.hero_headline || ''} 
                        onChange={(e) => setFarmData({...farmData, branding: {...farmData.branding, hero_headline: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35]">Our Farm Story (Homepage)</label>
                    <textarea 
                      rows="5"
                      className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-3xl font-medium text-[#183126]/80 leading-relaxed focus:ring-2 focus:ring-[#1d4d35] outline-none transition-all resize-none"
                      value={farmData?.about_story || ''} 
                      onChange={(e) => setFarmData({...farmData, about_story: e.target.value})}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35]">WhatsApp (International Format)</label>
                      <input 
                        className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-black text-[#183126] focus:ring-2 focus:ring-[#1d4d35] outline-none transition-all"
                        value={farmData?.contact_info?.whatsapp || ''} 
                        onChange={(e) => setFarmData({...farmData, contact_info: {...farmData.contact_info, whatsapp: e.target.value}})}
                        placeholder="e.g. 27150040130"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#1d4d35]">Physical Address</label>
                      <input 
                        className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-black text-[#183126] focus:ring-2 focus:ring-[#1d4d35] outline-none transition-all"
                        value={farmData?.contact_info?.address || ''} 
                        onChange={(e) => setFarmData({...farmData, contact_info: {...farmData.contact_info, address: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div className="pt-10 border-t border-[#e6dfd1] flex items-center justify-between">
                    <p className="text-xs text-gray-500 italic max-w-sm">Updating these values will reflect instantly on your public landing page after saving.</p>
                    <button type="submit" className="px-12 py-5 bg-[#1d4d35] text-white font-black rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                      <Save size={20} /> Deploy Changes
                    </button>
                  </div>
                </form>
              </div>

              {/* Gallery Section Placeholder */}
              <div className="bg-[#f5f0e6] p-16 rounded-[40px] border border-[#e6dfd1] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-[#1d4d35] shadow-xl mb-8">
                  <ImageIcon size={32} />
                </div>
                <h4 className="text-3xl font-black text-[#183126] mb-4 uppercase tracking-tight">Real Farm Imagery</h4>
                <p className="text-[#5f6c65] max-w-md mb-10 text-lg leading-relaxed font-medium">
                  The landing page is currently using professional farm stock photos. Upload your own chickens, eggs, and farm landscape to build 100% local trust.
                </p>
                <button className="px-12 py-5 bg-white border border-[#d8d0c1] text-[#183126] font-black rounded-full shadow-lg hover:shadow-xl transition-all">
                  Manage Media Gallery
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Testimonials' && (
            <div className="max-w-5xl mx-auto space-y-10 animate-fadeIn">
              <div className="flex justify-between items-center bg-[#1d4d35] p-10 rounded-[40px] text-white shadow-xl">
                 <div>
                    <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">Customer Voices</h3>
                    <p className="text-[#d3ddd7] font-medium">Manage the trust indicators shown on your landing page.</p>
                 </div>
                 <button className="px-8 py-4 bg-[#8b6b2f] text-white font-black rounded-full shadow-lg flex items-center gap-2 hover:bg-[#a68038] transition-all">
                    <Plus size={20} /> Add Review
                 </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 {testimonials.map(test => (
                    <div key={test.id} className={`bg-white p-10 rounded-[40px] border border-[#e6dfd1] shadow-sm flex flex-col justify-between transition-all ${!test.is_active ? 'opacity-50 grayscale' : ''}`}>
                       <div>
                          <p className="text-lg text-[#183126] italic font-medium leading-relaxed mb-10">"{test.quote}"</p>
                       </div>
                       <div className="flex items-center justify-between border-t border-gray-50 pt-8">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-[#f5f0e6] rounded-2xl flex items-center justify-center text-[#1d4d35] font-black">
                                {test.author_name.charAt(0)}
                             </div>
                             <div>
                                <h4 className="font-black text-[#183126]">{test.author_name}</h4>
                                <p className="text-[10px] font-black text-[#8b6b2f] uppercase tracking-widest">{test.author_role}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <button 
                                onClick={() => toggleTestimonial(test.id, test.is_active)}
                                className={`p-3 rounded-xl transition-all ${test.is_active ? 'bg-gray-50 text-gray-400 hover:text-red-500' : 'bg-[#1d4d35] text-white'}`}
                                title={test.is_active ? 'Hide from Web' : 'Show on Web'}
                             >
                                {test.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                             </button>
                             <button 
                                onClick={() => deleteTestimonial(test.id)}
                                className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                             >
                                <Trash2 size={18} />
                             </button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              {testimonials.length === 0 && (
                 <div className="bg-white p-20 rounded-[40px] border border-dashed border-[#e6dfd1] text-center">
                    <p className="text-gray-400 font-bold italic">No testimonials added yet. Click "Add Review" to get started.</p>
                 </div>
              )}
            </div>
          )}

          {activeTab !== 'Overview' && activeTab !== 'Site Editor' && activeTab !== 'Testimonials' && (
            <div className="bg-white p-24 rounded-[40px] shadow-sm border border-[#e6dfd1] text-center text-gray-300">
              <Package size={80} className="mx-auto mb-6 opacity-10" />
              <p className="text-2xl font-black text-[#183126] opacity-30 uppercase tracking-widest">Section Under Development</p>
              <p className="text-lg font-medium">We're finalizing the {activeTab} tools for your poultry business.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
