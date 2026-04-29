import React, { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Menu,
  MessageCircle,
  ShieldCheck,
  ShoppingBasket,
  ShoppingCart,
  Sprout,
  Truck,
  X,
} from "lucide-react";
import { getFarmProducts, getFarmTestimonials } from "../services/supabase";
import heroImage from "../assets/premium_farm_hero_1776000531649.png";
import broilerImage from "../assets/healthy_broiler_poultry_1776000591785.png";
import eggsImage from "../assets/fresh_organic_eggs_1776000562761.png";
import chicksImage from "../assets/media__1775999890077.png";
import newDawnLogo from "../assets/new-dawn-logo.jpg";
import newDawnLiveChickenImage from "../assets/new-dawn-live-chicken.jpg";
import newDawnDayOldChicksImage from "../assets/new-dawn-day-old-chicks.jpg";
import newDawnOwnerImage from "../assets/new-dawn-owner.jpg";
import { phoneDigits, safeSlug, safeText } from "../utils/content";
import { getCartCount } from "../utils/cart";
import StorefrontLegalModal from "../components/StorefrontLegalModal";

const fallbackFarm = {
  name: "The New Dawn Poultry Farm",
  slug: "new-dawn",
  primary_color: "#b91c1c",
  logo_url: newDawnLogo,
  site_title: "Fresh poultry in Polokwane",
  hero_subtitle:
    "Premium farm-raised poultry, fresh eggs, and day-old chicks supplied with care for families, resellers, and local events.",
  why_content: "Fresh stock, straight answers, and reliable poultry supply for the community.",
  about_story:
    "New Dawn Poultry is built around clean stock, consistent service, and honest local trade. We help households, retailers, and growers source dependable poultry without the back-and-forth.",
  about_headline: "Order, confirm, collect or deliver. Simple poultry supply for real local needs.",
  contact_info: {
    address: "Polokwane, Limpopo Province, South Africa",
    phone: "015 004 0130",
    whatsapp: "27150040130",
    google_maps_url: "",
  },
};

const fallbackProducts = [
  {
    title: "Live Broilers",
    desc: "Healthy chickens prepared for households, retailers, and community events.",
    image: broilerImage,
    cta: "Order Broilers",
  },
  {
    title: "Fresh Eggs",
    desc: "Clean daily eggs packed for homes, shops, caterers, and bulk buyers.",
    image: eggsImage,
    cta: "Order Eggs",
  },
  {
    title: "Day-Old Chicks",
    desc: "Reliable starter stock for small farmers and poultry growers scaling up.",
    image: chicksImage,
    cta: "Book Chicks",
  },
];

const fallbackTestimonials = [
  {
    id: "local-buyer",
    quote: "Fresh stock, quick replies, and no confusion when we order for the family.",
    author_name: "Mama Dlamini",
    author_role: "Regular customer",
  },
  {
    id: "grower",
    quote: "Their chicks arrive healthy and the pickup process is easy to plan around.",
    author_name: "Bongani M.",
    author_role: "Poultry grower",
  },
];

const trustBadges = [
  { label: "Locally raised", icon: <ShieldCheck size={22} className="text-[#d6c27c]" /> },
  { label: "Fresh daily", icon: <Sprout size={22} className="text-[#d6c27c]" /> },
  { label: "Bulk ready", icon: <ShoppingBasket size={22} className="text-[#d6c27c]" /> },
  { label: "Delivery support", icon: <Truck size={22} className="text-[#d6c27c]" /> },
];

const safeImage = (value, fallback) => {
  const src = safeText(value);
  return src && /^https?:\/\//.test(src) ? src : src || fallback;
};

const buildMapsSearchUrl = (contact) => {
  const directUrl = safeText(contact?.google_maps_url);
  if (directUrl) return directUrl;

  const address = safeText(contact?.address);
  if (!address) return '';

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};

const isEmbeddableMap = (url) => /google\.[^/]+\/maps\/embed|google\.com\/maps\/embed/i.test(url);

