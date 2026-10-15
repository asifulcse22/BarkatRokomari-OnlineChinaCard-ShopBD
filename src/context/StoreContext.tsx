import { useAuth } from './AuthContext';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';

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

// localStorage keys
const LS = {
  products: 'sz_products_v2',
  orders: 'sz_orders_v2',
  coupons: 'sz_coupons_v2',
  reviews: 'sz_reviews_v2',
  cart: 'sz_cart_v2',
  wishlist: 'sz_wishlist_v2',
};

export interface FilterState {
  category: string;
  search: string;
  minPrice: number;
  maxPrice: number;
  brand: string;
  sortBy:
    | 'featured'
    | 'bestseller'
    | 'price-asc'
    | 'price-desc'
    | 'rating'
    | 'newest';
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

  activeCustomerPage:
    | 'home'
    | 'catalog'
    | 'product-detail'
    | 'checkout'
    | 'account'
    | 'order-success';

  setActiveCustomerPage: (
    page:
      | 'home'
      | 'catalog'
      | 'product-detail'
      | 'checkout'
      | 'account'
      | 'order-success'
  ) => void;

  activeAdminTab:
    | 'ai-center'
    | 'products'
    | 'orders'
    | 'coupons'
    | 'marketing';

  setActiveAdminTab: (
    tab:
      | 'ai-center'
      | 'products'
      | 'orders'
      | 'coupons'
      | 'marketing'
  ) => void;

  aiSubTab:
    | 'overview'
    | 'advisor'
    | 'stock'
    | 'marketing'
    | 'insights'
    | 'ask';

  setAiSubTab: (
    subTab:
      | 'overview'
      | 'advisor'
      | 'stock'
      | 'marketing'
      | 'insights'
      | 'ask'
  ) => void;

  // Selected Entity state
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;

  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  setupGuideModalProduct: Product | null;
  setSetupGuideModalProduct: (product: Product | null) => void;

  openSetupGuide: (productOrId?: string | Product) => void;

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

  addToCart: (
    productId: string,
    quantity?: number,
    variations?: {
      size?: string;
      color?: string;
      storage?: string;
    }
  ) => void;

  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  cartSubtotal: number;
  cartDiscount: number;
  cartShippingFee: number;
  cartTotal: number;
  cartCount: number;

  // Coupon operations
  applyCoupon: (code: string) => {
    success: boolean;
    message: string;
  };

  removeCoupon: () => void;

  // Wishlist operations
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Order operations
  placeOrder: (
    orderInput: Omit<
      Order,
      'id' | 'orderNumber' | 'createdAt' | 'trackingHistory'
    >
  ) => Order;

  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    note?: string
  ) => void;

  cancelOrder: (orderId: string, reason: string) => void;
  requestReturn: (orderId: string, reason: string) => void;

  // Product management operations
  addProduct: (
    product: Omit<
      Product,
      | 'id'
      | 'slug'
      | 'createdAt'
      | 'rating'
      | 'reviewCount'
      | 'salesCount'
    >
  ) => void;

  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  applyDiscountToProduct: (
    productId: string,
    discountPercent: number
  ) => void;

  // Coupon management
  addCoupon: (coupon: Coupon) => void;
  toggleCouponStatus: (code: string) => void;
  deleteCoupon: (code: string) => void;

  // Marketing operations
  saveCampaign: (
    campaign: Omit<MarketingCampaign, 'id' | 'createdAt'>
  ) => void;

  updateCampaignStatus: (
    id: string,
    status: 'draft' | 'approved' | 'published'
  ) => void;

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;

  // Toast notifications
  toasts: ToastNotification[];
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info'
  ) => void;

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

// localStorage থেকে নিরাপদে ডেটা পড়বে
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') {
      return fallback;
    }

    const saved = localStorage.getItem(key);

    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (error) {
    console.warn(`Unable to read localStorage key "${key}"`, error);
  }

  return fallback;
}

// localStorage-এ নিরাপদে ডেটা লিখবে
function saveToStorage<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.warn(`Unable to save localStorage key "${key}"`, error);
  }
}

