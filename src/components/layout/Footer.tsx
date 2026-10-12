
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

export const Footer: React.FC = () => {
  const { setFilter, setActiveCustomerPage } = useStore();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
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
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55 }}
            className="space-y-5"
          >
            {/* Logo + Shop Name */}
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              aria-label="Go to ShopZone home"
              className="group flex items-center gap-3 text-left"
            >
              <span className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-white shadow-md shadow-violet-200/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-violet-300/50">
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-orange-400/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <img
                  src="/logo.png"
                  alt="বরকত রকমারী"
                  className="relative z-10 h-full w-full object-contain p-1"
                />
              </span>

              <span className="flex min-w-0 flex-col">
                <span className="bg-gradient-to-r from-violet-700 via-blue-600 to-orange-500 bg-clip-text text-lg font-extrabold leading-tight tracking-tight text-transparent transition-all duration-300 group-hover:tracking-wide sm:text-xl">
                  বরকত রকমারী
                </span>

                <span className="mt-1 text-[11px] font-semibold leading-relaxed text-slate-500 transition-colors group-hover:text-violet-600 sm:text-xs">
                  China Card Online Shop BD
                </span>

                <span className="mt-1.5 h-[2px] w-0 rounded-full bg-gradient-to-r from-violet-600 via-blue-500 to-orange-400 transition-all duration-500 group-hover:w-full" />
              </span>
            </button>

            <p className="max-w-sm text-xs leading-6 text-slate-600">
              Your premier multi-category digital shopping destination.
              Verified genuine products, lightning-fast fulfillment,
              and 24/7 dedicated assistance.
            </p>

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-2 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-violet-600" />
              <span className="text-[11px] font-semibold text-slate-700">
                Shopping You Can Trust
              </span>
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            </div>

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

          {/* About ShopZone */}
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
            <span>256-Bit SSL Encrypted & PCI-DSS Compliant</span>
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
