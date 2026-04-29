import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Mail, Sprout, Store, Lock } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { safeSlug } from '../../utils/content';

const defaultBranding = (farmName) => ({
  primary_color: '#1d4d35',
  secondary_color: '#fcfaf5',
  accent_color: '#8b6b2f',
  hero_headline: `${farmName}. Fresh poultry made easy.`,
  hero_subtitle: 'Order farm products, manage stock, and run your public poultry website from one dashboard.',
});

const defaultContact = {
  whatsapp: '',
  phone: '',
  address: '',
  operating_hours: 'Monday to Saturday',
};

export default function RegisterFarm() {
  const [farmName, setFarmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const navigate = useNavigate();

  const slug = useMemo(() => safeSlug(farmName, 'my-farm'), [farmName]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSiteUrl('');

    try {
      const { data: existingFarm, error: slugError } = await supabase
        .from('farms')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (slugError) throw slugError;
      if (existingFarm) throw new Error('That farm website name is already taken. Try a slightly different farm name.');

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: farmName,
            farm_slug: slug,
            farm_name: farmName,
          },
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (authError) throw authError;

      const userId = authData?.user?.id;
      if (userId) {
        const { error: farmError } = await supabase.from('farms').insert({
          name: farmName,
          slug,
          owner_id: userId,
          farm_type: 'poultry',
          branding: defaultBranding(farmName),
          contact_info: defaultContact,
          business_config: {
            shop_status: 'open',
            official_name: farmName,
            notifications: { email: true, whatsapp: true },
            tax_enabled: false,
            ai_keys: {
              grok_api_key: '',
              gemini_api_key: '',
            },
          },
        });

        if (farmError) throw farmError;
      }

      const publicUrl = `${window.location.origin}/${slug}`;
      setSiteUrl(publicUrl);
      setTimeout(() => navigate('/admin'), 1200);
    } catch (err) {
      setError(err.message || 'Could not register your farm. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#102419] px-4 py-10 text-white flex items-center justify-center">
      <div className="w-full max-w-5xl grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
        <div>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d6c27c] text-[#102419] mb-8">
            <Sprout size={28} />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d6c27c] mb-5">Poultry Central SaaS</p>
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
            Launch a farm website in minutes.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[#c7d3ca] font-medium">
            New vendors register, get a dashboard, and receive a live public URL like
            <span className="font-black text-white"> poultry-central.co.za/{slug}</span>.
          </p>
        </div>

        <div className="bg-white text-[#183126] rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/10">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight">Register Your Farm</h2>
            <p className="text-sm font-medium text-[#66756d] mt-2">Your public website slug is reserved from your farm name.</p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {siteUrl && (
            <div className="mb-6 rounded-2xl border border-[#d6c27c]/40 bg-[#fcfaf5] p-4 text-sm font-bold text-[#1d4d35]">
              Farm registered. Your site is live at {siteUrl}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#8b6b2f] mb-2">Farm Name</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b6b2f]" size={18} />
                <input
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full rounded-2xl border border-[#d8d0c1] bg-[#fcfaf5] py-4 pl-12 pr-4 font-bold outline-none focus:border-[#1d4d35]"
                  placeholder="e.g. Fabri Poultry"
                />
              </div>
              <p className="mt-2 text-xs font-bold text-[#66756d]">Website: /{slug}</p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#8b6b2f] mb-2">Owner Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b6b2f]" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[#d8d0c1] bg-[#fcfaf5] py-4 pl-12 pr-4 font-bold outline-none focus:border-[#1d4d35]"
                  placeholder="owner@farm.co.za"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#8b6b2f] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b6b2f]" size={18} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-[#d8d0c1] bg-[#fcfaf5] py-4 pl-12 pr-4 font-bold outline-none focus:border-[#1d4d35]"
                  placeholder="Choose a secure password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#1d4d35] py-4 font-black text-white shadow-xl flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Launch My Farm <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-[#66756d]">
            Already registered? <Link to="/admin/login" className="text-[#1d4d35]">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
