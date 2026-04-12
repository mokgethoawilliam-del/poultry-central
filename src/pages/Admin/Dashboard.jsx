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
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulation of data for the demo
  useEffect(() => {
    // In a real app, we'd fetch from Supabase
    const timer = setTimeout(() => {
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
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col pt-8">
        <div className="px-6 mb-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">D</div>
          <span className="text-xl font-bold text-primary">BackOffice</span>
        </div>
        
        <nav className="flex-grow">
          <SidebarItem icon={BarChart3} label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <SidebarItem icon={ShoppingBag} label="Orders" active={activeTab === 'Orders'} onClick={() => setActiveTab('Orders')} />
          <SidebarItem icon={Package} label="Inventory" active={activeTab === 'Inventory'} onClick={() => setActiveTab('Inventory')} />
          <SidebarItem icon={CalendarIcon} label="Calendar" active={activeTab === 'Calendar'} onClick={() => setActiveTab('Calendar')} />
          <SidebarItem icon={Users} label="Customers" active={activeTab === 'Customers'} onClick={() => setActiveTab('Customers')} />
          <SidebarItem icon={CreditCard} label="Payments" active={activeTab === 'Payments'} onClick={() => setActiveTab('Payments')} />
        </nav>

        <div className="p-6 border-t">
          <SidebarItem icon={Settings} label="Settings" active={false} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b px-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">{activeTab}</h2>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-primary">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary">Farm Owner</p>
                <p className="text-xs text-gray-500">The New Dawn Farm</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold">FD</div>
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
                <StatCard label="Mortality Rate" value="0.2%" trend="-0.1%" trendUp={true} icon={TrendingDown} />
              </div>

              <div className="grid lg:grid-cols-2 gap-10">
                {/* Recent Orders */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border">
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
                <div className="bg-white p-8 rounded-3xl shadow-sm border">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-primary">Low Stock Alerts</h3>
                    <Plus className="text-primary cursor-pointer hover:rotate-90 transition-transform" />
                  </div>
                  <div className="space-y-4">
                    {inventory.filter(i => i.status === 'Low Stock').map(item => (
                      <div key={item.id} className="p-5 border-2 border-red-100 bg-red-50 rounded-2xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-red-700">{item.item}</p>
                          <p className="text-sm text-red-500">Only {item.stock} {item.unit} left</p>
                        </div>
                        <button className="bg-white text-red-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-red-600 hover:text-white transition-all">
                          Restock
                        </button>
                      </div>
                    ))}
                    <div className="p-5 bg-gray-50 rounded-2xl flex items-center justify-between">
                      <p className="text-gray-600 font-medium">Batch B (Broilers)</p>
                      <p className="font-bold text-primary">95% Ready</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'Overview' && (
            <div className="bg-white p-20 rounded-3xl shadow-sm border text-center text-gray-400">
              <Package size={64} className="mx-auto mb-4 opacity-20" />
              <p className="text-xl font-bold">Section Under Construction</p>
              <p>We're putting the finishing touches on this part of your dashboard.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
