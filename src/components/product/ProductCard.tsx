import React, { useState } from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingCart, Eye, Check, Wrench } from 'lucide-react';

// File: src/components/product/ProductCard.tsx

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    setSelectedProductId,
    setActiveCustomerPage,
    setQuickViewProduct,
    openSetupGuide,
  } = useStore();

  const [justAdded, setJustAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);
  const outOfStock = product.stock <= 0;

  const price = product.salePrice || product.regularPrice;
  const discountPercent = product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  const handleOpenDetail = () => {
    setSelectedProductId(product.id);
    setActiveCustomerPage('product-detail');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const iconBtn =
    'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:text-brand-600';

  return (
    <div className="group relative flex h-full w-full min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-200 hover:border-brand-600 hover:shadow-md">
      {/* Image */}
      <div
        className="relative h-60 cursor-pointer bg-white p-2"
        onClick={handleOpenDetail}
      >
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-contain"
        />

        {discountPercent > 0 && (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            -{discountPercent}%
          </span>
        )}

        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <button
            type="button"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={iconBtn}
          >
            <Heart
              className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
            />
          </button>
          <button
            type="button"
            aria-label="Quick view"
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className={iconBtn}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2 border-t border-slate-100 p-3">
        <h3
          onClick={handleOpenDetail}
          title={product.title}
          className="line-clamp-2 min-h-12 cursor-pointer text-sm font-medium leading-6 text-slate-900 transition-colors hover:text-brand-600"
        >
          {product.title}
        </h3>

        {product.setupGuide && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openSetupGuide(product);
            }}
            className="flex cursor-pointer items-center gap-1 self-start text-xs font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            <Wrench className="h-3.5 w-3.5" />
            সেটআপ গাইড
          </button>
        )}

        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-semibold text-slate-900">
            ৳{price.toLocaleString()}
          </span>
          {product.salePrice && (
            <span className="text-sm text-slate-400 line-through">
              ৳{product.regularPrice.toLocaleString()}
            </span>
          )}
        </div>

        {outOfStock && <p className="text-xs font-medium text-red-600">Out of stock</p>}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
            justAdded
              ? 'bg-emerald-600 text-white'
              : outOfStock
              ? 'cursor-not-allowed bg-slate-200 text-slate-400'
              : 'bg-brand-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-lg active:translate-y-0'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              {outOfStock ? 'Sold out' : 'Add to cart'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};