import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  ArrowLeft,
  Share2,
  MessageSquare,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProductId,
    products,
    reviews,
    addToCart,
    toggleWishlist,
    isInWishlist,
    addReview,
    setActiveCustomerPage,
    setSelectedProductId,
    showToast,
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.variations?.sizes?.[0]
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.variations?.colors?.[0]?.name
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  // Review form state
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discountPercent = product.salePrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product.id, quantity, {
      size: selectedSize,
      color: selectedColor,
    });
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity, {
      size: selectedSize,
      color: selectedColor,
    });
    setActiveCustomerPage('checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) return;

    setIsSubmittingReview(true);
    addReview({
      productId: product.id,
      customerName: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      verifiedPurchase: true,
    });

    setNewReviewAuthor('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setIsSubmittingReview(false);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard!');
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button
          onClick={() => setActiveCustomerPage('home')}
          className="hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <button
          onClick={() => setActiveCustomerPage('catalog')}
          className="hover:text-indigo-600 transition-colors cursor-pointer"
        >
          {product.category}
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-900 font-medium truncate max-w-xs">{product.title}</span>
      </div>

      {/* Main Product Showcase Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs mb-12">
        {/* Images Column (5 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === idx
                      ? 'border-indigo-600 shadow-sm scale-102'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Attributes & Buy Box (7 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-indigo-600">{product.category}</span>
                <span>·</span>
                <span>{product.brand}</span>
                <span>·</span>
                <span className="font-mono text-[11px]">SKU: {product.sku}</span>
              </div>
              <button
                onClick={handleShare}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950 mb-3 tracking-tight">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">{product.rating}</span>
              <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-emerald-600 font-semibold">{product.salesCount} sold</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3 p-4 bg-slate-50 rounded-2xl mb-6">
              <span className="text-3xl font-extrabold text-blue-600 font-mono">
                ৳{(product.salePrice || product.regularPrice).toLocaleString()}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    ৳{product.regularPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Save {discountPercent}% Instant
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">{product.description}</p>

            {/* Color Swatches */}
            {product.variations?.colors && product.variations.colors.length > 0 && (
              <div className="mb-5">
                <span className="text-xs font-bold text-slate-900 block mb-2">
                  Select Color:{' '}
                  <span className="text-slate-600 font-normal">
                    {selectedColor || product.variations.colors[0].name}
                  </span>
                </span>
                <div className="flex items-center gap-2.5">
                  {product.variations.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                        (selectedColor || product.variations?.colors?.[0].name) === c.name
                          ? 'border-indigo-600 scale-110 shadow-sm'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {(selectedColor || product.variations?.colors?.[0].name) === c.name && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.variations?.sizes && product.variations.sizes.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-bold text-slate-900 block mb-2">Available Sizes</span>
                <div className="flex items-center gap-2">
                  {product.variations.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        (selectedSize || product.variations?.sizes?.[0]) === s
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inventory Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-emerald-700">
                    In Stock ({product.stock} units ready to ship)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Currently Out of Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-2.5 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now Instant Checkout */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 cursor-pointer"
              >
                Buy Now
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${
                  isWishlisted ? 'text-rose-500 fill-rose-500 border-rose-200 bg-rose-50/50' : 'text-slate-600'
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Trust highlights checklist */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Free shipping over ৳1,000</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>7 days return policy</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>100% genuine guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content: Specs, Description & Customer Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xs mb-14">
        {/* Tab Buttons (Zero-pill, clean segmented buttons) */}
        <div className="flex border-b border-slate-200 gap-8 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
              activeTab === 'specs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Technical Specifications ({product.specifications?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Verified Reviews</span>
            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 font-semibold">
              {productReviews.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'details' && (
          <div className="space-y-4 max-w-3xl text-xs text-slate-600 leading-relaxed">
            <h3 className="text-sm font-bold text-slate-900">Engineered for Daily Excellence</h3>
            <p>{product.description}</p>
            <p>
              Every unit goes through stringent quality assessment and authentication before packing. Delivered securely with tamper-evident packaging and comprehensive merchant warranty.
            </p>
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specs' && (
          <div className="max-w-2xl">
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {product.specifications?.map((spec, i) => (
                <div key={i} className="flex px-4 py-2.5 text-xs odd:bg-slate-50/50">
                  <span className="w-1/3 font-semibold text-slate-700">{spec.key}</span>
                  <span className="w-2/3 text-slate-600">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Reviews & Add Review Form */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Reviews List (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Customer Ratings & Feedback ({productReviews.length})
              </h3>
              {productReviews.length > 0 ? (
                productReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rev.customerName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4">
                  No verified reviews yet. Be the first to share your experience!
                </p>
              )}
            </div>

            {/* Write a Review Box (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Write a Verified Review</span>
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Share your candid experience with other ShopZone shoppers.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className="cursor-pointer p-1"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newReviewRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {newReviewRating} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Asif Chowdhury"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Your Review
                  </label>
                  <textarea
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="Describe product quality, comfort, packaging, and performance..."
                    required
                    rows={3}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Submit Verified Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Related Products from Category */}
      {relatedProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-950 mb-6">Related Products in {product.category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
