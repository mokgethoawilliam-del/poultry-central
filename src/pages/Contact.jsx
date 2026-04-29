import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Send,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { phoneDigits, safeText } from '../utils/content';

const Contact = () => {
  const { farm } = useOutletContext();
  const contact = farm.contact_info || {};
  const farmName = safeText(farm?.name, 'our farm');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, this would send an email or record a lead
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${phoneDigits(contact.whatsapp || contact.phone)}`, '_blank');
  };

  if (submitted) return (
    <div className="pt-48 pb-24 bg-[#fcfaf5] min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-[5%] max-w-[800px] text-center">
        <div className="bg-white p-12 md:p-20 rounded-[40px] shadow-2xl border border-[#e6dfd1] animate-fadeIn">
          <div className="w-24 h-24 bg-[#c2410c] rounded-full flex items-center justify-center text-white mx-auto mb-10 shadow-xl">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#183126] mb-6">Message Sent!</h1>
          <p className="text-xl text-[#5f6c65] mb-12 font-medium">
             We've received your inquiry and will get back to you within 24 hours. For urgent stock queries, please use WhatsApp.
          </p>
          <button 
            onClick={openWhatsApp}
            className="px-10 py-5 bg-[#28c76f] text-white font-black rounded-full shadow-lg hover:bg-[#21a55c] transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <MessageCircle size={22} /> Talk on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-24 bg-[#fcfaf5] min-h-screen">
       <section className="bg-[#c2410c] pt-32 pb-24 text-white relative overflow-hidden">
        <div className="container mx-auto px-[5%] max-w-[1200px] relative z-10">
          <span className="uppercase tracking-[0.3em] font-black text-[#d6c27c] mb-6 inline-block text-sm uppercase italic tracking-widest">Connect with {farmName}</span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Get in <span className="text-[#fcfaf5] italic">Touch</span></h1>
          <p className="text-[#d3ddd7] text-xl max-w-2xl font-medium leading-relaxed">
            Reach out for product enquiries, bulk supply, advance bookings,
            or delivery arrangements in Polokwane and surrounding areas.
          </p>
        </div>
        <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
      </section>

      <div className="container mx-auto px-[5%] max-w-[1200px] -mt-12 mb-24 relative z-20">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-10 rounded-[40px] shadow-xl border border-[#e6dfd1] space-y-10">
              <h3 className="text-3xl font-black text-[#183126] mb-8 uppercase tracking-tight">Visit Us</h3>
              
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-[#fcfaf5] rounded-2xl flex items-center justify-center text-[#c2410c] flex-shrink-0 shadow-sm border border-[#e6dfd1]">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="font-black text-[#183126] text-lg uppercase tracking-tight mb-1">Our Location</p>
                    <p className="text-[#5f6c65] font-medium leading-relaxed">{safeText(contact.address, 'Polokwane, Limpopo Province, SA')}</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-[#fcfaf5] rounded-2xl flex items-center justify-center text-[#c2410c] flex-shrink-0 shadow-sm border border-[#e6dfd1]">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="font-black text-[#183126] text-lg uppercase tracking-tight mb-1">Business Hours</p>
                    <p className="text-[#5f6c65] font-medium leading-relaxed">{safeText(contact.operating_hours, 'Mon - Sat: 08:00 - 17:00')}</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-[#fcfaf5] rounded-2xl flex items-center justify-center text-[#c2410c] flex-shrink-0 shadow-sm border border-[#e6dfd1]">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="font-black text-[#183126] text-lg uppercase tracking-tight mb-1">Direct Line</p>
                    <p className="text-[#5f6c65] font-medium leading-relaxed">{safeText(contact.phone, '015 004 0130')}</p>
                  </div>
                </div>

                {safeText(contact.email) && (
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-[#fcfaf5] rounded-2xl flex items-center justify-center text-[#c2410c] flex-shrink-0 shadow-sm border border-[#e6dfd1]">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="font-black text-[#183126] text-lg uppercase tracking-tight mb-1">Email</p>
                      <p className="text-[#5f6c65] font-medium leading-relaxed">{safeText(contact.email)}</p>
                    </div>
                  </div>
                )}
              </div>

               <div className="pt-10 border-t border-[#e6dfd1]">
                 <button 
                  onClick={openWhatsApp}
                  className="w-full py-5 bg-[#28c76f] text-white font-black rounded-full shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-3"
                 >
                  <MessageCircle size={22} /> WhatsApp Inquiry
                 </button>
               </div>
            </div>

            <div className="bg-[#183126] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
              <h4 className="text-xl font-black mb-6 uppercase tracking-tight">Quick Inquiry Ideas</h4>
              <ul className="space-y-4 text-[#d3ddd7] font-medium">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#d6c27c] rounded-full"></div> Ask for current broiler prices</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#d6c27c] rounded-full"></div> Request fresh egg bulk supply</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#d6c27c] rounded-full"></div> Book day-old chicks in advance</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#d6c27c] rounded-full"></div> Enquire about delivery fees</li>
              </ul>
               <div className="absolute inset-0 bg-organic opacity-5 pointer-events-none"></div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-2xl border border-[#e6dfd1]">
              <h3 className="text-3xl font-black text-[#183126] mb-10 uppercase tracking-tight">Send a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c2410c]">Your Name</label>
                    <input 
                      required
                      placeholder="e.g. Marcus Moagi"
                      className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-bold text-[#183126] focus:ring-2 focus:ring-[#c2410c] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c2410c]">Email Address</label>
                    <input 
                      required
                      type="email"
                      placeholder="marcus@example.com"
                      className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-bold text-[#183126] focus:ring-2 focus:ring-[#c2410c] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c2410c]">Subject</label>
                  <input 
                    required
                    placeholder="e.g. Bulk Egg Inquiry"
                    className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-2xl font-bold text-[#183126] focus:ring-2 focus:ring-[#c2410c] outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#c2410c]">Message Details</label>
                  <textarea 
                    required
                    rows="5"
                    placeholder="Tell us about your needs..."
                    className="w-full bg-[#fcfaf5] border border-[#e6dfd1] px-6 py-4 rounded-3xl font-bold text-[#183126] focus:ring-2 focus:ring-[#c2410c] outline-none transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-[#c2410c] text-white font-black text-xl rounded-full shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-3 transition-all"
                >
                  Send Inquiry <Send size={22} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

