import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { ArrowRight, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { getFarmGallery } from '../services/supabase';
import heroImage from '../assets/premium_farm_hero_1776000531649.png';
import { phoneDigits, safeSlug, safeText } from '../utils/content';

export default function Gallery() {
  const { farm } = useOutletContext();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const farmName = safeText(farm?.name, 'The New Dawn Poultry Farm');
  const farmSlug = safeSlug(farm?.slug, 'new-dawn');
  const contact = farm?.contact_info || {};

  useEffect(() => {
    let mounted = true;

    const fetchGallery = async () => {
      if (!farm?.id) return;
      try {
        const data = await getFarmGallery(farm.id);
        if (mounted) setGallery(data || []);
      } catch (err) {
        console.error('Gallery fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchGallery();
    return () => {
      mounted = false;
    };
  }, [farm?.id]);

  return (
    <div className="pt-24 bg-[#fcfaf5] min-h-screen">
      <section className="bg-[#b91c1c] pt-32 pb-24 text-white relative overflow-hidden">
        <div className="container mx-auto px-[5%] max-w-[1200px] relative z-10">
          <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-6 inline-block text-sm">Gallery</span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
            The farm, the stock, and the <span className="text-[#fcfaf5] italic">story behind it</span>
          </h1>
          <p className="text-[#d3ddd7] max-w-3xl text-xl leading-relaxed font-medium">
            Browse moments from the farm, deliveries, poultry stock, and the everyday work that keeps supply moving.
          </p>
        </div>
        <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
      </section>

      <section className="container mx-auto px-[5%] max-w-[1200px] py-24">
        {loading ? (
          <div className="text-center py-24 text-[#5f6c65] font-bold">Loading gallery...</div>
        ) : gallery.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {gallery.map((item) => (
              <div key={item.id} className="bg-white rounded-[32px] overflow-hidden border border-[#e6dfd1] shadow-sm hover:shadow-xl transition-all">
                <img
                  src={safeText(item.image_url, heroImage)}
                  alt={safeText(item.caption, farmName)}
                  className="w-full h-[320px] object-cover"
                />
                <div className="p-7">
                  <p className="text-lg font-black text-[#183126] leading-relaxed">
                    {safeText(item.caption, `${farmName} in action`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-[#e6dfd1] shadow-sm">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#fcfaf5] flex items-center justify-center text-[#b91c1c] mb-6 border border-[#e6dfd1]">
              <ImageIcon size={34} />
            </div>
            <h2 className="text-3xl font-black text-[#183126] mb-4">Gallery coming soon</h2>
            <p className="text-[#5f6c65] text-lg font-medium max-w-2xl mx-auto">
              The farm has not uploaded public gallery photos yet. Check back soon or contact the team directly if you want to ask about current stock.
            </p>
          </div>
        )}
      </section>

      <section className="container mx-auto px-[5%] max-w-[1200px] pb-28">
        <div className="bg-[#7f1d1d] p-12 md:p-20 rounded-[56px] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-2xl">
              <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-5 inline-block text-sm">Need details?</span>
              <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight">Talk to the farm team directly.</h2>
              <p className="text-[#d3ddd7] text-lg leading-relaxed font-medium">
                Ask about current stock, delivery plans, or bulk supply if you want something you didn’t see here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Link
                to={`/${farmSlug}/products`}
                className="px-10 py-5 bg-white text-[#183126] font-black rounded-full shadow-xl hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                View Products <ArrowRight size={20} />
              </Link>
              <a
                href={`https://wa.me/${phoneDigits(contact.whatsapp || contact.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 bg-[#b91c1c] text-white font-black rounded-full shadow-xl hover:bg-[#991b1b] flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} /> WhatsApp Farm
              </a>
            </div>
          </div>
          <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
        </div>
      </section>
    </div>
  );
}

