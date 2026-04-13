import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { 
  BarChart3, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings,
  Plus,
  Clock,
  Layout,
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Search,
  CreditCard,
  Calendar,
  LogOut,
  ChevronRight,
  TrendingUp,
  MapPin,
  TrendingDown
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [farmData, setFarmData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // Stats
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    lowStock: 0,
    weeklyRevenue: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch farm owned by user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/admin/login');

      const { data: farm, error: farmErr } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      if (farmErr) {
        console.error("Farm fetch error:", farmErr);
        // If no farm found but is authenticated, maybe they need to create one
        return;
      }
      setFarmData(farm);

      // 2. Fetch testimonials
      const { data: testData } = await supabase
        .from('testimonials')
        .select('*')
        .eq('farm_id', farm.id)
        .order('created_at', { ascending: false });
      setTestimonials(testData || []);

      // 3. Fetch inventory (products)
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('farm_id', farm.id)
        .order('name');
      setInventory(prodData || []);

      // 4. Fetch orders
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('farm_id', farm.id)
        .order('created_at', { ascending: false });
      setOrders(orderData || []);

      // 5. Fetch Gallery
      const { data: galleryData } = await supabase
        .from('site_gallery')
        .select('*')
        .eq('farm_id', farm.id)
        .order('order_index');
      setGallery(galleryData || []);

      // 5. Calculate Stats
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = (orderData || []).filter(o => o.created_at.startsWith(today)).length;
      const pendingOrders = (orderData || []).filter(o => o.status === 'pending').length;
      const lowStock = (prodData || []).filter(p => p.stock_status === 'low_stock' || (p.stock && p.stock < 10)).length;
      const totalRev = (orderData || []).reduce((acc, o) => acc + (o.total_price || 0), 0);

      setStats({
        todayOrders,
        pendingOrders,
        lowStock,
        weeklyRevenue: totalRev // Simplified as cumulative for demo
      });

    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        why_content: farmData.why_content,
        logo_url: farmData.logo_url,
        hero_image_url: farmData.hero_image_url,
        about_image_url: farmData.about_image_url
      }).eq('id', farmData.id);
      if (error) throw error;
      setSaveStatus('Saved Successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error("Update error:", err);
      setSaveStatus('Error Saving');
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setOrders(orders.map(o => o.id === id ? {...o, status: newStatus} : o));
    } catch (err) {
      console.error("Order update error:", err);
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

  // Extract unique customers
  const customers = Array.from(new Set(orders.map(o => o.customer_phone)))
    .map(phone => orders.find(o => o.customer_phone === phone));

  if (loading) return (
    <div style={{ h: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f4ee' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d4d35]"></div>
    </div>
  );

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.brandWrap}>
          <div style={styles.logo}>{farmData?.name?.charAt(0) || 'N'}</div>
          <div>
            <div style={styles.brandTitle}>{farmData?.name || 'The New Dawn'}</div>
            <div style={styles.brandSub}>Poultry Back Office</div>
          </div>
        </div>

        <div style={styles.nav}>
          <button 
            style={{ ...styles.navBtn, ...(activeTab === 'Overview' && styles.navBtnActive) }}
            onClick={() => setActiveTab('Overview')}
          >
            <BarChart3 size={18} style={{ marginRight: '10px' }} /> Overview
          </button>
          <button 
            style={{ ...styles.navBtn, ...(activeTab === 'Orders' && styles.navBtnActive) }}
            onClick={() => setActiveTab('Orders')}
          >
            <ShoppingBag size={18} style={{ marginRight: '10px' }} /> Orders
          </button>
          <button 
            style={{ ...styles.navBtn, ...(activeTab === 'Inventory' && styles.navBtnActive) }}
            onClick={() => setActiveTab('Inventory')}
          >
            <Package size={18} style={{ marginRight: '10px' }} /> Inventory
          </button>
          <button 
             style={{ ...styles.navBtn, ...(activeTab === 'Customers' && styles.navBtnActive) }}
             onClick={() => setActiveTab('Customers')}
          >
            <Users size={18} style={{ marginRight: '10px' }} /> Customers
          </button>
          <button 
            style={{ ...styles.navBtn, ...(activeTab === 'Site Editor' && styles.navBtnActive) }}
            onClick={() => setActiveTab('Site Editor')}
          >
            <Layout size={18} style={{ marginRight: '10px' }} /> Site Editor
          </button>
          <button 
            style={{ ...styles.navBtn, ...(activeTab === 'Testimonials' && styles.navBtnActive) }}
            onClick={() => setActiveTab('Testimonials')}
          >
            <MessageSquare size={18} style={{ marginRight: '10px' }} /> Testimonials
          </button>
          <button 
            style={{ ...styles.navBtn, ...(activeTab === 'Billing' && styles.navBtnActive) }}
            onClick={() => setActiveTab('Billing')}
          >
            <CreditCard size={18} style={{ marginRight: '10px' }} /> Billing
          </button>
          <button 
            style={{ ...styles.navBtn, ...(activeTab === 'Settings' && styles.navBtnActive) }}
            onClick={() => setActiveTab('Settings')}
          >
            <Settings size={18} style={{ marginRight: '10px' }} /> Settings
          </button>
        </div>

        <div style={styles.sidebarCard}>
          <div style={styles.sidebarCardTitle}>Farm Admin Panel</div>
          <div style={styles.sidebarCardText}>
            Manage poultry orders, stock, customers, and site content in one place.
          </div>
        </div>

        <div style={styles.profileSection}>
           <div style={styles.profileInfo}>
              <div style={styles.profileAvatar}>{farmData?.name?.charAt(0) || 'U'}</div>
              <div>
                 <div style={styles.profileName}>{farmData?.name || 'User'}</div>
                 <div style={styles.profileRoll}>Owner</div>
              </div>
           </div>
           <button 
             onClick={async () => {
                await supabase.auth.signOut();
                navigate('/admin/login');
             }} 
             style={styles.logoutBtn}
           >
              <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.kicker}>Farm Operations Dashboard</div>
            <h1 style={styles.pageTitle}>{!farmData ? "Onboarding" : activeTab}</h1>
          </div>

          <div style={styles.topbarActions}>
            <input
              type="text"
              placeholder="Search..."
              readOnly
              style={styles.search}
            />
            {saveStatus && <span style={styles.saveStatus}>{saveStatus}</span>}
            <button style={styles.outlineBtn}>Export</button>
            <button style={styles.primaryBtn} onClick={() => fetchData()}>Refresh Data</button>
          </div>
        </div>

        {!farmData ? (
          <section style={styles.panel}>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Layout size={48} style={{ color: '#1d4d35', marginBottom: '20px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px' }}>Welcome! Let's set up your Farm.</h2>
              <p style={{ ...styles.rowSub, maxWidth: '400px', margin: '0 auto 30px' }}>
                You're logged in, but you haven't linked or created a farm site yet. 
                Enter a name for your shop to get started.
              </p>
              
              <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', gap: '10px' }}>
                 <input 
                   placeholder="Farm Name (e.g. The New Dawn)" 
                   style={styles.input} 
                   id="newFarmName"
                 />
                 <button 
                   style={styles.primaryBtn}
                   onClick={async () => {
                      const name = document.getElementById('newFarmName').value;
                      if (!name) return;
                      const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                      
                      const { data: { user } } = await supabase.auth.getUser();
                      
                      const { data, error } = await supabase.from('farms').insert({
                        name,
                        slug,
                        owner_id: user.id,
                        branding: {
                          primary_color: "#1d4d35",
                          secondary_color: "#fcfaf5",
                          accent_color: "#8b6b2f",
                          hero_headline: "Fresh Poultry. Trusted Farm. Delivered to You."
                        }
                      }).select().single();
                      
                      if (data) setFarmData(data);
                   }}
                 >
                   Create My Farm
                 </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            {activeTab === 'Overview' && (
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Today's Orders</div>
                <div style={styles.statValue}>{stats.todayOrders}</div>
                <div style={styles.statNote}>Real-time update</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Pending Orders</div>
                <div style={styles.statValue}>{stats.pendingOrders}</div>
                <div style={styles.statNote}>Needs confirmation</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Low Stock Items</div>
                <div style={styles.statValue}>{stats.lowStock}</div>
                <div style={styles.statNote}>Check inventory</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Revenue</div>
                <div style={styles.statValue}>R{stats.weeklyRevenue.toLocaleString()}</div>
                <div style={styles.statNote}>All time</div>
              </div>
            </div>

            <div style={styles.twoCol}>
              <section style={styles.panel}>
                <div style={styles.panelHead}>
                  <h3 style={styles.panelTitle}>Recent Orders</h3>
                  <button style={styles.linkBtn} onClick={() => setActiveTab('Orders')}>View all</button>
                </div>

                <div style={styles.simpleList}>
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} style={styles.simpleRow}>
                      <div>
                        <div style={styles.rowStrong}>{order.order_number}</div>
                        <div style={styles.rowSub}>{order.customer_name} • {order.fulfillment_method}</div>
                      </div>
                      <div style={styles.rowRight}>
                        <span style={{ 
                          ...styles.pill, 
                          ...(order.status === 'pending' ? styles.pillPending : 
                             order.status === 'confirmed' ? styles.pillGreen : styles.pillBlue) 
                        }}>
                          {order.status}
                        </span>
                        <div style={styles.rowSub}>R{order.total_price}</div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p style={styles.rowSub}>No orders found yet.</p>}
                </div>
              </section>

              <section style={styles.panel}>
                <div style={styles.panelHead}>
                  <h3 style={styles.panelTitle}>Low Stock Alerts</h3>
                  <button style={styles.linkBtn} onClick={() => setActiveTab('Inventory')}>Manage stock</button>
                </div>

                <div style={styles.simpleList}>
                  {inventory.filter(i => i.stock < 20 || i.stock_status === 'low_stock').map(item => (
                    <div key={item.id} style={styles.simpleRow}>
                      <div>
                        <div style={styles.rowStrong}>{item.name}</div>
                        <div style={styles.rowSub}>{item.category}</div>
                      </div>
                      <div style={styles.rowRight}>
                        <span style={{ 
                          ...styles.pill, 
                          ...(item.stock_status === 'out_of_stock' ? styles.pillRed : styles.pillPending) 
                        }}>
                          {item.stock_status.replace('_', ' ')}
                        </span>
                        <div style={styles.rowSub}>{item.stock || 0} units</div>
                      </div>
                    </div>
                  ))}
                  {inventory.filter(i => i.stock < 20 || i.stock_status === 'low_stock').length === 0 && (
                    <p style={styles.rowSub}>All products are well stocked.</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === 'Orders' && (
          <section style={styles.panel}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>Orders Management</h3>
              <div style={styles.actionRow}>
                <button style={styles.outlineBtn}>Filter</button>
                <button style={styles.primaryBtn} onClick={() => window.open(`https://poultry-central.vercel.app/${farmData.slug}/order`, '_blank')}>+ Place Test Order</button>
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Order ID</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Payment</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={styles.td}>{order.order_number}</td>
                      <td style={styles.td}>
                        <div>
                          <div style={styles.rowStrong}>{order.customer_name}</div>
                          <div style={styles.rowSub}>{order.customer_phone}</div>
                        </div>
                      </td>
                      <td style={styles.td}>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td style={styles.td}>R{order.total_price}</td>
                      <td style={styles.td}>{order.fulfillment_method}</td>
                      <td style={styles.td}>
                        <span style={{ 
                          ...styles.pill, 
                          ...(order.status === 'pending' ? styles.pillPending : 
                             order.status === 'confirmed' ? styles.pillGreen : styles.pillBlue) 
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ 
                          ...styles.pill, 
                          ...(order.payment_status === 'paid' ? styles.pillGreen : styles.pillRed) 
                        }}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.tableBtns}>
                          {order.status === 'pending' && <button style={styles.tinyBtn} onClick={() => updateOrderStatus(order.id, 'confirmed')}>Confirm</button>}
                          {order.status === 'confirmed' && <button style={styles.tinyBtn} onClick={() => updateOrderStatus(order.id, 'delivered')}>Deliver</button>}
                          <button style={styles.tinyBtn} onClick={() => window.open(`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}`, '_blank')}>WhatsApp</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'Inventory' && (
          <section style={styles.panel}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>Inventory Management</h3>
              <button 
                style={styles.primaryBtn}
                onClick={async () => {
                  const name = window.prompt("Product Name:");
                  if (!name) return;
                  const price = window.prompt("Price (R):");
                  const category = window.prompt("Category (Live, Eggs, Meat):");
                  
                  const { data, error } = await supabase.from('products').insert({
                    farm_id: farmData.id,
                    name,
                    price: parseFloat(price),
                    category,
                    stock_status: 'in_stock'
                  }).select().single();
                  
                  if (data) setInventory([...inventory, data]);
                }}
              >
                + Add Product
              </button>
            </div>

            <div style={styles.inventoryGrid}>
              {inventory.map(item => (
                <div key={item.id} style={styles.inventoryCard}>
                  <div style={styles.inventoryTop}>
                    <div>
                      <div style={styles.cardTitle}>{item.name}</div>
                      <div style={styles.rowSub}>{item.category}</div>
                    </div>
                    <span style={{ 
                      ...styles.pill, 
                      ...(item.stock_status === 'in_stock' ? styles.pillGreen : 
                        item.stock_status === 'out_of_stock' ? styles.pillRed : styles.pillPending) 
                    }}>
                      {item.stock_status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={styles.inventoryCount}>{item.stock || 0} units</div>
                  <div style={{ ...styles.rowSub, marginTop: '10px' }}>Price: R{item.price}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'Customers' && (
          <section style={styles.panel}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>Customer Database</h3>
              <button style={styles.outlineBtn}>Export List</button>
            </div>

            <div style={styles.customerGrid}>
              {customers.map(cust => (
                <div key={cust.id} style={styles.customerCard}>
                  <div style={styles.avatar}>{cust.customer_name.charAt(0)}</div>
                  <div style={styles.cardTitle}>{cust.customer_name}</div>
                  <div style={styles.rowStrong}>{cust.customer_phone}</div>
                  <div style={styles.rowSub}>{cust.delivery_address || 'Collection Customer'}</div>
                  <div style={{ ...styles.rowSub, marginTop: '10px', color: '#1d4d35', fontWeight: 700 }}>
                    Orders: {orders.filter(o => o.customer_phone === cust.customer_phone).length}
                  </div>
                </div>
              ))}
              {customers.length === 0 && <p style={styles.rowSub}>No customers recorded yet.</p>}
            </div>
          </section>
        )}

        {activeTab === 'Site Editor' && (
           <section style={styles.panel}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>Content & Branding</h3>
              <p style={styles.rowSub}>Update your landing page content instantly.</p>
            </div>

            <form onSubmit={handleUpdateFarm} style={styles.formGrid}>
               <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Farm Name / Site Title</label>
                    <input 
                      style={styles.input}
                      value={farmData?.name || ''} 
                      onChange={(e) => setFarmData({...farmData, name: e.target.value})}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Logo URL</label>
                    <input 
                      style={styles.input}
                      placeholder="https://..."
                      value={farmData?.logo_url || ''} 
                      onChange={(e) => setFarmData({...farmData, logo_url: e.target.value})}
                    />
                  </div>
               </div>

               <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Hero Headline</label>
                    <input 
                      style={styles.input}
                      value={farmData?.branding?.hero_headline || ''} 
                      onChange={(e) => setFarmData({...farmData, branding: {...farmData.branding, hero_headline: e.target.value}})}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Hero Image URL</label>
                    <input 
                      style={styles.input}
                      placeholder="https://..."
                      value={farmData?.hero_image_url || ''} 
                      onChange={(e) => setFarmData({...farmData, hero_image_url: e.target.value})}
                    />
                  </div>
               </div>

               <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Our Story / About</label>
                    <textarea 
                      style={{ ...styles.input, height: '120px', resize: 'none' }}
                      value={farmData?.about_story || ''} 
                      onChange={(e) => setFarmData({...farmData, about_story: e.target.value})}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>About Image URL</label>
                    <input 
                      style={styles.input}
                      placeholder="https://..."
                      value={farmData?.about_image_url || ''} 
                      onChange={(e) => setFarmData({...farmData, about_image_url: e.target.value})}
                    />
                  </div>
               </div>

               <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>WhatsApp Number</label>
                    <input 
                      style={styles.input}
                      value={farmData?.contact_info?.whatsapp || ''} 
                      onChange={(e) => setFarmData({...farmData, contact_info: {...farmData.contact_info, whatsapp: e.target.value}})}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Address</label>
                    <input 
                      style={styles.input}
                      value={farmData?.contact_info?.address || ''} 
                      onChange={(e) => setFarmData({...farmData, contact_info: {...farmData.contact_info, address: e.target.value}})}
                    />
                  </div>
               </div>

               <div style={{ marginTop: '40px', borderTop: '1px solid #e5ddd0', pt: '30px' }}>
                  <h4 style={{ ...styles.panelTitle, marginBottom: '10px' }}>Site Gallery</h4>
                  <p style={styles.rowSub}>Showcase your farm with beautiful photos on the landing page.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
                    {gallery.map(img => (
                      <div key={img.id} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '120px', border: '1px solid #e5ddd0' }}>
                        <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
                        <button 
                          onClick={async () => {
                            await supabase.from('site_gallery').delete().eq('id', img.id);
                            setGallery(gallery.filter(g => g.id !== img.id));
                          }}
                          style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={async () => {
                        const url = window.prompt("Enter Image URL:");
                        if (!url) return;
                        const { data, error } = await supabase.from('site_gallery').insert({ 
                          farm_id: farmData.id, 
                          image_url: url 
                        }).select().single();
                        if (data) setGallery([...gallery, data]);
                      }}
                      style={{ height: '120px', border: '2px dashed #d8d0c1', borderRadius: '14px', background: '#fcfaf5', color: '#8b6b2f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                      <Plus size={24} />
                      <span style={{ fontSize: '11px', fontWeight: 800 }}>Add Photo</span>
                    </button>
                  </div>
               </div>

               <div style={{ marginTop: '20px', borderTop: '1px solid #e5ddd0', paddingTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={styles.primaryBtnLarge}>
                    <Save size={18} style={{ marginRight: '8px' }} /> Save Design Changes
                  </button>
               </div>
            </form>
          </section>
        )}

        {activeTab === 'Testimonials' && (
          <section style={styles.panel}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>Testimonials</h3>
              <button 
                style={styles.primaryBtn}
                onClick={async () => {
                  const author_name = window.prompt("Author Name:");
                  if (!author_name) return;
                  const quote = window.prompt("Quote:");
                  const author_role = window.prompt("Role (Customer, Reseller, etc):");
                  
                  const { data, error } = await supabase.from('testimonials').insert({
                    farm_id: farmData.id,
                    author_name,
                    quote,
                    author_role,
                    is_active: true
                  }).select().single();
                  
                  if (data) setTestimonials([...testimonials, data]);
                }}
              >
                + Add Review
              </button>
            </div>

            <div style={styles.customerGrid}>
              {testimonials.map(test => (
                <div key={test.id} style={{ ...styles.customerCard, opacity: test.is_active ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', justifySelf: 'space-between', marginBottom: '15px', width: '100%', justifyContent: 'space-between' }}>
                    <div style={styles.avatar}>{test.author_name.charAt(0)}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => toggleTestimonial(test.id, test.is_active)}
                        style={{ ...styles.tinyBtn, background: test.is_active ? '#e6f5ea' : '#fff' }}
                      >
                        {test.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={() => deleteTestimonial(test.id)}
                        style={{ ...styles.tinyBtn, color: '#b24134' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div style={styles.cardTitle}>{test.author_name}</div>
                  <div style={{ ...styles.rowSub, fontWeight: 700, color: '#1d4d35' }}>{test.author_role}</div>
                  <p style={{ ...styles.rowSub, marginTop: '10px', fontStyle: 'italic' }}>"{test.quote}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'Billing' && (
          <section style={styles.panel}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>SaaS Billing & Subscriptions</h3>
              <span style={{ 
                ...styles.pill, 
                ...(farmData?.subscription_status === 'active' ? styles.pillGreen : styles.pillRed) 
              }}>
                {farmData?.subscription_status || 'Trial'}
              </span>
            </div>

            <div style={styles.twoCol}>
              <div style={{ ...styles.panel, background: '#fcfaf5', border: '1px dashed #d8d0c1' }}>
                <h4 style={{ ...styles.rowStrong, fontSize: '18px', marginBottom: '15px' }}>Current Plan</h4>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#1d4d35' }}>R400 <span style={{ fontSize: '14px', color: '#66756d' }}>/ month</span></div>
                <p style={{ ...styles.rowSub, marginTop: '20px' }}>
                  Includes full access to the Poultry Back Office, Site Editor, and Stock Management tools.
                </p>
                <div style={{ marginTop: '30px' }}>
                   {!farmData?.setup_fee_paid && (
                     <div style={{ background: '#fff1cc', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #e5c07b' }}>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#8b6500' }}>Setup Fee Pending</div>
                        <div style={{ fontSize: '24px', fontWeight: 900, color: '#183126' }}>R2,500.00</div>
                     </div>
                   )}
                   <button style={{ ...styles.primaryBtnLarge, width: '100%' }}>
                     <CreditCard size={18} style={{ marginRight: '10px' }} /> Update Payment Method
                   </button>
                </div>
              </div>

              <div style={styles.simpleList}>
                <h4 style={styles.rowStrong}>Payment History</h4>
                <div style={styles.simpleRow}>
                   <div>
                      <div style={styles.rowStrong}>Setup Fee</div>
                      <div style={styles.rowSub}>One-time activation</div>
                   </div>
                   <div style={styles.rowRight}>
                      <div style={styles.rowStrong}>R2,500</div>
                      <div style={styles.pillRed}>Unpaid</div>
                   </div>
                </div>
                <div style={styles.simpleRow}>
                   <div>
                      <div style={styles.rowStrong}>Monthly Subscription</div>
                      <div style={styles.rowSub}>April 2024</div>
                   </div>
                   <div style={styles.rowRight}>
                      <div style={styles.rowStrong}>R400</div>
                      <div style={styles.pillRed}>Pending</div>
                   </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', opacity: 0.2 }}>
            <Settings size={64} />
            <p style={{ fontSize: '24px', fontWeight: 800, marginTop: '20px' }}>Settings Under Construction</p>
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    background: "#f7f4ee",
    color: "#183126",
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  sidebar: {
    background: "#143728",
    color: "#eef5f1",
    padding: "24px 18px",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid rgba(255,255,255,0.08)",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "28px",
  },
  logo: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    background: "#d5b66f",
    color: "#143728",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "18px",
  },
  brandTitle: {
    fontWeight: 800,
    fontSize: "18px",
  },
  brandSub: {
    color: "#b7c9c0",
    fontSize: "13px",
    marginTop: "4px",
  },
  nav: {
    display: "grid",
    gap: "4px",
  },
  navBtn: {
    border: "none",
    background: "transparent",
    color: "#dfe9e4",
    textAlign: "left",
    padding: "10px 14px",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
  },
  navBtnActive: {
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
  },
  sidebarCard: {
    marginTop: "auto",
    background: "rgba(255,255,255,0.08)",
    padding: "18px",
    borderRadius: "18px",
  },
  sidebarCardTitle: {
    fontWeight: 800,
    marginBottom: "10px",
  },
  sidebarCardText: {
    color: "#c9d8d1",
    fontSize: "13px",
    lineHeight: 1.6,
  },
  main: {
    padding: "28px",
    display: "grid",
    gap: "22px",
    overflowY: 'auto',
    maxHeight: '100vh',
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: '10px'
  },
  kicker: {
    margin: "0 0 6px",
    fontSize: "11px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#8b6b2f",
    fontWeight: 800,
  },
  pageTitle: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.1,
    fontWeight: 900,
  },
  topbarActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  search: {
    minWidth: "250px",
    padding: "12px 16px",
    border: "1px solid #d8d0c1",
    borderRadius: "14px",
    background: "#fff",
    outline: "none",
    fontSize: '14px',
  },
  primaryBtn: {
    border: "none",
    borderRadius: "12px",
    padding: "10px 16px",
    background: "#1d4d35",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: '13px',
  },
  primaryBtnLarge: {
    border: "none",
    borderRadius: "14px",
    padding: "16px 24px",
    background: "#1d4d35",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    display: 'flex',
    alignItems: 'center',
  },
  outlineBtn: {
    border: "1px solid #d8d0c1",
    borderRadius: "12px",
    padding: "10px 16px",
    background: "#fff",
    color: "#183126",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: '13px',
  },
  linkBtn: {
    border: "none",
    background: "transparent",
    color: "#1d4d35",
    fontWeight: 800,
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "18px",
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e5ddd0",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
  },
  statLabel: {
    color: "#5f6c65",
    fontWeight: 600,
    marginBottom: "10px",
    fontSize: '13px',
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 900,
    marginBottom: "10px",
  },
  statNote: {
    color: "#7a867f",
    fontSize: "12px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "22px",
  },
  panel: {
    background: "#fff",
    border: "1px solid #e5ddd0",
    borderRadius: "24px",
    padding: "22px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.04)",
  },
  panelHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  panelTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 900,
  },
  simpleList: {
    display: "grid",
    gap: "14px",
  },
  simpleRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #efe8dc",
  },
  rowStrong: {
    fontWeight: 800,
  },
  rowSub: {
    marginTop: "4px",
    color: "#66756d",
    fontSize: "13px",
  },
  rowRight: {
    textAlign: "right",
  },
  pill: {
    display: "inline-block",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "10px",
    fontWeight: 800,
    whiteSpace: "nowrap",
    textTransform: 'uppercase',
  },
  pillPending: {
    background: "#fff1cc",
    color: "#8b6500",
  },
  pillGreen: {
    background: "#e6f5ea",
    color: "#1f7a37",
  },
  pillBlue: {
    background: "#e6eefc",
    color: "#2451b8",
  },
  pillRed: {
    background: "#fde9e7",
    color: "#b24134",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    fontSize: "12px",
    color: "#6f7b74",
    fontWeight: 800,
    padding: "12px 10px",
    borderBottom: "1px solid #e9e2d7",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 10px",
    borderBottom: "1px solid #f1ebe1",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    fontSize: '13px',
  },
  tableBtns: {
    display: "flex",
    gap: "8px",
  },
  tinyBtn: {
    border: "1px solid #d9d1c4",
    background: "#fff",
    color: "#183126",
    borderRadius: "10px",
    padding: "6px 10px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: '10px',
  },
  inventoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
  },
  inventoryCard: {
    border: "1px solid #e9e1d5",
    borderRadius: "22px",
    padding: "20px",
    background: "#fcfbf8",
  },
  inventoryTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "18px",
  },
  inventoryCount: {
    fontSize: "24px",
    fontWeight: 900,
    color: "#183126",
  },
  customerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  },
  customerCard: {
    background: "#fcfbf8",
    border: "1px solid #e9e1d5",
    borderRadius: "22px",
    padding: "20px",
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#1d4d35",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: '18px',
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 800,
    marginBottom: "4px",
  },
  saveStatus: {
    padding: '8px 16px',
    background: '#1d4d35',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 800,
  },
  formGrid: {
    display: 'grid',
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 800,
    color: '#1d4d35',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '12px 14px',
    border: '1px solid #d8d0c1',
    borderRadius: '14px',
    background: '#fcfaf5',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  profileSection: {
    marginTop: 'auto',
    padding: '20px',
    borderTop: '1px solid #e5ddd0',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  profileAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    background: '#1d4d35',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: '14px',
  },
  profileName: {
    fontSize: '13px',
    fontWeight: 800,
    color: '#183126',
  },
  profileRoll: {
    fontSize: '11px',
    color: '#66756d',
    fontWeight: 600,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    borderRadius: '12px',
    border: '1px solid #d8d0c1',
    background: '#fff',
    color: '#183126',
    fontSize: '12px',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};

export default Dashboard;
