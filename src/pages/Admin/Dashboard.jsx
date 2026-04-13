import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { 
  BarChart3, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings,
  Plus,
  Layout,
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  Save,
  CreditCard,
  LogOut,
  ChevronDown,
  User,
  Lock,
  Shield,
  Bell,
  Truck,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
} from 'lucide-react';
import { uploadShopAsset, deleteOldAsset } from '../../services/supabase';

// Audio alert for new orders / arrivals
const playDing = () => {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
  } catch (e) { /* silent */ }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [farmData, setFarmData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [isUploading, setIsUploading] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString());
  const [showBillingModal, setShowBillingModal] = useState(false);

  // ─── Security Vault State ─────────────────────────────────
  const [showVault, setShowVault] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultPassword, setVaultPassword] = useState('');
  const [vaultError, setVaultError] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [vaultTimer, setVaultTimer] = useState(20);
  const [vaultActiveSection, setVaultActiveSection] = useState(null);
  const [isSavingVault, setIsSavingVault] = useState(false);

  // ─── Live Order Board State ──────────────────────────────
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'delivery' | 'collection'
  const [arrivalAlert, setArrivalAlert] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Stats
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    lowStock: 0,
    weeklyRevenue: 0
  });

  // ─── Clock ───────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(t);
  }, []);

  // ─── Vault Auto-Lock Timer ───────────────────────────────
  useEffect(() => {
    if (!isVaultUnlocked) return;
    setVaultTimer(20);

    const countdown = setInterval(() => {
      setVaultTimer(prev => {
        if (prev <= 1) {
          setIsVaultUnlocked(false);
          setVaultActiveSection(null);
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const resetTimer = () => setVaultTimer(20);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      clearInterval(countdown);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [isVaultUnlocked]);

  // ─── Real-time Order Subscriptions ──────────────────────
  useEffect(() => {
    if (!farmData?.id) return;

    const channel = supabase
      .channel('public:orders:poultry')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const updated = payload.new;
        setOrders(curr => {
          const existing = curr.find(o => o.id === updated.id);
          if (existing && updated.customer_arrived && !existing.customer_arrived) {
            playDing();
            setArrivalAlert(updated);
            setTimeout(() => setArrivalAlert(null), 12000);
          }
          if (existing && updated.status === 'paid' && existing.status !== 'paid') playDing();
          return curr.map(o => o.id === updated.id ? { ...o, ...updated } : o);
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new;
        if (newOrder.farm_id !== farmData.id) return;
        if (newOrder.status === 'paid') playDing();
        setOrders(curr => [newOrder, ...curr]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [farmData?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/admin/login');
      setUserEmail(user.email || '');

      const { data: farm, error: farmErr } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      if (farmErr) { console.error('Farm fetch error:', farmErr); return; }
      setFarmData(farm);

      const { data: testData } = await supabase.from('testimonials').select('*').eq('farm_id', farm.id).order('created_at', { ascending: false });
      setTestimonials(testData || []);

      const { data: prodData } = await supabase.from('products').select('*').eq('farm_id', farm.id).order('name');
      setInventory(prodData || []);

      const { data: orderData } = await supabase.from('orders').select('*').eq('farm_id', farm.id).order('created_at', { ascending: false });
      setOrders(orderData || []);

      const { data: galleryData } = await supabase.from('site_gallery').select('*').eq('farm_id', farm.id).order('order_index');
      setGallery(galleryData || []);

      const today = new Date().toISOString().split('T')[0];
      setStats({
        todayOrders: (orderData || []).filter(o => o.created_at.startsWith(today)).length,
        pendingOrders: (orderData || []).filter(o => o.status === 'pending').length,
        lowStock: (prodData || []).filter(p => p.stock_status === 'low_stock' || (p.stock && p.stock < 10)).length,
        weeklyRevenue: (orderData || []).reduce((acc, o) => acc + (o.total_price || 0), 0),
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
        about_image_url: farmData.about_image_url,
        primary_color: farmData.primary_color,
        business_config: farmData.business_config,
      }).eq('id', farmData.id);
      if (error) throw error;
      setSaveStatus('Saved ✓');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('Error saving');
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsUploading(type);
      const oldUrl = farmData[`${type}_url`] || farmData[type];
      const publicUrl = await uploadShopAsset(file, farmData.id, type);
      if (oldUrl && oldUrl.includes('supabase.co')) await deleteOldAsset(oldUrl);
      const updateData = { ...farmData };
      if (type === 'logo') updateData.logo_url = publicUrl;
      else if (type === 'hero_image') updateData.hero_image_url = publicUrl;
      else if (type === 'about_image') updateData.about_image_url = publicUrl;
      setFarmData(updateData);
      setSaveStatus('Image Uploaded ✓');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus('Upload Failed');
    } finally {
      setIsUploading(null);
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Order update error:', err);
    }
  };

  const toggleTestimonial = async (id, currentStatus) => {
    try {
      await supabase.from('testimonials').update({ is_active: !currentStatus }).eq('id', id);
      setTestimonials(testimonials.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t));
    } catch (err) { console.error(err); }
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    setTestimonials(testimonials.filter(t => t.id !== id));
  };

  // ─── Live Order Board Helpers ────────────────────────────
  const filteredOrders = orders.filter(o => {
    const matchSearch = !orderSearchQuery || 
      o.order_number?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(orderSearchQuery.toLowerCase());
    const matchFilter = orderFilter === 'all' || o.fulfillment_method === orderFilter;
    return matchSearch && matchFilter;
  });

  const pendingOrders  = filteredOrders.filter(o => o.status === 'pending');
  const confirmedOrders = filteredOrders.filter(o => o.status === 'confirmed');
  const deliveryOrders = filteredOrders.filter(o => o.status === 'out_for_delivery' || o.status === 'delivered');

  const customers = Array.from(new Set(orders.map(o => o.customer_phone)))
    .map(phone => orders.find(o => o.customer_phone === phone));

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f4ee' }}>
      <Loader2 size={32} style={{ color: '#1d4d35', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={styles.page}>

      {/* ── ARRIVAL ALERT TOAST ─────────────────────────────── */}
      {arrivalAlert && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1d4d35', color: '#fff', padding: '1.25rem 2.5rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(29,77,53,0.4)', zIndex: 9999, textAlign: 'center', border: '2px solid #d5b66f' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>🚜 CUSTOMER HAS ARRIVED!</div>
          <div style={{ fontSize: '1rem', marginTop: '4px', opacity: 0.85, marginBottom: '1.5rem' }}>Order {arrivalAlert.order_number} — {arrivalAlert.customer_name} is waiting</div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={() => { setActiveTab('LiveOrders'); setArrivalAlert(null); }}
              style={{ padding: '0.75rem 1.5rem', background: '#d5b66f', color: '#1d4d35', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              View on Order Board
            </button>
            <button 
              onClick={() => setArrivalAlert(null)}
              style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── SECURITY VAULT OVERLAY ───────────────────────────── */}
      {showVault && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,30,20,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', borderRadius: '28px', padding: '2.5rem', maxWidth: '560px', width: '92%', boxShadow: '0 25px 60px rgba(0,0,0,0.25)', border: '2px solid #d8d0c1' }}>
            {/* Timer Bar */}
            {isVaultUnlocked && (
              <div style={{ height: '4px', background: '#e5ddd0', borderRadius: '4px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: vaultTimer < 5 ? '#dc2626' : '#1d4d35', width: `${(vaultTimer / 20) * 100}%`, transition: 'width 1s linear, background 0.3s' }} />
              </div>
            )}

            {/* Vault Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#1d4d35', borderRadius: '12px', padding: '8px', display: 'flex' }}>
                  <Shield size={20} style={{ color: '#d5b66f' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#183126' }}>High-Security Vault</h2>
                  {isVaultUnlocked && (
                    <small style={{ color: vaultTimer < 5 ? '#dc2626' : '#66756d' }}>Auto-locking in {vaultTimer}s{vaultActiveSection && ` · ${vaultActiveSection.toUpperCase()}`}</small>
                  )}
                </div>
              </div>
              <button onClick={() => { setShowVault(false); setIsVaultUnlocked(false); setVaultActiveSection(null); }} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#66756d' }}>✕</button>
            </div>

            {/* Locked State */}
            {!isVaultUnlocked ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
                <h3 style={{ color: '#183126', marginBottom: '0.5rem' }}>Vault Access Required</h3>
                <p style={{ color: '#66756d', fontSize: '0.875rem', marginBottom: '2rem' }}>Enter your account password to view and edit API keys. This session auto-locks after 20 seconds of inactivity.</p>
                {vaultError && (
                  <div style={{ background: '#fde9e7', color: '#b24134', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    ❌ {vaultError}
                  </div>
                )}
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setUnlocking(true);
                  setVaultError('');
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: vaultPassword });
                    if (error) throw error;
                    setIsVaultUnlocked(true);
                    setVaultPassword('');
                  } catch {
                    setVaultError('Invalid password. Access denied.');
                  } finally {
                    setUnlocking(false);
                  }
                }} style={{ maxWidth: '280px', margin: '0 auto' }}>
                  <input type="password" style={{ ...styles.input, textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', marginBottom: '1rem' }}
                    placeholder="••••••••" required autoFocus value={vaultPassword} onChange={e => setVaultPassword(e.target.value)} />
                  <button type="submit" disabled={unlocking} style={{ ...styles.primaryBtnLarge, width: '100%', justifyContent: 'center' }}>
                    <Lock size={16} style={{ marginRight: '8px' }} /> {unlocking ? 'Unlocking...' : 'Open Vault'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {/* Vault Category Grid */}
                {!vaultActiveSection ? (
                  <>
                    <p style={{ ...styles.rowSub, marginBottom: '1.5rem' }}>Select a category to manage your secure integration settings.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      {[
                        { id: 'paystack', icon: '💳', label: 'Paystack', sub: 'Payment processing keys' },
                        { id: 'netcash', icon: '💸', label: 'Netcash', sub: 'Alternative payments' },
                        { id: 'domains', icon: '🌐', label: 'Custom Domain', sub: 'Branding URL' },
                        { id: 'whatsapp', icon: '📲', label: 'WhatsApp Bot', sub: 'Notification tokens' },
                      ].map(item => (
                        <button key={item.id} onClick={() => setVaultActiveSection(item.id)} style={{ background: '#fcfaf5', border: '1px solid #e5ddd0', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', gap: '6px' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#1d4d35'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#e5ddd0'}>
                          <div style={{ fontSize: '1.75rem' }}>{item.icon}</div>
                          <div style={{ fontWeight: 800, color: '#183126', fontSize: '0.95rem' }}>{item.label}</div>
                          <div style={{ color: '#66756d', fontSize: '0.78rem' }}>{item.sub}</div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <button onClick={() => setVaultActiveSection(null)} style={{ background: '#f4f1eb', border: 'none', color: '#66756d', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem' }}>
                      ← Back
                    </button>

                    {/* Paystack */}
                    {vaultActiveSection === 'paystack' && (
                      <div>
                        <h3 style={{ ...styles.panelTitle, marginBottom: '1.25rem' }}>💳 Paystack Settings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Public Key</label>
                            <input style={styles.input} type="text" placeholder="pk_live_..." value={farmData?.paystack_public_key || ''} onChange={e => setFarmData({ ...farmData, paystack_public_key: e.target.value })} />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Secret Key</label>
                            <input style={styles.input} type="password" placeholder="sk_live_..." value={farmData?.paystack_secret_key || ''} onChange={e => setFarmData({ ...farmData, paystack_secret_key: e.target.value })} />
                          </div>
                          <button disabled={isSavingVault} style={{ ...styles.primaryBtnLarge, background: '#1d4d35' }} onClick={async () => {
                            setIsSavingVault(true);
                            const { error } = await supabase.from('farms').update({ paystack_public_key: farmData.paystack_public_key, paystack_secret_key: farmData.paystack_secret_key }).eq('id', farmData.id);
                            setIsSavingVault(false);
                            if (error) alert('Save failed: ' + error.message);
                            else alert('Paystack keys saved! 💳');
                          }}>
                            <Save size={16} style={{ marginRight: '8px' }} /> {isSavingVault ? 'Saving...' : 'Save Paystack Keys'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Netcash */}
                    {vaultActiveSection === 'netcash' && (
                      <div>
                        <h3 style={{ ...styles.panelTitle, marginBottom: '1.25rem' }}>💸 Netcash Settings</h3>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Account Service Key</label>
                          <input style={styles.input} type="text" placeholder="Enter Netcash key" value={farmData?.netcash_config?.account_service_key || ''} onChange={e => setFarmData({ ...farmData, netcash_config: { ...farmData.netcash_config, account_service_key: e.target.value } })} />
                        </div>
                        <button disabled={isSavingVault} style={{ ...styles.primaryBtnLarge, background: '#1d4d35', marginTop: '1rem' }} onClick={async () => {
                          setIsSavingVault(true);
                          const { error } = await supabase.from('farms').update({ netcash_config: farmData.netcash_config }).eq('id', farmData.id);
                          setIsSavingVault(false);
                          if (error) alert('Save failed: ' + error.message);
                          else alert('Netcash settings saved! 💸');
                        }}>
                          <Save size={16} style={{ marginRight: '8px' }} /> {isSavingVault ? 'Saving...' : 'Save Netcash Key'}
                        </button>
                      </div>
                    )}

                    {/* Domains */}
                    {vaultActiveSection === 'domains' && (
                      <div>
                        <h3 style={{ ...styles.panelTitle, marginBottom: '1.25rem' }}>🌐 Custom Domain</h3>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Your Custom Domain</label>
                          <input style={styles.input} type="text" placeholder="yourfarm.co.za" value={farmData?.custom_domain || ''} onChange={e => setFarmData({ ...farmData, custom_domain: e.target.value })} />
                        </div>
                        <button disabled={isSavingVault} style={{ ...styles.primaryBtnLarge, background: '#1d4d35', marginTop: '1rem' }} onClick={async () => {
                          setIsSavingVault(true);
                          const { error } = await supabase.from('farms').update({ custom_domain: farmData.custom_domain }).eq('id', farmData.id);
                          setIsSavingVault(false);
                          if (error) alert('Save failed: ' + error.message);
                          else alert('Domain saved! 🌐');
                        }}>
                          <Save size={16} style={{ marginRight: '8px' }} /> {isSavingVault ? 'Saving...' : 'Save Domain'}
                        </button>
                      </div>
                    )}

                    {/* WhatsApp */}
                    {vaultActiveSection === 'whatsapp' && (
                      <div>
                        <h3 style={{ ...styles.panelTitle, marginBottom: '1.25rem' }}>📲 WhatsApp Bot</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>API Token</label>
                            <input style={styles.input} type="password" placeholder="Enter your WhatsApp API token" value={farmData?.whatsapp_config?.api_token || ''} onChange={e => setFarmData({ ...farmData, whatsapp_config: { ...farmData.whatsapp_config, api_token: e.target.value } })} />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Phone Number ID</label>
                            <input style={styles.input} type="text" placeholder="Meta Phone Number ID" value={farmData?.whatsapp_config?.phone_number_id || ''} onChange={e => setFarmData({ ...farmData, whatsapp_config: { ...farmData.whatsapp_config, phone_number_id: e.target.value } })} />
                          </div>
                          <button disabled={isSavingVault} style={{ ...styles.primaryBtnLarge, background: '#1d4d35' }} onClick={async () => {
                            setIsSavingVault(true);
                            const { error } = await supabase.from('farms').update({ whatsapp_config: farmData.whatsapp_config }).eq('id', farmData.id);
                            setIsSavingVault(false);
                            if (error) alert('Save failed: ' + error.message);
                            else alert('WhatsApp config saved! 📲');
                          }}>
                            <Save size={16} style={{ marginRight: '8px' }} /> {isSavingVault ? 'Saving...' : 'Save WhatsApp Config'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ───────────────────────── */}
      {deleteConfirmation && (
        <div style={styles.modalOverlay} onClick={() => setDeleteConfirmation(false)}>
          <div style={{ ...styles.modalContent, borderColor: '#fecaca' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.panelTitle, color: '#dc2626' }}>Delete This Account?</h3>
            </div>
            <div style={styles.modalBody}>
              <div style={{ background: '#fff1f1', padding: '20px', borderRadius: '18px', border: '1px solid #fecaca', marginBottom: '20px' }}>
                <p style={{ fontSize: '14px', color: '#991b1b', lineHeight: 1.5 }}>
                  <strong>Warning:</strong> All farm data, products, and order history will be permanently removed. This cannot be undone.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ ...styles.primaryBtn, background: '#dc2626', flex: 1 }} onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/admin/login');
                }}>
                  Confirm Delete
                </button>
                <button style={{ ...styles.outlineBtn, flex: 1 }} onClick={() => setDeleteConfirmation(false)}>Go Back</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PROFILE MODAL ────────────────────────────────────── */}
      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.panelTitle}>Owner Profile Settings</h3>
              <button onClick={() => setShowProfileModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Farm / Business Name</label>
                <input style={styles.input} value={farmData?.name || ''} onChange={e => setFarmData({ ...farmData, name: e.target.value })} />
              </div>
              <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                <label style={styles.label}>Account Email</label>
                <input style={{ ...styles.input, opacity: 0.7 }} value={userEmail || ''} disabled />
                <p style={styles.rowSub}>Email cannot be changed manually.</p>
              </div>
              <div style={{ marginTop: '30px' }}>
                <button style={styles.primaryBtnLarge} onClick={() => { handleUpdateFarm(); setShowProfileModal(false); }}>
                  <Save size={16} style={{ marginRight: '8px' }} /> Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BILLING MODAL ────────────────────────────────────── */}
      {showBillingModal && (
        <div style={styles.modalOverlay} onClick={() => setShowBillingModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.panelTitle}>SaaS Billing & Subscriptions</h3>
              <button onClick={() => setShowBillingModal(false)} style={styles.closeBtn}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.twoCol}>
                <div style={{ ...styles.panel, background: '#fcfaf5', border: '1px dashed #d8d0c1' }}>
                  <h4 style={{ ...styles.rowStrong, fontSize: '18px', marginBottom: '15px' }}>Current Plan</h4>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#1d4d35' }}>R399 <span style={{ fontSize: '14px', color: '#66756d' }}>/ month</span></div>
                  <p style={{ ...styles.rowSub, marginTop: '20px' }}>Includes full access to the Poultry Back Office, Site Editor, Live Order Board, and Stock Management tools.</p>
                  <div style={{ marginTop: '30px' }}>
                    <button style={{ ...styles.primaryBtnLarge, width: '100%' }}>
                      <CreditCard size={18} style={{ marginRight: '10px' }} /> Update Payment Method
                    </button>
                  </div>
                </div>
                <div style={styles.simpleList}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={styles.rowStrong}>Payment History</h4>
                    <span style={{ ...styles.pill, ...styles.pillGreen }}>Active</span>
                  </div>
                  {[{ label: 'Monthly Subscription', sub: 'April 2024', amount: 'R399', status: 'Pending', color: styles.pillRed }].map((item, i) => (
                    <div key={i} style={styles.simpleRow}>
                      <div>
                        <div style={styles.rowStrong}>{item.label}</div>
                        <div style={styles.rowSub}>{item.sub}</div>
                      </div>
                      <div style={styles.rowRight}>
                        <div style={styles.rowStrong}>{item.amount}</div>
                        <div style={{ ...styles.pill, ...item.color }}>{item.status}</div>
                      </div>
                    </div>
                  ))}
                  <p style={{ ...styles.rowSub, marginTop: '20px', fontSize: '12px' }}>Next billing date: May 1, 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────── */}
      <aside style={styles.sidebar}>
        <div style={styles.brandWrap}>
          {farmData?.logo_url ? (
            <img src={farmData.logo_url} alt="Logo" style={styles.logoImg} />
          ) : (
            <div style={styles.logo}>{farmData?.name?.charAt(0) || 'N'}</div>
          )}
          <div>
            <div style={styles.brandTitle}>{farmData?.name || 'The New Dawn'}</div>
            <div style={styles.brandSub}>Poultry Back Office</div>
          </div>
        </div>

        <div style={styles.nav}>
          {[
            { id: 'Overview', icon: <BarChart3 size={18} />, label: 'Overview' },
            { id: 'LiveOrders', icon: <Clock3 size={18} />, label: 'Live Order Board' },
            { id: 'Orders', icon: <ShoppingBag size={18} />, label: 'Order History' },
            { id: 'Inventory', icon: <Package size={18} />, label: 'Inventory' },
            { id: 'Customers', icon: <Users size={18} />, label: 'Customers' },
            { id: 'Site Editor', icon: <Layout size={18} />, label: 'Site Editor' },
            { id: 'Testimonials', icon: <MessageSquare size={18} />, label: 'Testimonials' },
            { id: 'Settings', icon: <Settings size={18} />, label: 'Settings' },
          ].map(item => (
            <button key={item.id} style={{ ...styles.navBtn, ...(activeTab === item.id && styles.navBtnActive) }} onClick={() => setActiveTab(item.id)}>
              <span style={{ marginRight: '10px', display: 'flex' }}>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        <div style={styles.brandingFooter}>
          <div style={styles.brandingMain}>KASI BUSINESSHUB</div>
          <div style={styles.brandingSubText}>A Product of Atlas Automation Group</div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main style={styles.main}>

        {/* TOPBAR */}
        <div style={styles.topbar}>
          <div>
            <div style={styles.kicker}>Farm Operations Dashboard</div>
            <h1 style={styles.pageTitle}>{activeTab === 'LiveOrders' ? '🌽 Live Order Board' : (activeTab || 'Overview')}</h1>
          </div>
          <div style={styles.topbarActions}>
            {activeTab === 'LiveOrders' && (
              <span style={{ ...styles.saveStatus, background: '#e6f5ea', color: '#1d4d35' }}>{liveTime}</span>
            )}
            {saveStatus && <span style={styles.saveStatus}>{saveStatus}</span>}
            <button style={styles.outlineBtn} onClick={() => window.open(`/${farmData?.slug}`, '_blank')}>View Farm Site</button>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button style={styles.topProfileBtn} onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div style={styles.topAvatar}>{farmData?.name?.charAt(0) || 'U'}</div>
                <ChevronDown size={14} />
              </button>
              {showProfileMenu && (
                <div style={styles.dropdownMenu}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownName}>{farmData?.name || 'User'}</div>
                    <div style={styles.dropdownEmail}>{userEmail}</div>
                  </div>
                  <button style={styles.dropdownItem} onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }}>
                    <User size={14} /> Profile Settings
                  </button>
                  <button style={{ ...styles.dropdownItem, color: '#1d4d35', fontWeight: 900 }} onClick={() => { setShowVault(true); setShowProfileMenu(false); }}>
                    <Lock size={14} /> 🔒 Security Vault
                  </button>
                  <button style={{ ...styles.dropdownItem, color: '#1d4d35', fontWeight: 900 }} onClick={() => { setShowBillingModal(true); setShowProfileMenu(false); }}>
                    <CreditCard size={14} /> 💳 Billing & Subscription
                  </button>
                  <button style={styles.dropdownItem} onClick={async () => { await supabase.auth.signOut(); navigate('/admin/login'); }}>
                    <LogOut size={14} /> Logout
                  </button>
                  <div style={styles.dropdownDivider} />
                  <button style={{ ...styles.dropdownItem, color: '#dc2626' }} onClick={() => { setDeleteConfirmation(true); setShowProfileMenu(false); }}>
                    <Trash2 size={14} /> Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────── */}
        {activeTab === 'Overview' && !farmData && (
          <section style={styles.panel}>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Layout size={48} style={{ color: '#1d4d35', marginBottom: '20px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '10px' }}>Welcome! Let's set up your Farm.</h2>
              <p style={{ ...styles.rowSub, maxWidth: '400px', margin: '0 auto 30px' }}>You're logged in, but you haven't linked a farm yet.</p>
              <div style={{ maxWidth: '400px', margin: '0 auto', display: 'flex', gap: '10px' }}>
                <input placeholder="Farm Name" style={styles.input} id="newFarmName" />
                <button style={styles.primaryBtn} onClick={async () => {
                  const name = document.getElementById('newFarmName').value;
                  if (!name) return;
                  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                  const { data: { user } } = await supabase.auth.getUser();
                  const { data, error } = await supabase.from('farms').insert({ name, slug, owner_id: user.id, branding: { primary_color: '#1d4d35' } }).select().single();
                  if (data) setFarmData(data);
                }}>Create My Farm</button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Overview' && farmData && (
          <>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Today's Orders</div>
                <div style={styles.statValue}>{stats.todayOrders}</div>
                <div style={styles.statNote}>Live count</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Pending Orders</div>
                <div style={styles.statValue}>{stats.pendingOrders}</div>
                <div style={styles.statNote}>Needs confirmation</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Low Stock Items</div>
                <div style={{ ...styles.statValue, color: stats.lowStock > 0 ? '#dc2626' : '#1d4d35' }}>{stats.lowStock}</div>
                <div style={styles.statNote}>Check inventory</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Revenue</div>
                <div style={{ ...styles.statValue, color: '#1d4d35' }}>R{stats.weeklyRevenue.toLocaleString()}</div>
                <div style={styles.statNote}>All time</div>
              </div>
            </div>

            <div style={styles.twoCol}>
              <section style={styles.panel}>
                <div style={styles.panelHead}>
                  <h3 style={styles.panelTitle}>Recent Orders</h3>
                  <button style={styles.linkBtn} onClick={() => setActiveTab('LiveOrders')}>Go to Live Board →</button>
                </div>
                <div style={styles.simpleList}>
                  {orders.slice(0, 6).map(order => (
                    <div key={order.id} style={styles.simpleRow}>
                      <div>
                        <div style={styles.rowStrong}>{order.order_number}</div>
                        <div style={styles.rowSub}>{order.customer_name} · {order.fulfillment_method}</div>
                      </div>
                      <div style={styles.rowRight}>
                        <span style={{ ...styles.pill, ...(order.status === 'pending' ? styles.pillPending : order.status === 'confirmed' ? styles.pillGreen : styles.pillBlue) }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p style={styles.rowSub}>No orders yet.</p>}
                </div>
              </section>

              <section style={styles.panel}>
                <div style={styles.panelHead}>
                  <h3 style={styles.panelTitle}>Quick Actions</h3>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <button style={{ ...styles.primaryBtn, padding: '14px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }} onClick={() => setActiveTab('LiveOrders')}>
                    <Clock3 size={18} /> Open Live Board
                  </button>
                  <button style={{ ...styles.outlineBtn, padding: '14px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }} onClick={() => setActiveTab('Inventory')}>
                    <Package size={18} /> Manage Stock
                  </button>
                  <button style={{ ...styles.outlineBtn, padding: '14px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }} onClick={() => { setShowVault(true); }}>
                    <Lock size={18} /> Security Vault
                  </button>
                </div>
              </section>
            </div>
          </>
        )}

        {/* ── LIVE ORDER BOARD ──────────────────────────────── */}
        {activeTab === 'LiveOrders' && (
          <div>
            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                <input type="text" placeholder="Search order or customer name..." style={{ ...styles.input, paddingLeft: '2.5rem', width: '100%' }}
                  value={orderSearchQuery} onChange={e => setOrderSearchQuery(e.target.value)} />
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#66756d' }}>🔍</span>
              </div>
              <select style={styles.select} value={orderFilter} onChange={e => setOrderFilter(e.target.value)}>
                <option value="all">All Fulfillment Types</option>
                <option value="delivery">Delivery Only</option>
                <option value="collection">Collection Only</option>
              </select>
              <button style={styles.primaryBtn} onClick={fetchData}>🔄 Refresh</button>
            </div>

            {/* Kanban Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

              {/* NEW / PENDING */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <AlertCircle size={18} style={{ color: '#8b6500' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#183126' }}>New Orders</h3>
                  <span style={{ ...styles.pill, ...styles.pillPending }}>{pendingOrders.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingOrders.map(order => (
                    <div key={order.id} style={{ ...styles.panel, padding: '1.25rem', border: '2px solid #e5c07b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 900, color: '#183126' }}>{order.order_number}</div>
                        <span style={{ ...styles.pill, ...styles.pillPending }}>PENDING</span>
                      </div>
                      <div style={styles.rowSub}>{order.customer_name}</div>
                      <div style={{ ...styles.rowSub, marginBottom: '12px' }}>{order.fulfillment_method} · R{order.total_price}</div>
                      <button style={{ ...styles.primaryBtn, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                        <CheckCircle2 size={14} /> Confirm Order
                      </button>
                    </div>
                  ))}
                  {pendingOrders.length === 0 && (
                    <div style={{ ...styles.panel, textAlign: 'center', color: '#66756d', padding: '2rem' }}>
                      No pending orders 🌾
                    </div>
                  )}
                </div>
              </div>

              {/* CONFIRMED / PROCESSING */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <Loader2 size={18} style={{ color: '#2451b8' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#183126' }}>Confirmed & Packing</h3>
                  <span style={{ ...styles.pill, ...styles.pillBlue }}>{confirmedOrders.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {confirmedOrders.map(order => (
                    <div key={order.id} style={{ ...styles.panel, padding: '1.25rem', border: '2px solid #93c5fd' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 900, color: '#183126' }}>{order.order_number}</div>
                        <span style={{ ...styles.pill, ...styles.pillBlue }}>CONFIRMED</span>
                      </div>
                      <div style={styles.rowSub}>{order.customer_name}</div>
                      <div style={{ ...styles.rowSub, marginBottom: '12px' }}>{order.fulfillment_method} · R{order.total_price}</div>
                      {order.customer_arrived && (
                        <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, marginBottom: '12px' }}>
                          🚗 Customer has arrived!
                        </div>
                      )}
                      <button style={{ ...styles.primaryBtn, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: '#2451b8' }} onClick={() => updateOrderStatus(order.id, order.fulfillment_method === 'delivery' ? 'out_for_delivery' : 'delivered')}>
                        <Truck size={14} /> {order.fulfillment_method === 'delivery' ? 'Dispatch' : 'Mark Collected'}
                      </button>
                    </div>
                  ))}
                  {confirmedOrders.length === 0 && (
                    <div style={{ ...styles.panel, textAlign: 'center', color: '#66756d', padding: '2rem' }}>
                      No orders being packed 📦
                    </div>
                  )}
                </div>
              </div>

              {/* DELIVERED / DISPATCHED */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <CheckCircle2 size={18} style={{ color: '#1f7a37' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#183126' }}>Dispatched / Collected</h3>
                  <span style={{ ...styles.pill, ...styles.pillGreen }}>{deliveryOrders.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {deliveryOrders.map(order => (
                    <div key={order.id} style={{ ...styles.panel, padding: '1.25rem', opacity: 0.85 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 900, color: '#183126' }}>{order.order_number}</div>
                        <span style={{ ...styles.pill, ...styles.pillGreen }}>{order.status.replace(/_/g, ' ').toUpperCase()}</span>
                      </div>
                      <div style={styles.rowSub}>{order.customer_name}</div>
                      <div style={{ ...styles.rowSub, marginBottom: '12px' }}>{order.fulfillment_method} · R{order.total_price}</div>
                      <button style={{ ...styles.primaryBtn, width: '100%', background: '#1f7a37' }} onClick={() => updateOrderStatus(order.id, 'delivered')}>
                        ✅ Mark Complete
                      </button>
                    </div>
                  ))}
                  {deliveryOrders.length === 0 && (
                    <div style={{ ...styles.panel, textAlign: 'center', color: '#66756d', padding: '2rem' }}>
                      No dispatched orders yet 🚚
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDER HISTORY ─────────────────────────────────── */}
        {activeTab === 'Orders' && (
          <section style={styles.panel}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>Order History</h3>
              <button style={styles.outlineBtn} onClick={() => setActiveTab('LiveOrders')}>🔴 Go to Live Board</button>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Order ID','Customer','Date','Total','Type','Status','Payment','Actions'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={styles.td}>{order.order_number}</td>
                      <td style={styles.td}>
                        <div style={styles.rowStrong}>{order.customer_name}</div>
                        <div style={styles.rowSub}>{order.customer_phone}</div>
                      </td>
                      <td style={styles.td}>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td style={styles.td}>R{order.total_price}</td>
                      <td style={styles.td}>{order.fulfillment_method}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.pill, ...(order.status === 'pending' ? styles.pillPending : order.status === 'confirmed' ? styles.pillGreen : styles.pillBlue) }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.pill, ...(order.payment_status === 'paid' ? styles.pillGreen : styles.pillRed) }}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.tableBtns}>
                          {order.status === 'pending' && <button style={styles.tinyBtn} onClick={() => updateOrderStatus(order.id, 'confirmed')}>Confirm</button>}
                          {order.status === 'confirmed' && <button style={styles.tinyBtn} onClick={() => updateOrderStatus(order.id, 'delivered')}>Deliver</button>}
                          <button style={styles.tinyBtn} onClick={() => window.open(`https://wa.me/${order.customer_phone?.replace(/[^0-9]/g, '')}`, '_blank')}>WhatsApp</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── INVENTORY ─────────────────────────────────────── */}
        {activeTab === 'Inventory' && (
          <section style={styles.panel}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>Inventory Management</h3>
              <button style={styles.primaryBtn} onClick={async () => {
                const name = window.prompt('Product Name:');
                if (!name) return;
                const price = window.prompt('Price (R):');
                const category = window.prompt('Category (Live Birds, Eggs, Meat, Feed):');
                const { data } = await supabase.from('products').insert({ farm_id: farmData.id, name, price: parseFloat(price), category, stock_status: 'in_stock' }).select().single();
                if (data) setInventory([...inventory, data]);
              }}>+ Add Product</button>
            </div>
            <div style={styles.inventoryGrid}>
              {inventory.map(item => (
                <div key={item.id} style={styles.inventoryCard}>
                  <div style={styles.inventoryTop}>
                    <div>
                      <div style={styles.cardTitle}>{item.name}</div>
                      <div style={styles.rowSub}>{item.category}</div>
                    </div>
                    <span style={{ ...styles.pill, ...(item.stock_status === 'in_stock' ? styles.pillGreen : item.stock_status === 'out_of_stock' ? styles.pillRed : styles.pillPending) }}>
                      {item.stock_status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={styles.inventoryCount}>{item.stock || 0} units</div>
                  <div style={{ ...styles.rowSub, marginTop: '10px' }}>Price: R{item.price}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── CUSTOMERS ──────────────────────────────────────── */}
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

        {/* ── SITE EDITOR ───────────────────────────────────── */}
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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input style={{ ...styles.input, flex: 1 }} value={farmData?.name || ''} onChange={e => setFarmData({ ...farmData, name: e.target.value })} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ ...styles.label, fontSize: '9px' }}>Brand Color</label>
                      <input type="color" style={{ width: '40px', height: '36px', border: '1px solid #d8d0c1', borderRadius: '8px', cursor: 'pointer', padding: '2px' }}
                        value={farmData?.primary_color || '#1d4d35'} onChange={e => setFarmData({ ...farmData, primary_color: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Farm Logo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {farmData?.logo_url && <img src={farmData.logo_url} alt="Logo" style={{ height: '40px', width: '40px', borderRadius: '8px', objectFit: 'contain', border: '1px solid #efe8dc' }} />}
                    <label style={{ ...styles.primaryBtn, cursor: 'pointer', flex: 1, textAlign: 'center' }}>
                      {isUploading === 'logo' ? 'Uploading...' : 'Upload New Logo'}
                      <input type="file" hidden accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                    </label>
                  </div>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Hero Headline</label>
                  <input style={styles.input} value={farmData?.branding?.hero_headline || ''} onChange={e => setFarmData({ ...farmData, branding: { ...farmData.branding, hero_headline: e.target.value } })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Hero Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {farmData?.hero_image_url && <img src={farmData.hero_image_url} alt="Hero" style={{ height: '40px', width: '40px', borderRadius: '8px', objectFit: 'cover' }} />}
                    <label style={{ ...styles.primaryBtn, cursor: 'pointer', flex: 1, textAlign: 'center' }}>
                      {isUploading === 'hero_image' ? 'Uploading...' : 'Upload Image'}
                      <input type="file" hidden accept="image/*" onChange={e => handleFileUpload(e, 'hero_image')} />
                    </label>
                  </div>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Our Story / About</label>
                  <textarea style={{ ...styles.input, height: '120px', resize: 'none' }} value={farmData?.about_story || ''} onChange={e => setFarmData({ ...farmData, about_story: e.target.value })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>About Section Image</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {farmData?.about_image_url && <img src={farmData.about_image_url} alt="About" style={{ height: '80px', width: '100%', borderRadius: '14px', objectFit: 'cover' }} />}
                    <label style={{ ...styles.primaryBtn, cursor: 'pointer', textAlign: 'center' }}>
                      {isUploading === 'about_image' ? 'Uploading...' : 'Upload Photo'}
                      <input type="file" hidden accept="image/*" onChange={e => handleFileUpload(e, 'about_image')} />
                    </label>
                  </div>
                </div>
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>WhatsApp Number</label>
                  <input style={styles.input} value={farmData?.contact_info?.whatsapp || ''} onChange={e => setFarmData({ ...farmData, contact_info: { ...farmData.contact_info, whatsapp: e.target.value } })} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <input style={styles.input} value={farmData?.contact_info?.address || ''} onChange={e => setFarmData({ ...farmData, contact_info: { ...farmData.contact_info, address: e.target.value } })} />
                </div>
              </div>

              {/* Gallery */}
              <div style={{ borderTop: '1px solid #e5ddd0', paddingTop: '30px' }}>
                <h4 style={{ ...styles.panelTitle, marginBottom: '10px' }}>Site Gallery</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
                  {gallery.map(img => (
                    <div key={img.id} style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', height: '120px', border: '1px solid #e5ddd0' }}>
                      <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={async () => { await supabase.from('site_gallery').delete().eq('id', img.id); setGallery(gallery.filter(g => g.id !== img.id)); }} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button onClick={async () => {
                    const url = window.prompt('Enter Image URL:');
                    if (!url) return;
                    const { data } = await supabase.from('site_gallery').insert({ farm_id: farmData.id, image_url: url }).select().single();
                    if (data) setGallery([...gallery, data]);
                  }} style={{ height: '120px', border: '2px dashed #d8d0c1', borderRadius: '14px', background: '#fcfaf5', color: '#8b6b2f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Plus size={24} />
                    <span style={{ fontSize: '11px', fontWeight: 800 }}>Add Photo</span>
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e5ddd0', paddingTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={styles.primaryBtnLarge}>
                  <Save size={18} style={{ marginRight: '8px' }} /> Save Design Changes
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── TESTIMONIALS ──────────────────────────────────── */}
        {activeTab === 'Testimonials' && (
          <section style={styles.panel}>
            <div style={styles.panelHead}>
              <h3 style={styles.panelTitle}>Testimonials</h3>
              <button style={styles.primaryBtn} onClick={async () => {
                const author_name = window.prompt('Author Name:');
                if (!author_name) return;
                const quote = window.prompt('Quote:');
                const author_role = window.prompt('Role (Customer, Reseller, etc):');
                const { data } = await supabase.from('testimonials').insert({ farm_id: farmData.id, author_name, quote, author_role, is_active: true }).select().single();
                if (data) setTestimonials([...testimonials, data]);
              }}>+ Add Review</button>
            </div>
            <div style={styles.customerGrid}>
              {testimonials.map(test => (
                <div key={test.id} style={{ ...styles.customerCard, opacity: test.is_active ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', width: '100%' }}>
                    <div style={styles.avatar}>{test.author_name.charAt(0)}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => toggleTestimonial(test.id, test.is_active)} style={{ ...styles.tinyBtn, background: test.is_active ? '#e6f5ea' : '#fff' }}>
                        {test.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => deleteTestimonial(test.id)} style={{ ...styles.tinyBtn, color: '#b24134' }}>
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

        {/* ── BILLING (Removed from sidebar, now in profile modal) ── */}

        {/* ── SETTINGS ──────────────────────────────────────── */}
        {activeTab === 'Settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <section style={styles.panel}>
              <div style={styles.panelHead}>
                <h3 style={styles.panelTitle}>Business & Shop Operations</h3>
              </div>
              <div style={styles.formGrid}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Official Business Name</label>
                    <input style={styles.input} value={farmData?.business_config?.official_name || ''} onChange={e => setFarmData({ ...farmData, business_config: { ...farmData.business_config, official_name: e.target.value } })} placeholder="Legal Farm Name" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Tax / VAT Treatment</label>
                    <select style={styles.select} value={farmData?.business_config?.tax_enabled ? 'vat' : 'none'} onChange={e => setFarmData({ ...farmData, business_config: { ...farmData.business_config, tax_enabled: e.target.value === 'vat' } })}>
                      <option value="none">Non-VAT Registered</option>
                      <option value="vat">VAT Registered (15%)</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Order Notifications</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                      {[{ key: 'email', label: 'Email Alerts' }, { key: 'whatsapp', label: 'WhatsApp Alerts' }].map(n => (
                        <label key={n.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={farmData?.business_config?.notifications?.[n.key] ?? true}
                            onChange={e => setFarmData({ ...farmData, business_config: { ...farmData.business_config, notifications: { ...farmData.business_config?.notifications, [n.key]: e.target.checked } } })} />
                          {n.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Shop Status</label>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      {[{ val: 'open', label: 'Open', activeStyle: { background: '#1d4d35', color: '#fff' } },
                        { val: 'closed', label: 'Paused / Vacation', activeStyle: { background: '#dc2626', color: '#fff' } }].map(o => (
                        <button key={o.val} style={{ ...styles.tinyBtn, ...(farmData?.business_config?.shop_status === o.val ? o.activeStyle : {}) }}
                          onClick={() => setFarmData({ ...farmData, business_config: { ...farmData.business_config, shop_status: o.val } })}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button style={styles.primaryBtn} onClick={handleUpdateFarm}>Save Business Settings</button>
                </div>
              </div>
            </section>
          </div>
        )}

      </main>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'grid', gridTemplateColumns: '280px 1fr', background: '#f7f4ee', color: '#183126', fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  sidebar: { background: '#143728', color: '#eef5f1', padding: '24px 18px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  brandWrap: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' },
  logoImg: { height: '40px', width: '40px', borderRadius: '12px', objectFit: 'contain', background: '#fff', padding: '4px' },
  logo: { width: '46px', height: '46px', borderRadius: '50%', background: '#d5b66f', color: '#143728', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px' },
  brandTitle: { fontWeight: 800, fontSize: '18px' },
  brandSub: { color: '#b7c9c0', fontSize: '13px', marginTop: '4px' },
  nav: { display: 'grid', gap: '4px' },
  navBtn: { border: 'none', background: 'transparent', color: '#dfe9e4', textAlign: 'left', padding: '10px 14px', borderRadius: '14px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' },
  navBtnActive: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
  main: { padding: '28px', display: 'grid', gap: '22px', overflowY: 'auto', maxHeight: '100vh', alignContent: 'start' },
  topbar: { display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '10px' },
  kicker: { margin: '0 0 6px', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b6b2f', fontWeight: 800 },
  pageTitle: { margin: 0, fontSize: '30px', lineHeight: 1.1, fontWeight: 900 },
  topbarActions: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  primaryBtn: { border: 'none', borderRadius: '12px', padding: '10px 16px', background: '#1d4d35', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '13px' },
  primaryBtnLarge: { border: 'none', borderRadius: '14px', padding: '16px 24px', background: '#1d4d35', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center' },
  outlineBtn: { border: '1px solid #d8d0c1', borderRadius: '12px', padding: '10px 16px', background: '#fff', color: '#183126', fontWeight: 800, cursor: 'pointer', fontSize: '13px' },
  linkBtn: { border: 'none', background: 'transparent', color: '#1d4d35', fontWeight: 800, cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '18px' },
  statCard: { background: '#fff', border: '1px solid #e5ddd0', borderRadius: '22px', padding: '20px', boxShadow: '0 10px 24px rgba(0,0,0,0.04)' },
  statLabel: { color: '#5f6c65', fontWeight: 600, marginBottom: '10px', fontSize: '13px' },
  statValue: { fontSize: '28px', fontWeight: 900, marginBottom: '10px' },
  statNote: { color: '#7a867f', fontSize: '12px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '22px' },
  panel: { background: '#fff', border: '1px solid #e5ddd0', borderRadius: '24px', padding: '22px', boxShadow: '0 10px 24px rgba(0,0,0,0.04)' },
  panelHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '18px', flexWrap: 'wrap' },
  panelTitle: { margin: 0, fontSize: '20px', fontWeight: 900 },
  simpleList: { display: 'grid', gap: '14px' },
  simpleRow: { display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #efe8dc' },
  rowStrong: { fontWeight: 800 },
  rowSub: { marginTop: '4px', color: '#66756d', fontSize: '13px' },
  rowRight: { textAlign: 'right' },
  pill: { display: 'inline-block', borderRadius: '999px', padding: '6px 10px', fontSize: '10px', fontWeight: 800, whiteSpace: 'nowrap', textTransform: 'uppercase' },
  pillPending: { background: '#fff1cc', color: '#8b6500' },
  pillGreen: { background: '#e6f5ea', color: '#1f7a37' },
  pillBlue: { background: '#e6eefc', color: '#2451b8' },
  pillRed: { background: '#fde9e7', color: '#b24134' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '12px', color: '#6f7b74', fontWeight: 800, padding: '12px 10px', borderBottom: '1px solid #e9e2d7', whiteSpace: 'nowrap' },
  td: { padding: '14px 10px', borderBottom: '1px solid #f1ebe1', verticalAlign: 'middle', whiteSpace: 'nowrap', fontSize: '13px' },
  tableBtns: { display: 'flex', gap: '8px' },
  tinyBtn: { border: '1px solid #d9d1c4', background: '#fff', color: '#183126', borderRadius: '10px', padding: '6px 10px', fontWeight: 700, cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' },
  inventoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' },
  inventoryCard: { border: '1px solid #e9e1d5', borderRadius: '22px', padding: '20px', background: '#fcfbf8' },
  inventoryTop: { display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', marginBottom: '18px' },
  inventoryCount: { fontSize: '24px', fontWeight: 900, color: '#183126' },
  customerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' },
  customerCard: { background: '#fcfbf8', border: '1px solid #e9e1d5', borderRadius: '22px', padding: '20px' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', background: '#1d4d35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '18px', marginBottom: '12px' },
  cardTitle: { fontSize: '18px', fontWeight: 800, marginBottom: '4px' },
  saveStatus: { padding: '8px 16px', background: '#1d4d35', color: '#fff', borderRadius: '12px', fontSize: '11px', fontWeight: 800 },
  formGrid: { display: 'grid', gap: '20px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '11px', fontWeight: 800, color: '#1d4d35', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { padding: '12px 14px', border: '1px solid #d8d0c1', borderRadius: '14px', background: '#fcfaf5', outline: 'none', fontSize: '14px', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },
  brandingFooter: { marginTop: 'auto', padding: '30px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  brandingMain: { fontSize: '12px', fontWeight: 900, color: '#d5b66f', letterSpacing: '0.15em', marginBottom: '6px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' },
  brandingSubText: { fontSize: '9px', color: '#b7c9c0', fontWeight: 700, opacity: 0.8 },
  topProfileBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '12px', border: '1px solid #d8d0c1', background: '#fff', cursor: 'pointer', color: '#183126' },
  topAvatar: { width: '28px', height: '28px', borderRadius: '8px', background: '#1d4d35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 },
  dropdownMenu: { position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '220px', background: '#fff', borderRadius: '18px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', border: '1px solid #e5ddd0', padding: '8px', zIndex: 1000 },
  dropdownHeader: { padding: '12px 14px', borderBottom: '1px solid #f1ebe1', marginBottom: '8px' },
  dropdownName: { fontSize: '14px', fontWeight: 800, color: '#183126' },
  dropdownEmail: { fontSize: '11px', color: '#66756d', marginTop: '2px' },
  dropdownItem: { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#183126', fontSize: '13px', fontWeight: 700, cursor: 'pointer', textAlign: 'left' },
  dropdownDivider: { height: '1px', background: '#f1ebe1', margin: '8px 0' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' },
  modalContent: { background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '28px', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e5ddd0' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalBody: { display: 'flex', flexDirection: 'column' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#66756d' },
  select: { padding: '12px 14px', border: '1px solid #d8d0c1', borderRadius: '14px', background: '#fcfaf5', outline: 'none', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer' },
};

export default Dashboard;