export interface ProductVariation {
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  storage?: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  category: string;
  brand: string;
  description: string;
  specifications: { key: string; value: string }[];
  regularPrice: number;
  salePrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  variations?: ProductVariation;
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  tags: string[];
  salesCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  bannerImage: string;
  itemCount: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedStorage?: string;
  unitPrice: number;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  variations?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Returned';

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'bank' | 'card';
export type PaymentStatus = 'pending' | 'verified' | 'failed';

export interface TrackingStep {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface CustomerAddress {
  id: string;
  label: string; // Home, Office
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingHistory: TrackingStep[];
  cancellationReason?: string;
  returnReason?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  description: string;
  expiresAt: string;
  active: boolean;
  timesUsed: number;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  channel: 'facebook' | 'seo' | 'ad_copy' | 'campaign_idea' | 'sms';
  language: 'en' | 'bn';
  content: string;
  headline?: string;
  metaTitle?: string;
  metaDescription?: string;
  targetProductTitle?: string;
  createdAt: string;
  status: 'draft' | 'approved' | 'published';
}

export interface SupportTicket {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}
