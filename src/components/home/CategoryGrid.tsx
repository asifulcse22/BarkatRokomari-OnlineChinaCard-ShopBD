import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Activity,
  Gamepad2,
  BookOpen,
  ShoppingBag,
  Car,
  HeartPulse,
} from 'lucide-react';

// File: src/components/home/CategoryGrid.tsx

const POPULAR_CATEGORIES = [
  { name: 'Electronics', filterKey: 'Electronics', icon: Laptop },
  { name: 'Fashion', filterKey: 'Fashion & Clothing', icon: Shirt },
  { name: 'Home & Living', filterKey: 'Home & Living', icon: Home },
  { name: 'Beauty', filterKey: 'Beauty & Personal Care', icon: Sparkles },
  { name: 'Sports', filterKey: 'Sports & Outdoors', icon: Activity },
  { name: 'Gaming', filterKey: 'Toys & Games', icon: Gamepad2 },
  { name: 'Books', filterKey: 'Books & Stationery', icon: BookOpen },
  { name: 'Groceries', filterKey: 'Groceries & Daily Needs', icon: ShoppingBag },
  { name: 'Automotive', filterKey: 'Automotive', icon: Car },
  { name: 'Wellness', filterKey: 'Health & Wellness', icon: HeartPulse },
];

export const CategoryGrid: React.FC = () => {
  const { setFilter, setActiveCustomerPage } = useStore();

  const openCategory = (categoryKey: string) => {
    setFilter((f) => ({ ...f, category: categoryKey, search: '' }));
    setActiveCustomerPage('catalog');
  };

  return (
    <section className="mx-auto max-w-[1600px] px-4 pb-6 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="h-5 w-1 rounded bg-brand-600" />
          Top Categories
        </h2>
        <button
          type="button"
          onClick={() => openCategory('All')}
          className="cursor-pointer text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          See all categories
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-5 lg:grid-cols-10">
        {POPULAR_CATEGORIES.map(({ name, filterKey, icon: Icon }) => (
          <button
            key={filterKey}
            type="button"
            onClick={() => openCategory(filterKey)}
            className="group flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-transparent bg-slate-50 px-2 py-4 text-center transition-colors hover:border-brand-600 hover:bg-white"
          >
            <Icon className="h-7 w-7 text-slate-500 transition-colors group-hover:text-brand-600" />
            <span className="line-clamp-1 text-sm font-medium text-slate-700 transition-colors group-hover:text-brand-600">
              {name}
            </span>
          </button>
        ))}
      </div>
      </div>
    </section>
  );
};