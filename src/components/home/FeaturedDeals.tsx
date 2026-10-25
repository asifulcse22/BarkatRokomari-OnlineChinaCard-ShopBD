import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';

// File: src/components/home/FeaturedDeals.tsx

type Tab = 'all' | 'smart' | 'other';

// Featured Smart Gadget (ager moto-i)
const SMART_PRODUCT_IDS = [
  'prod-wifi-bulb-cam',
  'prod-gps-tracker-mini',
  'prod-motion-sensor-bulb',
  'prod-remote-sensor-holder',
];

// Best selling hishebe agey dekhano hobe (ager moto-i)
const PREFERRED_BESTSELLER_IDS = [
  'prod-iphone15',
  'prod-sony-wh1000xm5',
  'prod-asus-vivobook',
  'prod-galaxy-watch6',
  'prod-solar-motion-light',
  'prod-dual-lens-camera',
  'prod-mini-ip-camera',
];

const isProduct = (p: Product | undefined): p is Product => Boolean(p);

const uniqueById = (list: Product[]) =>
  list.filter((p, i) => list.findIndex((x) => x.id === p.id) === i);

export const FeaturedDeals: React.FC = () => {
  const { products, setFilter, setActiveCustomerPage, openSetupGuide } = useStore();
  const [tab, setTab] = useState<Tab>('all');

  const smartGadgets = SMART_PRODUCT_IDS.map((id) =>
    products.find((p) => p.id === id)
  ).filter(isProduct);

  const preferred = PREFERRED_BESTSELLER_IDS.map((id) =>
    products.find((p) => p.id === id)
  )
    .filter(isProduct)
    .filter((p) => !SMART_PRODUCT_IDS.includes(p.id));

  // Admin ba mockData theke notun product add korle jate bad na pore
  const rest = products.filter(
    (p) =>
      !SMART_PRODUCT_IDS.includes(p.id) && !preferred.some((x) => x.id === p.id)
  );

  const otherProducts = uniqueById([...preferred, ...rest]);
  const allProducts = uniqueById([...smartGadgets, ...otherProducts]);

  const displayed =
    tab === 'smart' ? smartGadgets : tab === 'other' ? otherProducts : allProducts;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: `সকল (${allProducts.length})` },
    ...(smartGadgets.length > 0
      ? [{ id: 'smart' as Tab, label: 'স্মার্ট গ্যাজেট' }]
      : []),
    { id: 'other', label: 'অন্যান্য' },
  ];

  const viewAll = () => {
    setFilter((f) => ({ ...f, category: 'All', sortBy: 'bestseller' }));
    setActiveCustomerPage('catalog');
  };

  return (
    <section className="mx-auto w-full min-w-0 max-w-[1600px] px-4 pb-10 pt-2 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="h-5 w-1 rounded bg-brand-600" />
          Best Selling Products
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                tab === id
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-brand-600 hover:text-brand-600'
              }`}
            >
              {label}
            </button>
          ))}

          {smartGadgets.length > 0 && (
            <button
              type="button"
              onClick={() => openSetupGuide()}
              className="cursor-pointer px-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
            >
              সেটআপ গাইড
            </button>
          )}

          <button
            type="button"
            onClick={viewAll}
            className="cursor-pointer px-2 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            সকল পণ্য দেখুন
          </button>
        </div>
      </div>

        <div className="grid w-full min-w-0 grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayed.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      </div>
    </section>
  );
};