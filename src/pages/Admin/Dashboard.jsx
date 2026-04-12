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
  Save
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [farmData, setFarmData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // Simulation of data and fetching farm data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, we'd fetch the specific farm for the logged in user
        const { data: farm } = await supabase.from('farms').select('*').single();
        setFarmData(farm);

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
    e.preventDefault();
    setSaveStatus('Saving...');
    try {
      const { error } = await supabase.from('farms').update(farmData).eq('id', farmData.id);
      if (error) throw error;
      setSaveStatus('Saved Successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setSaveStatus('Error Saving');
    }
  };

  const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-all ${
        active 
          ? 'bg-primary text-secondary border-r-4 border-accent' 
          : 'text-gray-500 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      <span className="font-semibold">{label}</span>
    </button>
  );

  const StatCard = ({ label, value, trend, trendUp, icon: Icon }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-secondary bg-opacity-30 rounded-2xl text-primary">
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {trend}
        </div>
      </div>
      <p className="text-gray-500 text-sm font-semibold">{label}</p>
      <h3 className="text-2xl font-bold text-primary mt-1">{value}</h3>
    </div>
  );

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r flex flex-col pt-8">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg">N</div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-primary leading-none">New Dawn</span>
            <span className="text-[10px] uppercase tracking-widest text-accent font-bold">Admin Portal</span>
          </div>
        </div>
        
        <nav className="flex-grow">
          <SidebarItem icon={BarChart3} label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <SidebarItem icon={ShoppingBag} label="Orders" active={activeTab === 'Orders'} onClick={() => setActiveTab('Orders')} />
          <SidebarItem icon={Package} label="Inventory" active={activeTab === 'Inventory'} onClick={() => setActiveTab('Inventory')} />
          <SidebarItem icon={Layout} label="Site Editor" active={activeTab === 'Site Editor'} onClick={() => setActiveTab('Site Editor')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
        </nav>

        <div className="p-6 border-t">
          <div className="bg-primary bg-opacity-5 p-4 rounded-2xl">
            <p className="text-xs font-bold text-primary uppercase tracking-tighter mb-1">Subscription</p>
            <p className="text-sm font-semibold text-primary">Farmer Pro Plan</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b px-10 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-primary">{activeTab}</h2>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-primary">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary">Farm Manager</p>
                <p className="text-xs text-gray-500">{farmData?.name}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold">ND</div>
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
                <StatCard label="Live Batches" value="4" trend="Healthy" trendUp={true} icon={CheckCircle2} />
              </div>

              <div className="grid lg:grid-cols-2 gap-10">
                {/* Recent Orders */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Recent Orders</h3>
                    <button className="text-sm font-bold text-primary hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-10 rounded-full ${order.status === 'New' ? 'bg-accent' : 'bg-green-500'}`}></div>
                          <div>
                            <p className="font-bold text-primary">{order.customer}</p>
                            <p className="text-xs text-gray-500">{order.number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">R{order.total}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                            <Clock size={12} /> {order.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Stock Alert</h3>
                    <button className="p-2 rounded-xl bg-primary text-secondary hover:bg-primary-light transition-colors">
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {inventory.filter(i => i.status === 'Low Stock').map(item => (
                      <div key={item.id} className="p-6 border-2 border-red-100 bg-red-50 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-red-700">{item.item}</p>
                          <p className="text-sm text-red-500">Only {item.stock} {item.unit} remaining</p>
                        </div>
                        <button className="bg-white text-red-600 px-6 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-red-600 hover:text-white transition-all">
                          Restock
                        </button>
                      </div>
                    ))}
                    <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between border border-dashed border-primary/20">
                      <p className="text-gray-600 font-semibold italic">Manage all batches in inventory section &rarr;</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Site Editor' && (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="bg-white p-10 rounded-[40px] shadow-sm border">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-display font-bold text-primary text-accent">Real Farm Website Design</h3>
                  {saveStatus && <span className="px-4 py-2 bg-primary text-secondary rounded-full font-bold text-xs animate-pulse">{saveStatus}</span>}
                </div>

                <form onSubmit={handleUpdateFarm} className="space-y-8">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Farm/Store Name</label>
                      <input 
                        className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-accent"
                        value={farmData?.name || ''} 
                        onChange={(e) => setFarmData({...farmData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Store Slug (URL)</label>
                      <input 
                        className="w-full bg-gray-200 border-none px-6 py-4 rounded-2xl outline-none cursor-not-allowed"
                        value={farmData?.slug || ''} 
                        readOnly
                      />
                    </div>
                  </div>

                  {/* About Story */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Our Farm Story (Emotional Section)</label>
                    <textarea 
                      rows="4"
                      className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-accent resize-none"
                      value={farmData?.about_text || ''} 
                      onChange={(e) => setFarmData({...farmData, about_text: e.target.value})}
                    />
                  </div>

                  {/* Contact Details */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">WhatsApp Number</label>
                      <input 
                        className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-accent"
                        value={farmData?.contact_info?.whatsapp || ''} 
                        onChange={(e) => setFarmData({...farmData, contact_info: {...farmData.contact_info, whatsapp: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Business Phone</label>
                      <input 
                        className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-accent"
                        value={farmData?.contact_info?.phone || ''} 
                        onChange={(e) => setFarmData({...farmData, contact_info: {...farmData.contact_info, phone: e.target.value}})}
                      />
                    </div>
                  </div>

                  {/* Address & Hours */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Physical Address (Polokwane)</label>
                      <input 
                        className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-accent"
                        value={farmData?.contact_info?.address || ''} 
                        onChange={(e) => setFarmData({...farmData, contact_info: {...farmData.contact_info, address: e.target.value}})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-primary opacity-60">Operating Hours</label>
                      <input 
                        className="w-full bg-gray-50 border-none px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-accent"
                        value={farmData?.contact_info?.operating_hours || ''} 
                        onChange={(e) => setFarmData({...farmData, contact_info: {...farmData.contact_info, operating_hours: e.target.value}})}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <button type="submit" className="btn btn-primary px-12 py-5 shadow-2xl flex items-center gap-3">
                      <Save size={20} /> Update Website Design
                    </button>
                  </div>
                </form>
              </div>

              {/* Visual Assets Placeholder */}
              <div className="bg-white p-10 rounded-[40px] shadow-sm border flex flex-col items-center justify-center py-20 bg-organic bg-secondary bg-opacity-10">
                <ImageIcon size={64} className="text-primary opacity-20 mb-6" />
                <h4 className="text-2xl font-display font-bold text-primary mb-2">Farm Image Gallery</h4>
                <p className="text-gray-500 mb-8 max-w-sm text-center">Upload real photos of your farm, chickens, and eggs to replace the brand placeholders.</p>
                <div className="flex gap-4">
                  <button className="px-8 py-3 bg-white border border-primary/10 rounded-xl font-bold text-sm shadow-sm hover:border-accent">Upload Photos</button>
                  <button className="px-8 py-3 bg-primary text-secondary rounded-xl font-bold text-sm shadow-sm">View Current Gallery</button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && activeTab !== 'Site Editor' && (
            <div className="bg-white p-24 rounded-[40px] shadow-sm border text-center text-gray-400">
              <Package size={80} className="mx-auto mb-6 opacity-20" />
              <p className="text-2xl font-display font-bold text-primary">Section Coming Soon</p>
              <p className="text-lg">We're building this part of your farm's management suite.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
