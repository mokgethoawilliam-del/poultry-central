import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginErr) throw loginErr;
      
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1d4d35] rounded-3xl shadow-xl text-white font-black text-2xl mb-6">
            N
          </div>
          <h1 className="text-3xl font-black text-[#183126] tracking-tight">Poultry Back Office</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your farm sales and inventory</p>
          <p className="text-[#8b6b2f] mt-3 text-xs font-black uppercase tracking-[0.22em]">Multi-farm vendor dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[32px] shadow-2xl shadow-[#1d4d35]/5 p-10 border border-[#e5ddd0]">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#8b6b2f] mb-3 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full bg-[#fcfaf5] border border-[#d8d0c1] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#1d4d35] focus:ring-4 focus:ring-[#1d4d35]/5 transition-all font-medium"
                  placeholder="name@farm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-[#8b6b2f] mb-3 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full bg-[#fcfaf5] border border-[#d8d0c1] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#1d4d35] focus:ring-4 focus:ring-[#1d4d35]/5 transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-2">
              <label className="flex items-center gap-2 text-gray-500 font-medium cursor-pointer">
                <input type="checkbox" className="rounded-md border-[#d8d0c1] text-[#1d4d35] focus:ring-[#1d4d35]" />
                Remember me
              </label>
              <button type="button" className="text-[#1d4d35] font-bold hover:underline">Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1d4d35] hover:bg-[#143728] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#1d4d35]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Sign into Dashboard <ArrowRight size={20} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-gray-500 text-sm font-bold">
          New farm vendor? <Link to="/register" className="text-[#1d4d35] hover:underline">Register your farm</Link>
        </p>

        <p className="text-center mt-4 text-gray-500 text-sm font-bold">
          Need to view a public farm page? <Link to="/new-dawn" className="text-[#1d4d35] hover:underline">Open the demo storefront</Link>
        </p>

        {/* Footer info */}
        <p className="text-center mt-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
          SaaS Developed by Kasi Business Hub
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
