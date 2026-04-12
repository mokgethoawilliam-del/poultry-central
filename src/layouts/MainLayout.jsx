import React, { useState, useEffect } from 'react';
import { useParams, Outlet, useLocation } from 'react-router-dom';
import { getFarmBySlug } from '../services/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MessageCircle } from 'lucide-react';

const MainLayout = () => {
  const { farmSlug } = useParams();
  const location = useLocation();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hide global Header/Footer on the home route — the user's landing page has its own nav
  const isHome = location.pathname === `/${farmSlug}` || location.pathname === `/${farmSlug}/`;

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        setLoading(true);
        const data = await getFarmBySlug(farmSlug || 'new-dawn');
        setFarm(data);
      } catch (err) {
        console.error("Error fetching farm:", err);
        setError("Farm not found");
      } finally {
        setLoading(false);
      }
    };
    fetchFarm();
  }, [farmSlug]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#fcfaf5]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1d4d35]"></div>
    </div>
  );

  if (error || !farm) return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <p className="text-gray-600">We couldn't find the farm you're looking for.</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show global header/footer on sub-pages, not on the landing page */}
      {!isHome && <Header farm={farm} />}
      <main className="flex-grow">
        <Outlet context={{ farm }} />
      </main>
      {!isHome && <Footer farm={farm} />}

      {/* WhatsApp Float — shown on sub-pages only, landing page has its own */}
      {!isHome && (
        <a
          href={`https://wa.me/${farm.contact_info?.whatsapp?.replace(/[^0-9]/g, '')}`}
          className="whatsapp-float btn btn-whatsapp p-4 rounded-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={32} />
        </a>
      )}
    </div>
  );
};

export default MainLayout;