export default function Home() {
  const { farm: outletFarm } = useOutletContext();
  const farm = useMemo(() => ({ ...fallbackFarm, ...outletFarm }), [outletFarm]);
  const contact = { ...fallbackFarm.contact_info, ...(farm.contact_info || {}) };
  const farmName = safeText(farm.name, fallbackFarm.name);
  const farmSlug = safeSlug(farm.slug, fallbackFarm.slug);
  const primaryColor = safeText(farm.primary_color, fallbackFarm.primary_color);
  const displayLogo = safeText(farm.logo_url) || (farmSlug === 'new-dawn' ? newDawnLogo : '');
  const aboutImage = safeText(farm.about_image_url) || (farmSlug === 'new-dawn' ? newDawnOwnerImage : broilerImage);
  const whatsappNumber = phoneDigits(contact.whatsapp || contact.phone);
  const mapsUrl = buildMapsSearchUrl(contact);
  const mapsEmbedUrl = isEmbeddableMap(mapsUrl) ? mapsUrl : '';
  const storefrontFallbackProducts = farmSlug === 'new-dawn'
    ? [
        { ...fallbackProducts[0], image: newDawnLiveChickenImage },
        fallbackProducts[1],
        { ...fallbackProducts[2], image: newDawnDayOldChicksImage },
      ]
    : fallbackProducts;

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [legalView, setLegalView] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchLandingData = async () => {
      if (!farm.id) return;

      try {
        const [productData, testimonialData] = await Promise.all([
          getFarmProducts(farm.id),
          getFarmTestimonials(farm.id),
        ]);

        if (!mounted) return;
        setProducts(productData || []);
        setTestimonials(testimonialData || []);
      } catch (err) {
        console.error("Home data fetch error:", err);
      }
    };

    fetchLandingData();
    return () => {
      mounted = false;
    };
  }, [farm.id]);

  useEffect(() => {
    if (!farm.id) return;
    const syncCartCount = () => setCartCount(getCartCount(farm.id));
    syncCartCount();
    window.addEventListener('storage', syncCartCount);
    window.addEventListener('poultry-cart-updated', syncCartCount);
    return () => {
      window.removeEventListener('storage', syncCartCount);
      window.removeEventListener('poultry-cart-updated', syncCartCount);
    };
  }, [farm.id]);

  const heroHeadline = safeText(farm.branding?.hero_headline, "Farm fresh poultry, ready for your table.");
  const heroWords = heroHeadline.split(/[.,]/).map((part) => part.trim()).filter(Boolean);

  const displayProducts =
    products.length > 0
      ? products.slice(0, 3).map((product, index) => ({
          id: product.id,
          title: safeText(product.name, storefrontFallbackProducts[index]?.title || "Farm Product"),
          desc: safeText(product.description, storefrontFallbackProducts[index]?.desc),
          image: safeImage(product.image_url, storefrontFallbackProducts[index]?.image || broilerImage),
          cta: `Order ${safeText(product.name, "Now")}`,
        }))
      : storefrontFallbackProducts;

  const displayTestimonials = testimonials.length > 0 ? testimonials.slice(0, 2) : fallbackTestimonials;

  const navLinks = [
    { label: "Products", to: `/${farmSlug}/products` },
    { label: "Services", to: `/${farmSlug}/services` },
    { label: "Gallery", to: `/${farmSlug}/gallery` },
    { label: "About", href: "#about" },
    { label: "Reviews", href: "#reviews" },
    { label: "Contact", to: `/${farmSlug}/contact` },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-[#183126]">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-[#fcfaf5]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-[5%] py-4">
          <Link to={`/${farmSlug}`} className="flex min-w-0 items-center gap-3">
            {displayLogo ? (
              <img
                src={displayLogo}
                alt={farmName}
                className="h-14 w-14 shrink-0 rounded-2xl bg-white object-contain p-1.5 shadow-lg"
              />
            ) : (
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {farmName.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-black uppercase tracking-wide">{farmName}</p>
              <p className="truncate text-xs font-bold text-[#6b756d]">{safeText(farm.site_title, fallbackFarm.site_title)}</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) =>
              link.to ? (
                <Link key={link.label} to={link.to} className="text-sm font-black hover:text-[#c2410c]">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="text-sm font-black hover:text-[#c2410c]">
                  {link.label}
                </a>
              )
            )}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to={`/${farmSlug}/order`}
              className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#ead9d6] bg-white text-[#7f1d1d] shadow-sm"
              aria-label="Open cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#b91c1c] px-1 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-[#d8d0c1] bg-white px-5 py-3 text-sm font-black shadow-sm"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <Link
              to={`/${farmSlug}/order`}
              className="flex items-center gap-2 rounded-full bg-[#b91c1c] px-6 py-3 text-sm font-black text-white shadow-lg"
            >
              Order Now
              <ArrowRight size={18} />
            </Link>
          </div>

          <button
            className="rounded-2xl border border-[#e6dfd1] bg-white p-3 text-[#183126] lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-[#e6dfd1] bg-[#fcfaf5] px-[5%] py-5 shadow-xl lg:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) =>
                link.to ? (
                  <Link key={link.label} to={link.to} onClick={() => setMenuOpen(false)} className="text-lg font-black">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)} className="text-lg font-black">
                    {link.label}
                  </a>
                )
              )}
              <Link
                to={`/${farmSlug}/order`}
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-[#b91c1c] px-6 py-4 text-center font-black text-white"
              >
                Order Now
              </Link>
              <Link
                to={`/${farmSlug}/order`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full border border-[#ead9d6] bg-white px-6 py-4 text-center font-black text-[#7f1d1d]"
              >
                <ShoppingCart size={18} />
                Cart{cartCount > 0 ? ` (${cartCount})` : ''}
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section id="home" className="relative min-h-[92vh] overflow-hidden pt-24">
        <div className="absolute inset-0">
          <img src={safeImage(farm.hero_image_url, heroImage)} alt={farmName} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#451a03]/95 via-[#451a03]/78 to-[#451a03]/18" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(92vh-6rem)] max-w-[1200px] items-center gap-12 px-[5%] py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl text-white">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#d6c27c] backdrop-blur">
              <Sprout size={16} />
              {safeText(farm.site_title, fallbackFarm.site_title)}
            </p>
            <h1 className="text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">
              {heroWords.length >= 2 ? (
                <>
                  {heroWords[0]}
                  <br />
                  <span className="text-[#f5e8ad]">{heroWords.slice(1).join(" ")}</span>
                </>
              ) : (
                heroHeadline
              )}
            </h1>
            <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-[#e8eee9] md:text-xl">
              {safeText(farm.branding?.hero_subtitle || farm.hero_subtitle, fallbackFarm.hero_subtitle)}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to={`/${farmSlug}/order`}
                className="flex items-center justify-center gap-3 rounded-full bg-white px-8 py-5 text-base font-black text-[#183126] shadow-2xl transition hover:-translate-y-1"
              >
                Start an Order
                <ArrowRight size={20} />
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 px-8 py-5 text-base font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                <MessageCircle size={20} />
                WhatsApp Enquiry
              </a>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="ml-auto max-w-sm rounded-[32px] border border-white/15 bg-white/12 p-6 text-white shadow-2xl backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#f5e8ad]">Why locals choose us</p>
              <p className="mt-4 text-2xl font-black leading-tight">{safeText(farm.why_content, fallbackFarm.why_content)}</p>
              <div className="mt-8 grid gap-4">
                {["Fresh daily stock", "Bulk and retail orders", "Pickup or local delivery"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-bold text-[#eef5ef]">
                    <CheckCircle2 size={20} className="text-[#d6c27c]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <a
          href="#products"
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-4 py-3 text-xs font-black uppercase tracking-widest text-[#183126] shadow-xl"
        >
          Explore
          <ChevronDown size={16} />
        </a>
      </section>

      <section className="bg-[#7f1d1d] py-8 text-white">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-4 px-[5%] md:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex items-center justify-center gap-3 text-center text-xs font-black uppercase tracking-[0.16em]">
              {badge.icon}
              {badge.label}
            </div>
          ))}
        </div>
      </section>

      <section id="products" className="bg-[#fcfaf5] py-24">
        <div className="mx-auto max-w-[1200px] px-[5%]">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8b6b2f]">Farm highlights</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Order what is fresh now</h2>
            </div>
            <Link to={`/${farmSlug}/products`} className="flex items-center gap-2 text-sm font-black text-[#c2410c]">
              View all products
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {displayProducts.map((product, index) => (
              <article key={product.id || product.title} className="overflow-hidden rounded-[32px] border border-[#e6dfd1] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                </div>
                <div className="p-8">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#8b6b2f]">0{index + 1}</p>
                  <h3 className="text-2xl font-black">{safeText(product.title, "Farm Product")}</h3>
                  <p className="mt-4 min-h-[4.5rem] text-sm font-medium leading-relaxed text-[#5f6c65]">
                    {safeText(product.desc, "Quality poultry product available from the farm.")}
                  </p>
                  <Link
                    to={product.id ? `/${farmSlug}/order?product=${product.id}` : `/${farmSlug}/order`}
                    className="mt-8 flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {safeText(product.cta, "Order Now")}
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-white py-24">
        <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-[5%] lg:grid-cols-2">
          <div className="overflow-hidden rounded-[36px]">
            <img src={aboutImage} alt={`${farmName} owner at the farm`} className="h-full min-h-[420px] w-full object-cover" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8b6b2f]">Our story</p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-6xl">A cleaner way to buy local poultry</h2>
            <p className="mt-8 text-lg font-medium leading-relaxed text-[#5f6c65]">
              {safeText(farm.about_story, fallbackFarm.about_story)}
            </p>
            <p className="mt-5 text-lg font-black leading-relaxed text-[#183126]">
              {safeText(farm.about_headline, fallbackFarm.about_headline)}
            </p>
          </div>
        </div>
      </section>

      <section id="reviews" className="bg-[#f5f0e6] py-24">
        <div className="mx-auto max-w-[1200px] px-[5%]">
          <div className="mb-12 text-center">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8b6b2f]">Customer reviews</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">What customers say</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {displayTestimonials.map((testimonial) => (
              <figure key={testimonial.id || testimonial.author_name} className="rounded-[32px] border border-[#e6dfd1] bg-white p-8 shadow-sm">
                <blockquote className="text-xl font-bold leading-relaxed text-[#183126]">
                  "{safeText(testimonial.quote, "Reliable service and fresh poultry.")}"
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4 border-t border-[#e6dfd1] pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c2410c] font-black text-white">
                    {safeText(testimonial.author_name, "C").charAt(0)}
                  </div>
                  <div>
                    <p className="font-black">{safeText(testimonial.author_name, "Customer")}</p>
                    <p className="text-xs font-black uppercase tracking-widest text-[#8b6b2f]">
                      {safeText(testimonial.author_role, "Verified buyer")}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1200px] px-[5%]">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8b6b2f]">Find us</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Visit the farm with confidence</h2>
              <p className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-[#5f6c65]">
                Get directions straight from the website instead of guessing where the farm is.
              </p>
            </div>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c2410c] px-6 py-4 text-sm font-black text-white shadow-lg"
              >
                Open in Google Maps
                <ArrowRight size={18} />
              </a>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-[32px] border border-[#e6dfd1] bg-[#fcfaf5] p-8 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8b6b2f]">Location details</p>
              <h3 className="mt-4 text-2xl font-black text-[#183126]">The New Dawn Poultry Farm</h3>
              <p className="mt-5 text-base font-medium leading-relaxed text-[#5f6c65]">
                {safeText(contact.address, fallbackFarm.contact_info.address)}
              </p>
              <p className="mt-4 text-sm font-bold text-[#183126]">
                {safeText(contact.operating_hours, "Mon - Sat: 08:00 - 17:00")}
              </p>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-black text-[#c2410c]"
                >
                  Get turn-by-turn directions
                  <ArrowRight size={16} />
                </a>
              )}
            </div>

            <div className="overflow-hidden rounded-[32px] border border-[#e6dfd1] bg-white shadow-sm">
              {mapsEmbedUrl ? (
                <iframe
                  title={`${farmName} map`}
                  src={mapsEmbedUrl}
                  className="h-[420px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-[420px] flex-col items-center justify-center bg-[#f5f0e6] px-8 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-[#8b6b2f]">Google Maps</p>
                  <h3 className="mt-4 text-3xl font-black text-[#183126]">Add an embed URL in admin for an inline map</h3>
                  <p className="mt-4 max-w-lg text-base font-medium leading-relaxed text-[#5f6c65]">
                    For now, customers can still open directions directly in Google Maps using the button.
                  </p>
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex items-center justify-center gap-2 rounded-full border border-[#d8d0c1] bg-white px-6 py-4 text-sm font-black text-[#183126]"
                    >
                      Open Directions
                      <ArrowRight size={18} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#451a03] py-16 text-white">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-[5%] md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <p className="text-2xl font-black">{farmName}</p>
            <p className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-[#c7d3ca]">
              Quality poultry supply for homes, businesses, and community events.
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d6c27c]">Explore</p>
            <div className="mt-5 flex flex-col gap-3 text-sm font-bold text-[#e8eee9]">
              <Link to={`/${farmSlug}/products`}>Products</Link>
              <Link to={`/${farmSlug}/services`}>Services</Link>
              <Link to={`/${farmSlug}/order`}>Order</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d6c27c]">Contact</p>
            <div className="mt-5 flex flex-col gap-3 text-sm font-medium text-[#c7d3ca]">
              <p>{safeText(contact.address, fallbackFarm.contact_info.address)}</p>
              <p>{safeText(contact.phone, fallbackFarm.contact_info.phone)}</p>
              {safeText(contact.email) && <p>{safeText(contact.email)}</p>}
              <a href={`https://wa.me/${whatsappNumber}`} className="font-black text-white">
                WhatsApp Enquiry
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1200px] flex-col gap-4 border-t border-white/10 px-[5%] pt-8 text-sm text-[#c7d3ca] md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} {farmName}. Powered by Poultry Central.</p>
          <div className="flex flex-wrap gap-6">
            <button type="button" onClick={() => setLegalView('terms')} className="font-bold text-white">Terms & Conditions</button>
            <button type="button" onClick={() => setLegalView('privacy')} className="font-bold text-white">Privacy Policy</button>
          </div>
        </div>
      </footer>

      {legalView === 'terms' && (
        <StorefrontLegalModal title="Terms & Conditions" businessName={farmName} onClose={() => setLegalView(null)}>
          <p><strong>{farmName}</strong> manages the products, pricing, availability, order fulfilment, delivery promises, and customer service shown on this storefront.</p>
          <p className="mt-4">Orders placed through this site are treated as requests until the farm confirms stock, collection timing, or delivery details. Bulk or quote-based listings may require direct confirmation before payment or dispatch.</p>
          <p className="mt-4">Customers should provide accurate contact, order, and delivery details. Incorrect details may delay fulfilment or require the farm to contact the customer again before processing.</p>
          <p className="mt-4">Delivery areas, delivery times, payment handling, substitutions, and cancellation decisions remain subject to the farm’s operating rules and product availability.</p>
          <p className="mt-4">Poultry Central provides the software storefront and admin tools, but product responsibility and day-to-day trade remain with {farmName}.</p>
        </StorefrontLegalModal>
      )}

      {legalView === 'privacy' && (
        <StorefrontLegalModal title="Privacy Policy" businessName={farmName} onClose={() => setLegalView(null)}>
          <p><strong>{farmName}</strong> collects customer information needed to respond to enquiries, process orders, arrange collection or delivery, and provide support.</p>
          <p className="mt-4">This may include customer names, phone numbers, email addresses, delivery details, and order notes submitted through the storefront.</p>
          <p className="mt-4">Poultry Central and Kasi Business Hub power the storefront platform and may process this information as a technology provider so the site and order tools can function correctly.</p>
          <p className="mt-4">Customer information should only be used for legitimate business communication, order processing, and service follow-up. It should not be sold or misused for unrelated marketing.</p>
          <p className="mt-4">If a customer wants their submitted information corrected or removed, they should contact {farmName} directly using the contact details shown on this storefront.</p>
        </StorefrontLegalModal>
      )}
    </div>
  );
}

