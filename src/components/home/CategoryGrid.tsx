import React from 'react';
import { motion } from 'motion/react';
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
  ArrowRight,
} from 'lucide-react';

const POPULAR_CATEGORIES = [
  {
    name: 'Electronics',
    filterKey: 'Electronics',
    icon: Laptop,
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  {
    name: 'Fashion',
    filterKey: 'Fashion & Clothing',
    icon: Shirt,
    bgColor: 'bg-rose-50 hover:bg-rose-100',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-100',
  },
  {
    name: 'Home & Living',
    filterKey: 'Home & Living',
    icon: Home,
    bgColor: 'bg-teal-50 hover:bg-teal-100',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-100',
  },
  {
    name: 'Beauty',
    filterKey: 'Beauty & Personal Care',
    icon: Sparkles,
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    iconColor: 'text-pink-600',
    borderColor: 'border-pink-100',
  },
  {
    name: 'Sports',
    filterKey: 'Sports & Outdoors',
    icon: Activity,
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
  },
  {
    name: 'Gaming',
    filterKey: 'Toys & Games',
    icon: Gamepad2,
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-100',
  },
  {
    name: 'Books',
    filterKey: 'Books & Stationery',
    icon: BookOpen,
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-100',
  },
  {
    name: 'Groceries',
    filterKey: 'Groceries & Daily Needs',
    icon: ShoppingBag,
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-100',
  },
  {
    name: 'Automotive',
    filterKey: 'Automotive',
    icon: Car,
    bgColor: 'bg-slate-100 hover:bg-slate-200',
    iconColor: 'text-slate-700',
    borderColor: 'border-slate-200',
  },
  {
    name: 'Wellness',
    filterKey: 'Health & Wellness',
    icon: HeartPulse,
    bgColor: 'bg-red-50 hover:bg-red-100',
    iconColor: 'text-red-600',
    borderColor: 'border-red-100',
  },
];

export const CategoryGrid: React.FC = () => {
  const { setFilter, setActiveCustomerPage } = useStore();

  const handleSelectCategory = (categoryKey: string) => {
    setFilter((f) => ({
      ...f,
      category: categoryKey,
      search: '',
    }));
    setActiveCustomerPage('catalog');
  };

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-8">
      {/* Header: "Popular Categories" + "View All Categories →" */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-blue-600 rounded-full" />
          <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
            Popular Categories
          </h2>
        </div>
        <motion.button
          whileHover={{ x: 3 }}
          onClick={() => {
            setFilter((f) => ({ ...f, category: 'All' }));
            setActiveCustomerPage('catalog');
          }}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Explore All Categories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      {/* 10 Circular Category Badges with Spring Motion */}
      <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-3 md:gap-4">
        {POPULAR_CATEGORIES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              whileHover={{ y: -6, scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelectCategory(item.filterKey)}
              className="group flex flex-col items-center text-center cursor-pointer p-1 transition-all"
            >
              {/* Circular Colored Avatar with border & shadow */}
              <div
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl border flex items-center justify-center transition-all duration-300 shadow-xs group-hover:shadow-md mb-2 ${item.bgColor} ${item.iconColor} ${item.borderColor}`}
              >
                <Icon className="w-6 h-6 md:w-7 md:h-7 transition-transform group-hover:scale-115 group-hover:rotate-[-4deg]" />
              </div>
              {/* Label */}
              <span className="text-[11px] md:text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">
                {item.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
