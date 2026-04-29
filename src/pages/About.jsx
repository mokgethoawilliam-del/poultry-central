import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck, Sprout, Users } from 'lucide-react';
import broilerImage from '../assets/healthy_broiler_poultry_1776000591785.png';
import newDawnOwnerImage from '../assets/new-dawn-owner.jpg';
import { phoneDigits, safeSlug, safeText } from '../utils/content';

const fallbackWhy = [
  {
    title: 'Freshness you can trust',
    text: 'We focus on healthy stock, careful handling, and practical service that local buyers can rely on.',
    icon: <ShieldCheck size={24} className="text-[#d6c27c]" />,
  },
  {
    title: 'Simple local ordering',
    text: 'We keep ordering direct and human, with WhatsApp support and straightforward collection or delivery plans.',
    icon: <MessageCircle size={24} className="text-[#d6c27c]" />,
  },
  {
    title: 'Built for real community demand',
    text: 'From households to resellers and events, the farm is shaped around practical local supply needs.',
    icon: <Users size={24} className="text-[#d6c27c]" />,
  },
];

export default function About() {
  const { farm } = useOutletContext();
  const farmName = safeText(farm?.name, 'The New Dawn Poultry Farm');
  const farmSlug = safeSlug(farm?.slug, 'new-dawn');
  const contact = farm?.contact_info || {};
  const aboutImage = safeText(farm?.about_image_url) || (farmSlug === 'new-dawn' ? newDawnOwnerImage : broilerImage);
  const whyItems = Array.isArray(farm?.why_content) && farm.why_content.length > 0
    ? farm.why_content.map((item, index) => ({
        title: safeText(item?.title, fallbackWhy[index]?.title || 'Why customers choose us'),
        text: safeText(item?.text, fallbackWhy[index]?.text || ''),
        icon: fallbackWhy[index % fallbackWhy.length].icon,
      }))
    : fallbackWhy;

  return (
    <div className="pt-24 bg-[#fcfaf5] min-h-screen">
      <section className="bg-[#c2410c] pt-32 pb-24 text-white relative overflow-hidden">
        <div className="container mx-auto px-[5%] max-w-[1200px] relative z-10">
          <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-6 inline-block text-sm">About the Farm</span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
            Built around trust, supply, and <span className="text-[#fcfaf5] italic">good stock</span>
          </h1>
          <p className="text-[#d3ddd7] max-w-3xl text-xl leading-relaxed font-medium">
            {safeText(
              farm?.about_story,
              'This farm serves households, resellers, and community events with a practical focus on healthy poultry, responsive service, and dependable local supply.'
            )}
          </p>
        </div>
        <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
      </section>

      <section className="container mx-auto px-[5%] max-w-[1200px] py-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#e6dfd1] bg-white px-5 py-3 shadow-sm">
              <Sprout size={18} className="text-[#c2410c]" />
              <span className="text-sm font-black uppercase tracking-widest text-[#183126]">{farmName}</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-[#183126] tracking-tight">
              A farm story shaped by real local demand
            </h2>

            <p className="text-lg text-[#5f6c65] leading-relaxed font-medium">
              {safeText(
                farm?.about_story,
                'From everyday family orders to larger community and reseller needs, this farm is built to keep things simple, fresh, and dependable.'
              )}
            </p>

            <div className="grid gap-5">
              {whyItems.map((item) => (
                <div key={item.title} className="bg-white border border-[#e6dfd1] rounded-[28px] p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#183126] flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#183126] mb-2">{item.title}</h3>
                      <p className="text-[#5f6c65] leading-relaxed font-medium">{item.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[40px] border border-[#e6dfd1] shadow-2xl bg-white">
              <img
                src={aboutImage}
                alt={`${farmName} owner at the farm`}
                className="w-full min-h-[420px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-[5%] max-w-[1200px] pb-28">
        <div className="bg-[#183126] p-12 md:p-20 rounded-[56px] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-2xl">
              <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-5 inline-block text-sm">Ready to order?</span>
              <h2 className="text-4xl md:text-5xl font-black mb-5 tracking-tight">Let’s help you get the right stock quickly.</h2>
              <p className="text-[#d3ddd7] text-lg leading-relaxed font-medium">
                Whether you need everyday poultry supply, eggs, or something for a bigger order, the next step is simple.
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
                className="px-10 py-5 bg-[#28c76f] text-white font-black rounded-full shadow-xl hover:bg-[#21a55c] flex items-center justify-center gap-2"
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

