import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowUp,
  Mail,
  Heart,
} from 'lucide-react';

// নিজের WhatsApp নম্বর এখানে বসাও:
// বাংলাদেশের নম্বরের আগে 88 যোগ করবে। +, স্পেস বা ড্যাশ দেবে না।
const WHATSAPP_NUMBER = '8801911561232';

const WHATSAPP_MESSAGE =
  'আসসালামু আলাইকুম। আমি বরকত রকমারী অনলাইন শপ থেকে পণ্য সম্পর্কে জানতে চাই। অনুগ্রহ করে বিস্তারিত তথ্য জানাবেন। ধন্যবাদ।';

const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;

// WhatsApp brand icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({
  className = 'h-5 w-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.52 0 .17 5.35.17 11.93c0 2.1.55 4.15 1.6 5.96L.06 24l6.27-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.52-8.42ZM12.1 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.83 9.83 0 0 1-1.52-5.26c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.01 2.91a9.86 9.86 0 0 1 2.9 7.01c0 5.47-4.45 9.92-9.93 9.92Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.8-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35Z" />
  </svg>
);

export const Footer: React.FC = () => {
  const { setFilter, setActiveCustomerPage } = useStore();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const handleNavigate = (page: any, cat?: string) => {
    if (cat) {
      setFilter((f) => ({
        ...f,
        category: cat,
        search: '',
      }));
      setActiveCustomerPage('catalog');
    } else {
      setActiveCustomerPage(page);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'Home', action: () => handleNavigate('home') },
    { label: 'Shop Catalog', action: () => handleNavigate('catalog') },
    { label: 'Flash Deals', action: () => handleNavigate('catalog') },
    { label: 'New Arrivals', action: () => handleNavigate('catalog') },
    { label: 'Best Sellers', action: () => handleNavigate('catalog') },
    { label: 'Contact Us', action: () => handleNavigate('account') },
  ];

  const serviceLinks = [
    { label: 'Help Center', action: () => handleNavigate('account') },
    { label: 'Track Order', action: () => handleNavigate('account') },
    { label: 'Shipping Policy', action: () => handleNavigate('account') },
    { label: 'Return Policy', action: () => handleNavigate('account') },
    { label: 'Warranty Terms', action: () => handleNavigate('account') },
    { label: 'FAQs', action: () => handleNavigate('account') },
  ];

  const aboutLinks = [
    { label: 'Our Story', href: '#story' },
    { label: 'Careers & Culture', href: '#careers' },
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#facebook' },
    { icon: Instagram, label: 'Instagram', href: '#instagram' },
    { icon: Youtube, label: 'YouTube', href: '#youtube' },
    { icon: Linkedin, label: 'LinkedIn', href: '#linkedin' },
  ];

  const columns = [
    {
      title: 'Quick Links',
      links: quickLinks,
    },
    {
      title: 'Customer Service',
      links: serviceLinks,
    },
  ];

  return (
    <footer className="relative isolate overflow-hidden border-t border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 text-slate-600">
      {/* Decorative Background Effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-28 top-0 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {/* Brand Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-5"
          >
            {/* Logo — Image Only, Minimal Motion */}
            <motion.button
              type="button"
              onClick={() => handleNavigate('home')}
              aria-label="বরকত রকমারী হোম"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="inline-flex cursor-pointer items-center rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <img
                src="/logo-backup.png"
                alt="বরকত রকমারী — China Card Online Shop BD"
                className="
                  block
                  h-[62px] w-[190px]
                  sm:h-[68px] sm:w-[210px]
                  object-contain object-left
                "
              />
            </motion.button>

            <p className="max-w-sm text-xs leading-6 text-slate-600">
              Your premier multi-category digital shopping destination.
              Verified genuine products, lightning-fast fulfillment,
              and 24/7 dedicated assistance.
            </p>

            {/* Trust Badge */}
            <motion.div
              whileHover={{ y: -2 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-2 shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 text-violet-600" />
              <span className="text-[11px] font-semibold text-slate-700">
                Shopping You Can Trust
              </span>
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            </motion.div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-1">
              {socialLinks.map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -4, scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-100 bg-white text-violet-600 shadow-sm transition-colors duration-300 hover:border-violet-500 hover:bg-violet-600 hover:text-white hover:shadow-lg hover:shadow-violet-300/40"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links + Customer Service */}
          {columns.map((column, columnIndex) => (
            <motion.div
              key={column.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: columnIndex * 0.1 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-sm font-extrabold tracking-wide text-slate-800">
                  {column.title}
                </h4>
                <span className="mt-2 block h-[3px] w-10 rounded-full bg-gradient-to-r from-violet-600 to-blue-500" />
              </div>

              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <button
                      type="button"
                      onClick={link.action}
                      className="group/link inline-flex items-center gap-2 text-left text-xs text-slate-600 transition-all duration-300 hover:translate-x-1 hover:text-violet-700"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300 transition-colors group-hover/link:bg-orange-500" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* About Shop */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h4 className="text-sm font-extrabold tracking-wide text-slate-800">
                About ShopZone
              </h4>
              <span className="mt-2 block h-[3px] w-10 rounded-full bg-gradient-to-r from-blue-500 to-orange-400" />
            </div>

            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group/link inline-flex items-center gap-2 text-xs text-slate-600 transition-all duration-300 hover:translate-x-1 hover:text-violet-700"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300 transition-colors group-hover/link:bg-orange-500" />
                    {link.label}
                  </a>
                </li>
              ))}

              <li>
                <button
                  type="button"
                  onClick={() => handleNavigate('account')}
                  className="group/link inline-flex items-center gap-2 text-left text-xs text-slate-600 transition-all duration-300 hover:translate-x-1 hover:text-violet-700"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300 transition-colors group-hover/link:bg-orange-500" />
                  Merchant Partnership
                </button>
              </li>
            </ul>

             {/* WhatsApp Contact Button */}
            <motion.a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              WHATSAPP_MESSAGE
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
           className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center gap-2
            rounded-lg border border-amber-300
            bg-gradient-to-r from-amber-200 via-orange-200 to-red-200
            px-3 py-2 text-gray-900 shadow-sm
            transition-all duration-300
            hover:-translate-y-0.5 hover:shadow-md
            active:translate-y-0"
            style={{
              fontFamily: "'Hind Siliguri', sans-serif",
              WebkitFontSmoothing: "antialiased",
            }}
          >
            <WhatsAppIcon />

            <span className="text-left">
              <span className="block text-sm font-bold leading-5 text-gray-900">
                হোয়াটসঅ্যাপে মেসেজ দিন
              </span>
              <span className="block text-xs font-semibold leading-4 text-gray-800">
                সরাসরি যোগাযোগ করুন
              </span>
            </span>
          </motion.a>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-violet-100 bg-white/80 p-5 shadow-lg shadow-violet-100/60 backdrop-blur-sm"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-200/40 blur-2xl" />

            <div className="relative">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-md shadow-violet-300/40">
                <Mail className="h-5 w-5" />
              </div>

              <h4 className="text-sm font-extrabold text-slate-800">
                VIP Newsletter
              </h4>

              <p className="mt-2 text-xs leading-5 text-slate-600">
                Get secret discounts, early drop notices and flash sale vouchers.
              </p>

              <form onSubmit={handleSubscribe} className="mt-4">
                <div className="flex min-w-0 overflow-hidden rounded-xl border border-violet-100 bg-white transition-all duration-300 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    aria-label="Email address"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-xs text-slate-800 outline-none placeholder:text-slate-400"
                  />

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    className="shrink-0 bg-gradient-to-r from-violet-600 to-blue-600 px-3 py-3 text-xs font-bold text-white transition-all hover:from-violet-700 hover:to-blue-700"
                  >
                    <AnimatePresence mode="wait">
                      {subscribed ? (
                        <motion.span
                          key="done"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Joined!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="subscribe"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Subscribe
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>

                <p className="mt-3 text-[10px] leading-4 text-slate-500">
                  Special offers and updates, delivered to your inbox.
                </p>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Bottom Accent */}
        <div className="mt-10 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />

        {/* Copyright + Security */}
        <div className="flex flex-col items-center justify-between gap-4 pt-5 text-center sm:flex-row sm:text-left">
          <p className="text-[11px] text-slate-500">
            © 2026 ShopZone Inc. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted &amp; PCI-DSS Compliant</span>
          </div>

          <p className="flex items-center gap-1 text-[11px] text-slate-500">
            Made with
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            for shoppers
          </p>
        </div>
      </div>

      {/* Back to Top */}
      <motion.button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        whileHover={{ y: -4, scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="absolute bottom-5 right-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-300/50 transition-shadow hover:shadow-xl hover:shadow-violet-400/50 sm:bottom-6 sm:right-6"
      >
        <ArrowUp className="h-5 w-5" />
      </motion.button>
    </footer>
  );
};