import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Order,
  Coupon,
  Review,
  CartItem,
  OrderStatus,
  MarketingCampaign,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
} from '../data/mockData';

export interface FilterState {
  category: string;
  search: string;
  minPrice: number;
  maxPrice: number;
  brand: string;
  sortBy: 'featured' | 'bestseller' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  inStockOnly: boolean;
}

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  // Navigation & Role State
  viewMode: 'customer' | 'admin';
  setViewMode: (mode: 'customer' | 'admin') => void;
  activeCustomerPage: 'home' | 'catalog' | 'product-detail' | 'checkout' | 'account' | 'order-success';
  setActiveCustomerPage: (page: 'home' | 'catalog' | 'product-detail' | 'checkout' | 'account' | 'order-success') => void;
  activeAdminTab: 'ai-center' | 'products' | 'orders' | 'coupons' | 'marketing';
  setActiveAdminTab: (tab: 'ai-center' | 'products' | 'orders' | 'coupons' | 'marketing') => void;
  aiSubTab: 'overview' | 'advisor' | 'stock' | 'marketing' | 'insights' | 'ask';
  setAiSubTab: (subTab: 'overview' | 'advisor' | 'stock' | 'marketing' | 'insights' | 'ask') => void;

  // Selected Entity state
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  latestPlacedOrder: Order | null;
  setLatestPlacedOrder: (order: Order | null) => void;
  activeOrderToTrack: Order | null;
  setActiveOrderToTrack: (order: Order | null) => void;

  // Data Collections
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  cart: CartItem[];
  wishlist: string[];
  appliedCoupon: Coupon | null;
  campaigns: MarketingCampaign[];

  // Filter state
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilter: () => void;

  // Cart operations
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: string, quantity?: number, variations?: { size?: string; color?: string; storage?: string }) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  cartShippingFee: number;
  cartTotal: number;
  cartCount: number;

  // Coupon operations
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist operations
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Order operations
  placeOrder: (orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingHistory'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  requestReturn: (orderId: string, reason: string) => void;

  // Product management operations (Admin)
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'createdAt' | 'rating' | 'reviewCount' | 'salesCount'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  applyDiscountToProduct: (productId: string, discountPercent: number) => void;

  // Coupon operations (Admin)
  addCoupon: (coupon: Coupon) => void;
  toggleCouponStatus: (code: string) => void;
  deleteCoupon: (code: string) => void;

  // Marketing operations
  saveCampaign: (campaign: Omit<MarketingCampaign, 'id' | 'createdAt'>) => void;
  updateCampaignStatus: (id: string, status: 'draft' | 'approved' | 'published') => void;

  // Reviews operations
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;

  // Toast notifications
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const DEFAULT_FILTER: FilterState = {
  category: 'All',
  search: '',
  minPrice: 0,
  maxPrice: 200000,
  brand: 'All',
  sortBy: 'featured',
  inStockOnly: false,
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [activeCustomerPage, setActiveCustomerPage] = useState<'home' | 'catalog' | 'product-detail' | 'checkout' | 'account' | 'order-success'>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<'ai-center' | 'products' | 'orders' | 'coupons' | 'marketing'>('ai-center');
  const [aiSubTab, setAiSubTab] = useState<'overview' | 'advisor' | 'stock' | 'marketing' | 'insights' | 'ask'>('overview');

  // Selected entities
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<Order | null>(null);
  const [activeOrderToTrack, setActiveOrderToTrack] = useState<Order | null>(null);

  // Core Data Collections
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sz_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some((p: any) => p.id === 'prod-iphone15')) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_PRODUCTS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sz_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('sz_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('sz_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sz_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('sz_wishlist');
    return saved ? JSON.parse(saved) : ['prod-iphone15', 'prod-sony-wh1000xm5'];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([
    {
      id: 'camp-1',
      title: 'iPhone 15 & Audio Super Deals',
      channel: 'facebook',
      language: 'bn',
      content: '🔥 মেগা ডিসকাউন্ট! iPhone 15 এবং Sony WH-1000XM5 এখন আকর্ষণীয় মূল্যে ShopZone-এ। ক্যাশ অন ডেলিভারি এবং দ্রুত শিপিং!',
      headline: 'সেরা গ্যাজেট সেরা দামে — ShopZone',
      createdAt: '2026-10-10',
      status: 'published',
      targetProductTitle: 'iPhone 15 (128GB)',
    },
  ]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    category: 'All',
    search: '',
    minPrice: 0,
    maxPrice: 200000,
    brand: 'All',
    sortBy: 'featured',
    inStockOnly: false,
  });
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sz_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sz_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sz_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('sz_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sz_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Toast manager
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart math
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  let cartDiscount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minOrder) {
    if (appliedCoupon.discountType === 'percentage') {
      cartDiscount = (cartSubtotal * appliedCoupon.discountValue) / 100;
    } else {
      cartDiscount = Math.min(appliedCoupon.discountValue, cartSubtotal);
    }
  }

  // Free shipping on subtotal >= ৳1,000 or with FREESHIP coupon
  const cartShippingFee = cartSubtotal >= 1000 || appliedCoupon?.code === 'FREESHIP' || cart.length === 0 ? 0 : 100;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartShippingFee);

  // Cart operations
  const addToCart = (
    productId: string,
    quantity = 1,
    variations?: { size?: string; color?: string; storage?: string }
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
      showToast('Sorry, this product is currently out of stock!', 'error');
      return;
    }

    const price = product.salePrice || product.regularPrice;

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === productId &&
          item.selectedSize === variations?.size &&
          item.selectedColor === variations?.color &&
          item.selectedStorage === variations?.storage
      );

      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > product.stock) {
          showToast(`Only ${product.stock} units available in stock`, 'info');
          return prev.map((item) => (item === existing ? { ...item, quantity: product.stock } : item));
        }
        return prev.map((item) => (item === existing ? { ...item, quantity: nextQty } : item));
      }

      return [
        ...prev,
        {
          productId,
          quantity: Math.min(quantity, product.stock),
          selectedSize: variations?.size,
          selectedColor: variations?.color,
          selectedStorage: variations?.storage,
          unitPrice: price,
        },
      ];
    });

    showToast(`Added "${product.title}" to your cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (quantity > product.stock) {
      showToast(`Only ${product.stock} units available in stock`, 'info');
      quantity = product.stock;
    }

    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupon handling
  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === clean);

    if (!found) {
      return { success: false, message: 'Invalid coupon code. Try WELCOME10 or MEGA25.' };
    }

    if (!found.active) {
      return { success: false, message: 'This coupon campaign has expired.' };
    }

    if (cartSubtotal < found.minOrder) {
      return {
        success: false,
        message: `Minimum order subtotal of $${found.minOrder} required for coupon ${found.code}.`,
      };
    }

    setAppliedCoupon(found);
    showToast(`Coupon "${found.code}" applied successfully!`);
    return { success: true, message: `Coupon applied: ${found.description}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Wishlist handling
  const toggleWishlist = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast(`Removed from wishlist`, 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast(`Saved "${product?.title || 'item'}" to your wishlist`);
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Order Placement
  const placeOrder = (
    orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingHistory'>
  ): Order => {
    const newId = `ord-${Date.now().toString().slice(-6)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SZ-2026-${randomSuffix}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderInput,
      id: newId,
      orderNumber,
      createdAt: now,
      trackingHistory: [
        {
          status: 'Pending',
          timestamp: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          note: `Order placed successfully via ${orderInput.paymentMethod.toUpperCase()}.`,
        },
      ],
    };

    // Deduct stock and increment sales count
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = orderInput.items.find((item) => item.productId === p.id);
        if (orderedItem) {
          const nextStock = Math.max(0, p.stock - orderedItem.quantity);
          return {
            ...p,
            stock: nextStock,
            salesCount: p.salesCount + orderedItem.quantity,
          };
        }
        return p;
      })
    );

    // Save order
    setOrders((prev) => [newOrder, ...prev]);
    setLatestPlacedOrder(newOrder);

    // Update coupon usage count if used
    if (orderInput.couponCode) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.code.toUpperCase() === orderInput.couponCode?.toUpperCase()
            ? { ...c, timesUsed: c.timesUsed + 1 }
            : c
        )
      );
    }

    clearCart();
    setActiveCustomerPage('order-success');
    showToast(`Order ${orderNumber} placed successfully!`);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const defaultNotes: Record<OrderStatus, string> = {
          Pending: 'Order awaiting verification.',
          Confirmed: 'Order confirmed and payment verified.',
          Processing: 'Items gathered, boxed, and packed in warehouse.',
          Shipped: 'Package dispatched with tracked courier.',
          Delivered: 'Package successfully delivered to recipient.',
          Cancelled: 'Order cancelled.',
          'Return Requested': 'Customer requested a return/refund.',
          Returned: 'Return received and refund settled.',
        };

        const nowFormatted = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const newStep = {
          status,
          timestamp: nowFormatted,
          note: note || defaultNotes[status],
        };

        return {
          ...order,
          orderStatus: status,
          paymentStatus: status === 'Delivered' || status === 'Shipped' ? 'verified' : order.paymentStatus,
          trackingHistory: [...order.trackingHistory, newStep],
        };
      })
    );
    showToast(`Order status updated to "${status}"`);
  };

  const cancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const nowFormatted = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        return {
          ...order,
          orderStatus: 'Cancelled',
          cancellationReason: reason,
          trackingHistory: [
            ...order.trackingHistory,
            { status: 'Cancelled', timestamp: nowFormatted, note: `Cancellation Reason: ${reason}` },
          ],
        };
      })
    );
    showToast('Order cancellation request processed', 'info');
  };

  const requestReturn = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const nowFormatted = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        return {
          ...order,
          orderStatus: 'Return Requested',
          returnReason: reason,
          trackingHistory: [
            ...order.trackingHistory,
            { status: 'Return Requested', timestamp: nowFormatted, note: `Return Reason: ${reason}` },
          ],
        };
      })
    );
    showToast('Return request submitted for administrator review', 'info');
  };

  // Product CRUD (Admin)
  const addProduct = (
    productInput: Omit<Product, 'id' | 'slug' | 'createdAt' | 'rating' | 'reviewCount' | 'salesCount'>
  ) => {
    const id = `prod-${Date.now().toString().slice(-5)}`;
    const slug = productInput.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct: Product = {
      ...productInput,
      id,
      slug,
      rating: 5.0,
      reviewCount: 0,
      salesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Added product "${newProduct.title}" to catalog`);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Updated product "${updated.title}"`);
  };

  const deleteProduct = (productId: string) => {
    const p = products.find((item) => item.id === productId);
    setProducts((prev) => prev.filter((item) => item.id !== productId));
    showToast(`Product "${p?.title || ''}" removed from catalog`, 'info');
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
    showToast(`Stock updated to ${newStock} units`);
  };

  const applyDiscountToProduct = (productId: string, discountPercent: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newSale = Math.round(p.regularPrice * (1 - discountPercent / 100));
          return { ...p, salePrice: newSale };
        }
        return p;
      })
    );
    showToast(`Applied ${discountPercent}% discount to product`);
  };

  // Coupons (Admin)
  const addCoupon = (coupon: Coupon) => {
    setCoupons((prev) => [coupon, ...prev]);
    showToast(`Created promotion coupon "${coupon.code}"`);
  };

  const toggleCouponStatus = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
    showToast(`Updated status for coupon "${code}"`);
  };

  const deleteCoupon = (code: string) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    showToast(`Deleted coupon "${code}"`, 'info');
  };

  // Marketing Campaigns
  const saveCampaign = (campaignInput: Omit<MarketingCampaign, 'id' | 'createdAt'>) => {
    const newCamp: MarketingCampaign = {
      ...campaignInput,
      id: `camp-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    showToast(`Marketing campaign "${newCamp.title}" saved!`);
  };

  const updateCampaignStatus = (id: string, status: 'draft' | 'approved' | 'published') => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
    showToast(`Campaign status updated to "${status}"`);
  };

  // Reviews
  const addReview = (reviewInput: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewInput,
      id: `rev-${Date.now().toString().slice(-5)}`,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews((prev) => [newReview, ...prev]);

    // Update product rating
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === reviewInput.productId) {
          const nextCount = p.reviewCount + 1;
          const nextRating = Number(((p.rating * p.reviewCount + reviewInput.rating) / nextCount).toFixed(1));
          return { ...p, rating: nextRating, reviewCount: nextCount };
        }
        return p;
      })
    );

    showToast('Thank you! Your verified review has been submitted.');
  };

  const resetFilter = () => {
    setFilter(DEFAULT_FILTER);
  };

  return (
    <StoreContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeCustomerPage,
        setActiveCustomerPage,
        activeAdminTab,
        setActiveAdminTab,
        aiSubTab,
        setAiSubTab,

        selectedProductId,
        setSelectedProductId,
        quickViewProduct,
        setQuickViewProduct,
        latestPlacedOrder,
        setLatestPlacedOrder,
        activeOrderToTrack,
        setActiveOrderToTrack,

        products,
        categories,
        orders,
        coupons,
        reviews,
        cart,
        wishlist,
        appliedCoupon,
        campaigns,

        filter,
        setFilter,
        resetFilter,

        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartDiscount,
        cartShippingFee,
        cartTotal,
        cartCount,

        applyCoupon,
        removeCoupon,

        toggleWishlist,
        isInWishlist,

        placeOrder,
        updateOrderStatus,
        cancelOrder,
        requestReturn,

        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,
        applyDiscountToProduct,

        addCoupon,
        toggleCouponStatus,
        deleteCoupon,

        saveCampaign,
        updateCampaignStatus,

        addReview,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
