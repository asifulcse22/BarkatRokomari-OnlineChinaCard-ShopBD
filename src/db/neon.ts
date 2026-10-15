import { neon } from '@neondatabase/serverless';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/mockData';
import { Product, Order, Category } from '../types';

const databaseUrl = process.env.DATABASE_URL;

export const isNeonConfigured = Boolean(databaseUrl && databaseUrl.trim().length > 0);

// Neon SQL client instance (only if URL is present)
export const sql = isNeonConfigured ? neon(databaseUrl!) : null;

/**
 * Initializes Neon PostgreSQL tables if they don't already exist.
 * Auto-seeds with initial catalog if empty.
 */
export async function initializeNeonDatabase() {
  if (!sql) {
    console.log('[Neon DB] DATABASE_URL not set in environment. Running in mock/local mode.');
    return { status: 'unconfigured' };
  }

  try {
    console.log('[Neon DB] Checking database connection and initializing tables...');

    // 1. Create Categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        icon_name VARCHAR(100),
        banner_image TEXT,
        item_count INT DEFAULT 0
      );
    `;

    // 2. Create Products table
    await sql`
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
    `;

    // 3. Create Orders table
    await sql`
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
    `;

    // 4. Create Coupons table
    await sql`
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
    `;

    // 5. Create Reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(100) PRIMARY KEY,
        product_id VARCHAR(100),
        customer_name VARCHAR(255),
        rating INT,
        date TIMESTAMPTZ DEFAULT NOW(),
        comment TEXT,
        verified_purchase BOOLEAN DEFAULT true
      );
    `;

    // Check if products table is empty; if so, seed demo data
    const existing = await sql`SELECT COUNT(*)::int as count FROM products;`;
    const count = existing[0]?.count || 0;

    if (count === 0 && INITIAL_PRODUCTS.length > 0) {
      console.log(`[Neon DB] Seeding ${INITIAL_PRODUCTS.length} initial products...`);
      for (const prod of INITIAL_PRODUCTS) {
        await sql`
          INSERT INTO products (
            id, title, slug, sku, category, brand, description, specifications,
            regular_price, sale_price, stock, rating, review_count, images,
            variations, featured, is_new, is_bestseller, tags, sales_count, created_at
          ) VALUES (
            ${prod.id}, ${prod.title}, ${prod.slug}, ${prod.sku}, ${prod.category},
            ${prod.brand}, ${prod.description}, ${JSON.stringify(prod.specifications || [])},
            ${prod.regularPrice}, ${prod.salePrice ?? null}, ${prod.stock},
            ${prod.rating}, ${prod.reviewCount}, ${JSON.stringify(prod.images || [])},
            ${JSON.stringify(prod.variations || {})}, ${prod.featured ?? false},
            ${prod.isNew ?? false}, ${prod.isBestSeller ?? false},
            ${JSON.stringify(prod.tags || [])}, ${prod.salesCount ?? 0}, ${prod.createdAt || new Date().toISOString()}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
      console.log('[Neon DB] Initial products seeded successfully.');
    }

    console.log('[Neon DB] Tables ready and healthy.');
    return { status: 'connected', seeded: count === 0 };
  } catch (error) {
    console.error('[Neon DB] Initialization error:', error);
    return { status: 'error', error: String(error) };
  }
}

// Map PostgreSQL row to Product interface
export function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug || '',
    sku: row.sku || '',
    category: row.category || '',
    brand: row.brand || '',
    description: row.description || '',
    specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : (row.specifications || []),
    regularPrice: Number(row.regular_price),
    salePrice: row.sale_price !== null ? Number(row.sale_price) : undefined,
    stock: Number(row.stock),
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
    variations: typeof row.variations === 'string' ? JSON.parse(row.variations) : (row.variations || {}),
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new),
    isBestSeller: Boolean(row.is_bestseller),
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
    salesCount: Number(row.sales_count),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

// Map PostgreSQL row to Order interface
export function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    customer: typeof row.customer === 'string' ? JSON.parse(row.customer) : row.customer,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    shippingFee: Number(row.shipping_fee),
    total: Number(row.total),
    couponCode: row.coupon_code || undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    trackingHistory: typeof row.tracking_history === 'string' ? JSON.parse(row.tracking_history) : (row.tracking_history || []),
    cancellationReason: row.cancellation_reason || undefined,
    returnReason: row.return_reason || undefined,
  };
}
