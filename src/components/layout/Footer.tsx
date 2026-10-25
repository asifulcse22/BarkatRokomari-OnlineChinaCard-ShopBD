import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Facebook, Instagram, Youtube, Linkedin, Check } from 'lucide-react';

// WhatsApp number: add 88 before the Bangladesh number. No +, spaces or dashes.
const WHATSAPP_NUMBER = '8801911561232';

const WHATSAPP_MESSAGE =
  'আসসালামু আলাইকুম। আমি বরকত রকমারী অনলাইন শপ থেকে পণ্য সম্পর্কে জানতে চাই। অনুগ্রহ করে বিস্তারিত তথ্য জানাবেন। ধন্যবাদ।';

const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;

const WhatsAppIcon: React.FC<{ className?: string }> = ({
  className = 'h-5 w-5',
}) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.52 3.48A11.82 11.82 0 0 0 12.1 0C5.52 0 .17 5.35.17 11.93c0 2.1.55 4.15 1.6 5.96L.06 24l6.27-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.19-3.52-8.42ZM12.1 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.83 9.83 0 0 1-1.52-5.26c0-5.47 4.45-9.92 9.92-9.92 2.65 0 5.14 1.03 7.01 2.91a9.86 9.86 0 0 1 2.9 7.01c0 5.47-4.45 9.92-9.93 9.92Zm5.44-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.8-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35Z" />
  </svg>
);

type FooterLinkItem = { label: string; action?: () => void; href?: string };

export const Footer: React.FC = () => {
  const { setFilter, setActiveCustomerPage } = useStore();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  type Page = Parameters<typeof setActiveCustomerPage>[0];

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const handleNavigate = (page: Page, cat?: string) => {
    if (cat) {
      setFilter((f) => ({ ...f, category: cat, search: '' }));
      setActiveCustomerPage('catalog' as Page);
    } else {
      setActiveCustomerPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const columns: { title: string; links: FooterLinkItem[] }[] = [
    {
      title: 'Quick Links',
      links: [
        { label: 'Home', action: () => handleNavigate('home' as Page) },
        { label: 'Shop Catalog', action: () => handleNavigate('catalog' as Page) },
        { label: 'Flash Deals', action: () => handleNavigate('catalog' as Page) },
        { label: 'New Arrivals', action: () => handleNavigate('catalog' as Page) },
        { label: 'Best Sellers', action: () => handleNavigate('catalog' as Page) },
        { label: 'Contact Us', action: () => handleNavigate('account' as Page) },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { label: 'Help Center', action: () => handleNavigate('account' as Page) },
        { label: 'Track Order', action: () => handleNavigate('account' as Page) },
        { label: 'Shipping Policy', action: () => handleNavigate('account' as Page) },
        { label: 'Return Policy', action: () => handleNavigate('account' as Page) },
        { label: 'Warranty Terms', action: () => handleNavigate('account' as Page) },
        { label: 'FAQs', action: () => handleNavigate('account' as Page) },
      ],
    },
    {
      title: 'About Us',
      links: [
        { label: 'Our Story', href: '#story' },
        { label: 'Careers & Culture', href: '#careers' },
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Merchant Partnership', action: () => handleNavigate('account' as Page) },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#facebook' },
    { icon: Instagram, label: 'Instagram', href: '#instagram' },
    { icon: Youtube, label: 'YouTube', href: '#youtube' },
    { icon: Linkedin, label: 'LinkedIn', href: '#linkedin' },
  ];

  const linkCls =
    'cursor-pointer text-left text-sm text-slate-400 transition-colors hover:text-white';

  return (
    <footer className="border-t-4 border-brand-600 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.4fr]">
          {/* Brand */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleNavigate('home' as Page)}
              aria-label="বরকত রকমারী হোম"
              className="inline-block cursor-pointer rounded-lg bg-white p-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              <img
                src="/logo-backup.png"
                alt="বরকত রকমারী — China Card Online Shop BD"
                className="block h-12 w-auto max-w-[220px] object-contain object-left"
              />
            </button>

            <p className="max-w-sm text-sm leading-6">
              Genuine products, fast delivery and friendly support for everyday shopping.
            </p>

            <a
              href="tel:+8801911561232"
              className="block text-sm font-medium text-white hover:underline"
            >
              +8801911561232
            </a>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-lg bg-[#25D366] px-4 py-2.5 text-white transition-colors hover:bg-[#1fb856]"
            >
              <WhatsAppIcon />
              <span className="text-left leading-tight">
                <span className="block text-sm font-semibold">হোয়াটসঅ্যাপে মেসেজ দিন</span>
                <span className="block text-xs">সরাসরি যোগাযোগ করুন</span>
              </span>
            </a>

            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-sm font-semibold text-white">{column.title}</h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a href={link.href} className={linkCls}>
                        {link.label}
                      </a>
                    ) : (
                      <button type="button" onClick={link.action} className={linkCls}>
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">Newsletter</h4>
            <p className="mb-3 text-sm leading-6">
              Get offers and new arrival updates in your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email"
                aria-label="Email address"
                className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
              />
              <button
                type="submit"
                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                {subscribed ? (
                  <>
                    <Check className="h-4 w-4" />
                    Joined
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
          © 2026 বরকত রকমারী. All rights reserved.
        </div>
      </div>
    </footer>
  );
};