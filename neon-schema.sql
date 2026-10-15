-- ====================================================================
-- ShopZone - Neon Serverless PostgreSQL Database Schema & Seed Script
-- ====================================================================
-- এই স্ক্রিপ্টটি আপনি Neon কনসোলে (console.neon.tech) SQL Editor এ গিয়ে
-- সরাসরি রান (Run) করতে পারেন।

-- 1. Categories টেবিল তৈরি
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(100),
  banner_image TEXT,
  item_count INT DEFAULT 0
);

-- 2. Products টেবিল তৈরি
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  sku VARCHAR(100),
  category VARCHAR(100),
  brand VARCHAR(100),
  description TEXT,
  specifications JSONB DEFAULT '[]'::jsonb,
  regular_price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  stock INT DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  variations JSONB DEFAULT '{}'::jsonb,
  featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  sales_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders টেবিল তৈরি
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(100) PRIMARY KEY,
  order_number VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  shipping_fee NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_code VARCHAR(100),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50),
  order_status VARCHAR(50),
  tracking_history JSONB DEFAULT '[]'::jsonb,
  cancellation_reason TEXT,
  return_reason TEXT
);

-- 4. Coupons টেবিল তৈরি
CREATE TABLE IF NOT EXISTS coupons (
  code VARCHAR(100) PRIMARY KEY,
  discount_type VARCHAR(50),
  discount_value NUMERIC(10,2),
  min_order NUMERIC(10,2),
  description TEXT,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  times_used INT DEFAULT 0
);

-- 5. Reviews টেবিল তৈরি
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(100) PRIMARY KEY,
  product_id VARCHAR(100),
  customer_name VARCHAR(255),
  rating INT,
  date TIMESTAMPTZ DEFAULT NOW(),
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT true
);

-- ====================================================================
-- Sample Seed Data (নমুনা ডেমো ডাটা ইনসার্ট)
-- ====================================================================

INSERT INTO products (
  id, title, slug, sku, category, brand, description, specifications,
  regular_price, sale_price, stock, rating, review_count, images,
  variations, featured, is_new, is_bestseller, tags, sales_count
) VALUES 
(
  'prod-iphone15',
  'iPhone 15 Pro Max (Titanium Natural)',
  'iphone-15-pro-max',
  'APL-IP15PM-256',
  'Electronics',
  'Apple',
  'The first iPhone sculpted in aerospace-grade titanium, featuring the revolutionary A17 Pro chip and customizable Action button.',
  '[{"key": "Display", "value": "6.7 Super Retina XDR OLED"}, {"key": "Processor", "value": "A17 Pro Bionic"}, {"key": "Camera", "value": "48MP Main + 5x Telephoto"}]'::jsonb,
  1499.00,
  1349.00,
  18,
  4.95,
  84,
  '["https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
  '{"storage": ["256GB", "512GB", "1TB"], "colors": [{"name": "Natural Titanium", "hex": "#9c968f"}, {"name": "Black Titanium", "hex": "#2e2e2e"}]}'::jsonb,
  true,
  true,
  true,
  '["apple", "iphone", "flagship", "5g", "titanium"]'::jsonb,
  156
),
(
  'prod-1',
  'Aura Pro Active Noise Cancelling Headphones',
  'aura-pro-anc-headphones',
  'EL-AUD-001',
  'Electronics',
  'AuraSound',
  'Flagship wireless headphones featuring custom 45mm neodymium drivers, 40 hours of playtime, and lossless audio support.',
  '[{"key": "Driver", "value": "45mm Neodymium"}, {"key": "Battery", "value": "40 Hours"}, {"key": "Weight", "value": "250g"}]'::jsonb,
  249.00,
  199.00,
  28,
  4.9,
  128,
  '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"]'::jsonb,
  '{"colors": [{"name": "Matte Obsidian", "hex": "#1a1a1a"}, {"name": "Silver Moonlight", "hex": "#d1d5db"}]}'::jsonb,
  true,
  false,
  true,
  '["audio", "anc", "wireless", "premium"]'::jsonb,
  142
)
ON CONFLICT (id) DO NOTHING;