// একই ID-এর ডুপ্লিকেট বাদ দিয়ে দুইটি product list একত্র করে
function mergeProducts(
  currentProducts: Product[],
  incomingProducts: Product[]
): Product[] {
  const productMap = new Map<string, Product>();

  // বর্তমান তালিকার প্রোডাক্ট আগে রাখবে
  currentProducts.forEach((product) => {
    if (product?.id) {
      productMap.set(product.id, product);
    }
  });

  // Incoming data-তে একই ID থাকলে সেটি আপডেট হবে
  // ➕ নতুন: Neon ডাটাবেজে setup_guide কলাম নেই, তাই API থেকে আসা product-এ
  //    setupGuide থাকে না। এখানে পুরোনো setupGuide রেখে দেওয়া হচ্ছে,
  //    নাহলে Neon চালু হলে "সেটআপ গাইড" মুছে যেত।
  incomingProducts.forEach((product) => {
    if (product?.id) {
      const existing = productMap.get(product.id);

      productMap.set(product.id, {
        ...existing,
        ...product,
        setupGuide: product.setupGuide || existing?.setupGuide,
      });
    }
  });

  return Array.from(productMap.values());
}

export const StoreProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Navigation
  const { user: authUser } = useAuth();
  const [viewMode, setViewModeRaw] = useState<'customer' | 'admin'>('customer');

  // অ্যাডমিন প্যানেলে ঢুকতে পারবে শুধু admin রোলের ইউজার
  const setViewMode = (mode: 'customer' | 'admin') => {
    if (mode === 'admin' && authUser?.role !== 'admin') {
      showToast('অ্যাডমিন প্যানেল শুধু অ্যাডমিনের জন্য।', 'error');
      return;
    }
    setViewModeRaw(mode);
  };

  // লগআউট বা রোল বদলালে অ্যাডমিন ভিউ থেকে বের করে দেওয়া
  useEffect(() => {
    if (viewMode === 'admin' && authUser?.role !== 'admin') {
      setViewModeRaw('customer');
    }
  }, [authUser, viewMode]);

  const [activeCustomerPage, setActiveCustomerPage] =
    useState<
      | 'home'
      | 'catalog'
      | 'product-detail'
      | 'checkout'
      | 'account'
      | 'order-success'
    >('home');

  const [activeAdminTab, setActiveAdminTab] = useState<
    'ai-center' | 'products' | 'orders' | 'coupons' | 'marketing'
  >('ai-center');

  const [aiSubTab, setAiSubTab] = useState<
    'overview' | 'advisor' | 'stock' | 'marketing' | 'insights' | 'ask'
  >('overview');

  // Selected entities
  const [selectedProductId, setSelectedProductId] =
    useState<string | null>(null);

  const [quickViewProduct, setQuickViewProduct] =
    useState<Product | null>(null);

  const [setupGuideModalProduct, setSetupGuideModalProduct] =
    useState<Product | null>(null);

  const [latestPlacedOrder, setLatestPlacedOrder] =
    useState<Order | null>(null);

  const [activeOrderToTrack, setActiveOrderToTrack] =
    useState<Order | null>(null);

  // =====================================================
  // PRODUCT INITIALIZATION FIX
  // পুরোনো localStorage থাকলেও mockData-এর নতুন product যোগ হবে
  // =====================================================
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = loadFromStorage<Product[] | null>(
      LS.products,
      null
    );

    if (!Array.isArray(saved)) {
      return INITIAL_PRODUCTS;
    }

    // একই ID-এর saved product-এর তথ্য সংরক্ষণ করবে
    const savedMap = new Map(
      saved
        .filter((product) => product?.id)
        .map((product) => [product.id, product])
    );

    // mockData-এর প্রতিটি product তালিকায় নিশ্চিত করবে
    const mergedInitialProducts = INITIAL_PRODUCTS.map((product) => {
      const savedProduct = savedMap.get(product.id);

      if (!savedProduct) {
        return product;
      }

      return {
        ...product,
        ...savedProduct,
        // mockData-তে গাইড থাকলে পুরোনো localStorage-এর
        // গাইডবিহীন ডেটা সেটিকে মুছে দিতে পারবে না।
        setupGuide: product.setupGuide || savedProduct.setupGuide,
      };
    });

    // Admin থেকে যোগ করা অতিরিক্ত product-ও থাকবে
    const initialIds = new Set(
      INITIAL_PRODUCTS.map((product) => product.id)
    );

    const additionalProducts = saved.filter(
      (product) => product?.id && !initialIds.has(product.id)
    );

    return [
      ...mergedInitialProducts,
      ...additionalProducts,
    ];
  });

  // Setup guide
  const openSetupGuide = (
    productOrId?: string | Product
  ) => {
    if (!productOrId) {
      const defaultProduct =
        products.find(
          (product) => product.id === 'prod-wifi-bulb-cam'
        ) || products[0];

      if (defaultProduct) {
        setSetupGuideModalProduct(defaultProduct);
      }

      return;
    }

    if (typeof productOrId === 'string') {
      const found = products.find(
        (product) => product.id === productOrId
      );

      if (found) {
        setSetupGuideModalProduct(found);
      }

      return;
    }

    setSetupGuideModalProduct(productOrId);
  };

  // Categories
  const categories = useMemo<Category[]>(
    () =>
      INITIAL_CATEGORIES.map((category) => ({
        ...category,
        itemCount: products.filter(
          (product) => product.category === category.name
        ).length,
      })),
    [products]
  );

  // Other data collections
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage<Order[]>(LS.orders, INITIAL_ORDERS)
  );

  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadFromStorage<Coupon[]>(LS.coupons, INITIAL_COUPONS)
  );

  const [reviews, setReviews] = useState<Review[]>(() =>
    loadFromStorage<Review[]>(LS.reviews, INITIAL_REVIEWS)
  );

  const [cart, setCart] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>(LS.cart, [])
  );

  const [wishlist, setWishlist] = useState<string[]>(() =>
    loadFromStorage<string[]>(LS.wishlist, [])
  );

  const [appliedCoupon, setAppliedCoupon] =
    useState<Coupon | null>(null);

  const [campaigns, setCampaigns] =
    useState<MarketingCampaign[]>([]);

  const [isCartOpen, setIsCartOpen] = useState(false);

  const [filter, setFilter] =
    useState<FilterState>(DEFAULT_FILTER);

  const [toasts, setToasts] =
    useState<ToastNotification[]>([]);

  // =====================================================
  // BACKEND / API DATA
  // API-এর product আসলে পুরো তালিকা replace করবে না
  // =====================================================
  useEffect(() => {
    let isMounted = true;

    const loadServerData = () => {
      fetch('/api/products')
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Products API failed: ${response.status}`
            );
          }

          return response.json();
        })
        .then((resData) => {
          if (
            !isMounted ||
            !resData.success ||
            !Array.isArray(resData.data)
          ) {
            return;
          }

          // API data এবং বর্তমান product list merge করবে
          // API empty array পাঠালেও বর্তমান list মুছবে না
          setProducts((currentProducts) =>
            mergeProducts(currentProducts, resData.data)
          );

          if (resData.source === 'neon') {
            console.log(
              '[ShopZone] Connected to Neon Database: Products merged.'
            );
          }
        })
        .catch((error) => {
          console.log('Products API check:', error);
        });

      fetch('/api/orders')
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Orders API failed: ${response.status}`
            );
          }

          return response.json();
        })
        .then((resData) => {
          if (
            isMounted &&
            resData.success &&
            Array.isArray(resData.data) &&
            resData.data.length > 0
          ) {
            setOrders(resData.data);
          }
        })
        .catch((error) => {
          console.log('Orders API check:', error);
        });
    };

    loadServerData();

    // লগইন/লগআউট হলে ডেটা আবার লোড হবে
    window.addEventListener(
      'sz-auth-changed',
      loadServerData
    );

    return () => {
      isMounted = false;

      window.removeEventListener(
        'sz-auth-changed',
        loadServerData
      );
    };
  }, []);

  // =====================================================
  // LOCAL STORAGE SYNC
  // অন্যান্য data sync আগের মতোই রাখা হয়েছে
  // =====================================================
  useEffect(() => {
    saveToStorage(LS.products, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(LS.orders, orders);
  }, [orders]);

  useEffect(() => {
    saveToStorage(LS.coupons, coupons);
  }, [coupons]);

  useEffect(() => {
    saveToStorage(LS.reviews, reviews);
  }, [reviews]);

  useEffect(() => {
    saveToStorage(LS.cart, cart);
  }, [cart]);

  useEffect(() => {
    saveToStorage(LS.wishlist, wishlist);
  }, [wishlist]);

  // Toast manager
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    const id =
      Date.now().toString() +
      Math.random().toString(36).substring(2, 6);

    setToasts((previous) => [
      ...previous,
      { id, message, type },
    ]);

    setTimeout(() => {
      setToasts((previous) =>
        previous.filter((toast) => toast.id !== id)
      );
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((previous) =>
      previous.filter((toast) => toast.id !== id)
    );
  };

  // Cart calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  let cartDiscount = 0;

  if (appliedCoupon && cartSubtotal >= appliedCoupon.minOrder) {
    if (appliedCoupon.discountType === 'percentage') {
      cartDiscount =
        (cartSubtotal * appliedCoupon.discountValue) / 100;
    } else {
      cartDiscount = Math.min(
        appliedCoupon.discountValue,
        cartSubtotal
      );
    }
  }

  const cartShippingFee =
    cartSubtotal >= 1000 ||
    appliedCoupon?.code === 'FREESHIP' ||
    cart.length === 0
      ? 0
      : 100;

  const cartTotal = Math.max(
    0,
    cartSubtotal - cartDiscount + cartShippingFee
  );

  // Cart operations
  const addToCart = (
    productId: string,
    quantity = 1,
    variations?: {
      size?: string;
      color?: string;
      storage?: string;
    }
  ) => {
    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) return;

    if (product.stock <= 0) {
      showToast(
        'Sorry, this product is currently out of stock!',
        'error'
      );
      return;
    }

    const price = product.salePrice || product.regularPrice;

    setCart((previous) => {
      const existing = previous.find(
        (item) =>
          item.productId === productId &&
          item.selectedSize === variations?.size &&
          item.selectedColor === variations?.color &&
          item.selectedStorage === variations?.storage
      );

      if (existing) {
        const nextQuantity = existing.quantity + quantity;

        if (nextQuantity > product.stock) {
          showToast(
            `Only ${product.stock} units available in stock`,
            'info'
          );

          return previous.map((item) =>
            item === existing
              ? { ...item, quantity: product.stock }
              : item
          );
        }

        return previous.map((item) =>
          item === existing
            ? { ...item, quantity: nextQuantity }
            : item
        );
      }

      return [
        ...previous,
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
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((previous) =>
      previous.filter((item) => item.productId !== productId)
    );

    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (
    productId: string,
    quantity: number
  ) => {
    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (quantity > product.stock) {
      showToast(
        `Only ${product.stock} units available in stock`,
        'info'
      );

      quantity = product.stock;
    }

    setCart((previous) =>
      previous.map((item) =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupon handling
  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();

    const found = coupons.find(
      (coupon) => coupon.code.toUpperCase() === clean
    );

    if (!found) {
      return {
        success: false,
        message: 'Invalid coupon code.',
      };
    }

    if (!found.active) {
      return {
        success: false,
        message: 'This coupon campaign has expired.',
      };
    }

    if (cartSubtotal < found.minOrder) {
      return {
        success: false,
        message: `Minimum order subtotal of ৳${found.minOrder} required for coupon ${found.code}.`,
      };
    }

    setAppliedCoupon(found);

    showToast(
      `Coupon "${found.code}" applied successfully!`
    );

    return {
      success: true,
      message: `Coupon applied: ${found.description}`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Wishlist handling
  const toggleWishlist = (productId: string) => {
    const product = products.find(
      (item) => item.id === productId
    );

    setWishlist((previous) => {
      const exists = previous.includes(productId);

      if (exists) {
        showToast('Removed from wishlist', 'info');

        return previous.filter((id) => id !== productId);
      }

      showToast(
        `Saved "${product?.title || 'item'}" to your wishlist`
      );

      return [...previous, productId];
    });
  };

  const isInWishlist = (productId: string) =>
    wishlist.includes(productId);

  // Order placement
  const placeOrder = (
    orderInput: Omit<
      Order,
      'id' | 'orderNumber' | 'createdAt' | 'trackingHistory'
    >
  ): Order => {
    const newId = `ord-${Date.now().toString().slice(-6)}`;

    const randomSuffix = Math.floor(
      1000 + Math.random() * 9000
    );

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
    setProducts((previous) =>
      previous.map((product) => {
        const orderedItem = orderInput.items.find(
          (item) => item.productId === product.id
        );

        if (!orderedItem) return product;

        return {
          ...product,
          stock: Math.max(
            0,
            product.stock - orderedItem.quantity
          ),
          salesCount:
            product.salesCount + orderedItem.quantity,
        };
      })
    );

    setOrders((previous) => [newOrder, ...previous]);
    setLatestPlacedOrder(newOrder);

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch((error) =>
      console.log('Error syncing order to server:', error)
    );

    if (orderInput.couponCode) {
      setCoupons((previous) =>
        previous.map((coupon) =>
          coupon.code.toUpperCase() ===
          orderInput.couponCode?.toUpperCase()
            ? {
                ...coupon,
                timesUsed: coupon.timesUsed + 1,
              }
            : coupon
        )
      );
    }

    clearCart();
    setActiveCustomerPage('order-success');

    showToast(
      `Order ${orderNumber} placed successfully!`
    );

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    note?: string
  ) => {
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

    setOrders((previous) =>
      previous.map((order) => {
        if (order.id !== orderId) return order;

        return {
          ...order,
          orderStatus: status,
          paymentStatus:
            status === 'Delivered' || status === 'Shipped'
              ? 'verified'
              : order.paymentStatus,
          trackingHistory: [
            ...order.trackingHistory,
            newStep,
          ],
        };
      })
    );

    fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        trackingStep: newStep,
      }),
    }).catch((error) =>
      console.log('Error syncing order status:', error)
    );

    showToast(`Order status updated to "${status}"`);
  };

  const cancelOrder = (
    orderId: string,
    reason: string
  ) => {
    setOrders((previous) =>
      previous.map((order) => {
        if (order.id !== orderId) return order;

        const nowFormatted = new Date().toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        );

        return {
          ...order,
          orderStatus: 'Cancelled',
          cancellationReason: reason,
          trackingHistory: [
            ...order.trackingHistory,
            {
              status: 'Cancelled',
              timestamp: nowFormatted,
              note: `Cancellation Reason: ${reason}`,
            },
          ],
        };
      })
    );

    showToast(
      'Order cancellation request processed',
      'info'
    );
  };

  const requestReturn = (
    orderId: string,
    reason: string
  ) => {
    setOrders((previous) =>
      previous.map((order) => {
        if (order.id !== orderId) return order;

        const nowFormatted = new Date().toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        );

        return {
          ...order,
          orderStatus: 'Return Requested',
          returnReason: reason,
          trackingHistory: [
            ...order.trackingHistory,
            {
              status: 'Return Requested',
              timestamp: nowFormatted,
              note: `Return Reason: ${reason}`,
            },
          ],
        };
      })
    );

    showToast(
      'Return request submitted for administrator review',
      'info'
    );
  };

  // Product CRUD (Admin)
  const addProduct = (
    productInput: Omit<
      Product,
      | 'id'
      | 'slug'
      | 'createdAt'
      | 'rating'
      | 'reviewCount'
      | 'salesCount'
    >
  ) => {
    const id = `prod-${Date.now().toString().slice(-5)}`;

    const slug = productInput.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    const newProduct: Product = {
      ...productInput,
      id,
      slug,
      rating: 5.0,
      reviewCount: 0,
      salesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProducts((previous) => [
      newProduct,
      ...previous.filter((product) => product.id !== id),
    ]);

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch((error) =>
      console.log('Error adding product to server:', error)
    );

    showToast(
      `Added product "${newProduct.title}" to catalog`
    );
  };

  const updateProduct = (updated: Product) => {
    setProducts((previous) =>
      previous.map((product) =>
        product.id === updated.id ? updated : product
      )
    );

    fetch(`/api/products/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((error) =>
      console.log('Error updating product on server:', error)
    );

    showToast(`Updated product "${updated.title}"`);
  };

  const deleteProduct = (productId: string) => {
    const product = products.find(
      (item) => item.id === productId
    );

    setProducts((previous) =>
      previous.filter((item) => item.id !== productId)
    );

    fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    }).catch((error) =>
      console.log('Error deleting product on server:', error)
    );

    showToast(
      `Product "${product?.title || ''}" removed from catalog`,
      'info'
    );
  };

  const updateProductStock = (
    productId: string,
    newStock: number
  ) => {
    setProducts((previous) =>
      previous.map((product) =>
        product.id === productId
          ? {
              ...product,
              stock: Math.max(0, newStock),
            }
          : product
      )
    );

    showToast(`Stock updated to ${newStock} units`);
  };

  const applyDiscountToProduct = (
    productId: string,
    discountPercent: number
  ) => {
    setProducts((previous) =>
      previous.map((product) => {
        if (product.id !== productId) return product;

        const newSale = Math.round(
          product.regularPrice *
            (1 - discountPercent / 100)
        );

        return {
          ...product,
          salePrice: newSale,
        };
      })
    );

    showToast(
      `Applied ${discountPercent}% discount to product`
    );
  };

  // Coupons (Admin)
  const addCoupon = (coupon: Coupon) => {
    setCoupons((previous) => [coupon, ...previous]);

    showToast(
      `Created promotion coupon "${coupon.code}"`
    );
  };

  const toggleCouponStatus = (code: string) => {
    setCoupons((previous) =>
      previous.map((coupon) =>
        coupon.code === code
          ? { ...coupon, active: !coupon.active }
          : coupon
      )
    );

    showToast(`Updated status for coupon "${code}"`);
  };

  const deleteCoupon = (code: string) => {
    setCoupons((previous) =>
      previous.filter((coupon) => coupon.code !== code)
    );

    showToast(`Deleted coupon "${code}"`, 'info');
  };

  // Marketing Campaigns
  const saveCampaign = (
    campaignInput: Omit<
      MarketingCampaign,
      'id' | 'createdAt'
    >
  ) => {
    const newCampaign: MarketingCampaign = {
      ...campaignInput,
      id: `camp-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setCampaigns((previous) => [
      newCampaign,
      ...previous,
    ]);

    showToast(
      `Marketing campaign "${newCampaign.title}" saved!`
    );
  };

  const updateCampaignStatus = (
    id: string,
    status: 'draft' | 'approved' | 'published'
  ) => {
    setCampaigns((previous) =>
      previous.map((campaign) =>
        campaign.id === id
          ? { ...campaign, status }
          : campaign
      )
    );

    showToast(`Campaign status updated to "${status}"`);
  };

  // Reviews
  const addReview = (
    reviewInput: Omit<Review, 'id' | 'date'>
  ) => {
    const newReview: Review = {
      ...reviewInput,
      id: `rev-${Date.now().toString().slice(-5)}`,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews((previous) => [
      newReview,
      ...previous,
    ]);

    // Update product rating
    setProducts((previous) =>
      previous.map((product) => {
        if (product.id !== reviewInput.productId) {
          return product;
        }

        const nextCount = product.reviewCount + 1;

        const nextRating = Number(
          (
            (product.rating * product.reviewCount +
              reviewInput.rating) /
            nextCount
          ).toFixed(1)
        );

        return {
          ...product,
          rating: nextRating,
          reviewCount: nextCount,
        };
      })
    );

    showToast(
      'Thank you! Your verified review has been submitted.'
    );
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

        setupGuideModalProduct,
        setSetupGuideModalProduct,

        openSetupGuide,

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
    throw new Error(
      'useStore must be used within a StoreProvider'
    );
  }

  return context;
};