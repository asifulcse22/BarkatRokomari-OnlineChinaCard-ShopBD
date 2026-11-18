// ============================================================
// ShopZone Cloudflare Worker — সব route server.ts থেকে হুবহু
// Express → Hono (Cloudflare Workers compatible)
// ============================================================
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { neon } from '@neondatabase/serverless';
import { GoogleGenAI } from '@google/genai';
import { SignJWT, jwtVerify } from 'jose';

// ─── Types (server.ts থেকে হুবহু) ───────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
}

// ─── Env bindings ────────────────────────────────────────────
export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  GEMINI_API_KEY: string;
  FRONTEND_URL?: string;
}

// ─── Mock / Initial Products (server.ts-এর INITIAL_PRODUCTS) ─
// Worker runtime-এ আলাদা import করা যায় না, তাই inline রাখছি
// (তোমার src/data/mockData.ts-এর ডেটা হুবহু ব্যবহার হবে Neon থেকে)
const INITIAL_PRODUCTS: any[] = []; // Neon DB থেকেই আসবে

// ─── Helper: Neon SQL client ──────────────────────────────────
function getSql(env: Env) {
  if (!env.DATABASE_URL) return null;
  return neon(env.DATABASE_URL);
}

// ─── Helper: Gemini AI (server.ts callGemini হুবহু) ──────────
async function callGemini(
  env: Env,
  prompt: string,
  systemInstruction?: string
): Promise<string | null> {
  if (!env.GEMINI_API_KEY) return null;
  try {
    const ai = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction
        ? { systemInstruction, temperature: 0.7 }
        : { temperature: 0.7 },
    });
    return response.text || null;
  } catch (err) {
    console.warn('Gemini call warning (will use analytical fallback):', err);
    return null;
  }
}

// ─── Helper: JWT (jose — Workers compatible, server.ts logic হুবহু) ──
const COOKIE_NAME = 'sz_token';
const COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60;

function getSecretKey(env: Env): Uint8Array {
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET .env ফাইলে সেট করা নেই (কমপক্ষে ৩২ অক্ষর দরকার)।');
  }
  return new TextEncoder().encode(env.JWT_SECRET);
}

async function signToken(env: Env, userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecretKey(env));
}

async function verifyToken(env: Env, token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(env));
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}

// ─── Helper: bcrypt → Web Crypto (server.ts logic হুবহু) ─────
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashArr = new Uint8Array(bits);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hashArr).map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    if (stored.startsWith('$2')) {
      // Legacy bcrypt hashes (যদি DB-তে থাকে) — Workers-এ verify করা যাবে না
      // পুরনো ইউজারদের জন্য: পাসওয়ার্ড রিসেট করতে হবে
      return false;
    }
    const [, saltHex, hashHex] = stored.split(':');
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const computed = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
    return computed === hashHex;
  } catch {
    return false;
  }
}

// ─── Helper: Phone / Email normalize (auth.ts হুবহু) ─────────
function normalizeEmail(v: unknown): string {
  return String(v || '').trim().toLowerCase();
}

function normalizePhone(v: unknown): string {
  let d = String(v || '').replace(/[^\d]/g, '');
  if (d.startsWith('880')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('1')) d = '0' + d;
  return d;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BD_PHONE_RE = /^01[3-9]\d{8}$/;

// ─── Helper: mapRowToProduct / mapRowToOrder (neon.ts হুবহু) ──
function mapRowToProduct(row: any) {
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

function mapRowToOrder(row: any) {
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

// ─── Helper: getAuthUser (auth.ts হুবহু) ─────────────────────
async function getAuthUser(c: any, env: Env): Promise<AuthUser | null> {
  const sql = getSql(env);
  if (!sql) return null;
  try {
    const token = getCookie(c, COOKIE_NAME);
    if (!token) return null;
    const userId = await verifyToken(env, token);
    if (!userId) return null;
    const rows = await sql`SELECT id, name, email, phone, role FROM users WHERE id = ${userId} LIMIT 1;`;
    if (!rows[0]) return null;
    return rows[0] as AuthUser;
  } catch {
    return null;
  }
}

// ─── Rate limiter (auth.ts তোমার মতো ১৫ মিনিটে ১০বার) ───────
const attempts = new Map<string, { count: number; resetAt: number }>();
function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || rec.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  rec.count += 1;
  return rec.count > 10;
}

// ─── Hono App ─────────────────────────────────────────────────
const app = new Hono<{ Bindings: Env }>();

// CORS — frontend URL allow করা
app.use('*', async (c, next) => {
  const frontendUrl = c.env.FRONTEND_URL || '*';
  const handler = cors({
    origin: frontendUrl,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  });
  return handler(c, next);
});

// ════════════════════════════════════════════════════════════
// AUTH ROUTES (/api/auth) — auth.ts হুবহু
// ════════════════════════════════════════════════════════════

const NEON_OFF = { success: false, message: 'ডাটাবেস সংযুক্ত নেই। লগইন/রেজিস্ট্রেশনের জন্য Neon ডাটাবেস চালু থাকতে হবে।' };

// ensureUsersTable (auth.ts হুবহু)
async function ensureUsersTable(env: Env) {
  const sql = getSql(env);
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      phone         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'customer',
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

// POST /api/auth/register
app.post('/api/auth/register', async (c) => {
  const sql = getSql(c.env);
  if (!sql) return c.json(NEON_OFF, 503);

  try {
    const body = await c.req.json();
    const name = String(body?.name || '').trim();
    const email = normalizeEmail(body?.email);
    const phone = normalizePhone(body?.phone);
    const password = String(body?.password || '');

    if (name.length < 2) return c.json({ success: false, message: 'আপনার পুরো নাম লিখুন।' }, 400);
    if (!EMAIL_RE.test(email)) return c.json({ success: false, message: 'সঠিক ইমেইল ঠিকানা দিন।' }, 400);
    if (!BD_PHONE_RE.test(phone)) return c.json({ success: false, message: 'সঠিক মোবাইল নম্বর দিন (যেমন 01712345678)।' }, 400);
    if (password.length < 8) return c.json({ success: false, message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' }, 400);

    const existing = await sql`SELECT email, phone FROM users WHERE email = ${email} OR phone = ${phone} LIMIT 1;`;
    if (existing[0]) {
      const field = (existing[0] as any).email === email ? 'ইমেইল' : 'মোবাইল নম্বর';
      return c.json({ success: false, message: `এই ${field} দিয়ে আগেই একাউন্ট খোলা আছে। লগইন করুন।` }, 409);
    }

    const id = `usr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await hashPassword(password);

    await sql`INSERT INTO users (id, name, email, phone, password_hash, role) VALUES (${id}, ${name}, ${email}, ${phone}, ${passwordHash}, 'customer');`;

    const token = await signToken(c.env, id);
    setCookie(c, COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: true,
      maxAge: COOKIE_MAX_AGE_SEC,
      path: '/',
    });

    return c.json({ success: true, user: { id, name, email, phone, role: 'customer' } });
  } catch (err: any) {
    console.error('[Auth] register error:', err);
    return c.json({ success: false, message: err.message || 'রেজিস্ট্রেশন করা যায়নি।' }, 500);
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (c) => {
  const sql = getSql(c.env);
  if (!sql) return c.json(NEON_OFF, 503);

  try {
    const body = await c.req.json();
    const identifier = String(body?.identifier || '').trim();
    const password = String(body?.password || '');

    if (!identifier || !password) return c.json({ success: false, message: 'ইমেইল/মোবাইল নম্বর ও পাসওয়ার্ড দিন।' }, 400);

    const clientIp = c.req.header('CF-Connecting-IP') || 'unknown';
    if (tooManyAttempts(`${clientIp}|${identifier.toLowerCase()}`)) {
      return c.json({ success: false, message: 'অনেকবার ভুল চেষ্টা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।' }, 429);
    }

    const isEmail = identifier.includes('@');
    const rows = isEmail
      ? await sql`SELECT * FROM users WHERE email = ${normalizeEmail(identifier)} LIMIT 1;`
      : await sql`SELECT * FROM users WHERE phone = ${normalizePhone(identifier)} LIMIT 1;`;

    const row = rows[0] as any;
    const ok = row ? await verifyPassword(password, row.password_hash) : false;
    if (!row || !ok) return c.json({ success: false, message: 'ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড ভুল।' }, 401);

    attempts.delete(`${clientIp}|${identifier.toLowerCase()}`);
    const token = await signToken(c.env, row.id);
    setCookie(c, COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: true,
      maxAge: COOKIE_MAX_AGE_SEC,
      path: '/',
    });

    return c.json({ success: true, user: { id: row.id, name: row.name, email: row.email, phone: row.phone, role: row.role } });
  } catch (err: any) {
    console.error('[Auth] login error:', err);
    return c.json({ success: false, message: err.message || 'লগইন করা যায়নি।' }, 500);
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
  return c.json({ success: true });
});

// GET /api/auth/me
app.get('/api/auth/me', async (c) => {
  const user = await getAuthUser(c, c.env);
  return c.json({ success: true, user });
});

// ════════════════════════════════════════════════════════════
// AI ROUTES (/api/ai) — server.ts হুবহু
// ════════════════════════════════════════════════════════════

// Admin middleware
async function requireAdmin(c: any, next: any) {
  const user = await getAuthUser(c, c.env);
  if (!user) return c.json({ success: false, error: 'আগে লগইন করুন।' }, 401);
  if (user.role !== 'admin') return c.json({ success: false, error: 'এই কাজ শুধু অ্যাডমিন করতে পারবে।' }, 403);
  c.set('user', user);
  await next();
}

// 1. AI Business Overview (server.ts হুবহু)
app.post('/api/ai/business-overview', requireAdmin, async (c) => {
  const { metrics, recentOrders, topProducts, lowStockItems } = await c.req.json();

  const prompt = `
Analyze the following e-commerce store snapshot for "ShopZone":
Store Metrics:
- Total Revenue: $${metrics?.totalRevenue ?? 0}
- Total Orders: ${metrics?.totalOrders ?? 0}
- Average Order Value: $${metrics?.avgOrderValue ?? 0}
- Low Stock Items: ${metrics?.lowStockCount ?? 0}
- Active Products: ${metrics?.productCount ?? 0}
- Return Rate: ${metrics?.returnRate ?? '1.2%'}

Top Products:
${JSON.stringify(topProducts?.slice(0, 5) || [])}

Low Stock Products:
${JSON.stringify(lowStockItems?.slice(0, 5) || [])}

Provide an executive business analysis in JSON format with:
{
  "executiveSummary": "string (comprehensive, professional 2-3 sentence overview of store momentum)",
  "healthScore": number (70-98 based on orders and stock health),
  "keyObservations": ["string", "string", "string"],
  "revenueCommentary": "string (analysis of revenue drivers)",
  "prioritizedActions": [
    {
      "title": "string",
      "impact": "High" | "Medium",
      "category": "Inventory" | "Marketing" | "Pricing" | "Operations",
      "description": "string",
      "recommendedAction": "string"
    }
  ]
}
Return only valid JSON.
`;

  const aiResult = await callGemini(c.env, prompt, 'You are an expert e-commerce business analyst and retail strategist.');
  if (aiResult) {
    try {
      const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      return c.json({ success: true, data: JSON.parse(cleanJson), source: 'gemini' });
    } catch { /* fall through */ }
  }

  const fallback = {
    executiveSummary: `ShopZone is exhibiting solid operational momentum with $${metrics?.totalRevenue || '845.30'} in revenue across ${metrics?.totalOrders || 4} verified orders. However, ${metrics?.lowStockCount || 2} high-velocity catalog items are nearing stock depletion and require prompt reorder cycles.`,
    healthScore: metrics?.lowStockCount > 3 ? 78 : 88,
    keyObservations: [
      `Electronics & Gadgets and Skincare account for over 65% of gross revenue volume.`,
      `Average Order Value is healthy at $${metrics?.avgOrderValue || '211.32'}, aided by premium multi-item carts.`,
      `${metrics?.lowStockCount || 2} SKU(s) risk zero-stock within the next 7 business days if demand holds.`,
    ],
    revenueCommentary: 'Growth is driven by high-ticket audio and wellness electronics with solid attachment rates for recurring consumables (Ethiopian Coffee & Serums).',
    prioritizedActions: [
      { title: 'Restock High-Velocity Japanese Denim & Horizone X Watches', impact: 'High', category: 'Inventory', description: 'Inventory levels for flagship items have dropped below safety buffer.', recommendedAction: 'Issue reorder purchase order for 25 units each to avoid lost sales.' },
      { title: 'Launch Weekend Bundle on Audio & Tech Accessories', impact: 'Medium', category: 'Marketing', description: 'Aura Pro ANC Headphones show the highest page traffic and conversion velocity.', recommendedAction: 'Apply coupon promotion or pair with mechanical keyboards for 12% combined margin lift.' },
      { title: 'Promote bKash & Card Digital Payments', impact: 'Medium', category: 'Operations', description: 'Digital prepayments reduce COD delivery cancellation risks.', recommendedAction: 'Highlight 5% instant cashback banner on bKash and Nagad checkouts.' },
    ],
  };
  return c.json({ success: true, data: fallback, source: 'fallback' });
});

// 2. AI Product Advisor (server.ts হুবহু)
app.post('/api/ai/product-advisor', requireAdmin, async (c) => {
  const { products } = await c.req.json();

  const prompt = `
Analyze these products from ShopZone:
${JSON.stringify((products || []).map((p: any) => ({ title: p.title, category: p.category, price: p.salePrice || p.regularPrice, stock: p.stock, salesCount: p.salesCount, rating: p.rating })))}

Identify high performers, underperforming/stagnant products, promotion opportunities, and catalog optimization tips.
Return valid JSON:
{
  "topPerformers": [{ "title": "string", "reason": "string", "strategy": "string" }],
  "underperforming": [{ "title": "string", "issue": "string", "turnaroundIdea": "string" }],
  "promotionSuggestions": [{ "productTitle": "string", "discountPercentage": number, "rationale": "string", "expectedLift": "string" }],
  "listingOptimizationAdvice": ["string", "string", "string"]
}
`;

  const aiResult = await callGemini(c.env, prompt, 'You are an e-commerce merchandising and pricing advisor.');
  if (aiResult) {
    try {
      return c.json({ success: true, data: JSON.parse(aiResult.replace(/```json/g, '').replace(/```/g, '').trim()), source: 'gemini' });
    } catch { /* fall through */ }
  }

  return c.json({
    success: true,
    data: {
      topPerformers: [
        { title: 'Aura Pro Active Noise Cancelling Headphones', reason: '142 unit sales with a 4.9 star rating; strongest revenue generator.', strategy: 'Retain premium positioning and feature as the hero product in upcoming holiday campaigns.' },
        { title: 'Single-Origin Ethiopian Yirgacheffe Coffee', reason: '310 units sold with 100% 5-star ratings; high repeat purchase rate.', strategy: 'Introduce subscription or multi-bag bundles to lock in recurring monthly order value.' },
      ],
      underperforming: [
        { title: 'The Craftsman Brass Fountain Pen with 18k Nib', issue: 'Sales velocity is relatively low (47 units) despite high build quality.', turnaroundIdea: 'Reposition as an executive gift set including free notebook or ink converter.' },
        { title: 'Apex Mechanical Studio Keyboard', issue: 'Stock turnaround rate slower than expected.', turnaroundIdea: 'Run a flash deal for mechanical keyboard enthusiasts with video typing-test demos.' },
      ],
      promotionSuggestions: [
        { productTitle: 'Apex Mechanical Studio Keyboard', discountPercentage: 15, rationale: 'Sufficient stock buffer (24 units) allows healthy discount without stockout risk.', expectedLift: '+35% sales velocity over 14 days' },
        { productTitle: 'AeroPulse Deep Tissue Percussive Massage Gun', discountPercentage: 10, rationale: 'Complementary to home fitness and wellness shoppers.', expectedLift: '+20% basket size when bundled' },
      ],
      listingOptimizationAdvice: [
        'Add video demonstration clips showing sound-isolation tests for ANC headphones.',
        'Include fabric closeup macro shots for linen overshirts and raw selvedge denim.',
        'Highlight hypoallergenic and organic certifications prominently on beauty skincare listings.',
      ],
    },
    source: 'fallback',
  });
});

// 3. AI Stock Assistant (server.ts হুবহু)
app.post('/api/ai/stock-assistant', requireAdmin, async (c) => {
  const { products } = await c.req.json();

  const prompt = `
Analyze inventory levels for ShopZone products:
${JSON.stringify((products || []).map((p: any) => ({ id: p.id, title: p.title, stock: p.stock, salesCount: p.salesCount, category: p.category })))}

Generate an intelligent inventory forecast and replenishment plan in JSON:
{
  "criticalStockoutRisk": [{ "title": "string", "currentStock": number, "estimatedDaysLeft": number, "urgency": "Immediate" | "Warning" }],
  "replenishmentPlan": [{ "productId": "string", "title": "string", "currentStock": number, "recommendedReorderQty": number, "urgency": "Critical" | "Moderate" | "Normal", "estimatedCost": number, "rationale": "string" }],
  "deadStockItems": [{ "title": "string", "currentStock": number, "action": "string" }],
  "summaryNote": "string"
}
`;

  const aiResult = await callGemini(c.env, prompt, 'You are an inventory supply chain and demand forecasting expert.');
  if (aiResult) {
    try {
      return c.json({ success: true, data: JSON.parse(aiResult.replace(/```json/g, '').replace(/```/g, '').trim()), source: 'gemini' });
    } catch { /* fall through */ }
  }

  return c.json({
    success: true,
    data: {
      criticalStockoutRisk: [
        { title: 'Selvedge Heavyweight Japanese Denim Jacket', currentStock: 4, estimatedDaysLeft: 5, urgency: 'Immediate' },
        { title: 'Horizon X OLED Smartwatch', currentStock: 7, estimatedDaysLeft: 8, urgency: 'Warning' },
        { title: 'Terra Trek Ultralight 2-Person Tent', currentStock: 9, estimatedDaysLeft: 12, urgency: 'Warning' },
      ],
      replenishmentPlan: [
        { productId: 'prod-5', title: 'Selvedge Heavyweight Japanese Denim Jacket', currentStock: 4, recommendedReorderQty: 25, urgency: 'Critical', estimatedCost: 2750, rationale: 'Only 4 units left with proven customer demand and long supplier manufacturing lead times.' },
        { productId: 'prod-2', title: 'Horizon X OLED Smartwatch', currentStock: 7, recommendedReorderQty: 30, urgency: 'Critical', estimatedCost: 4500, rationale: 'High profit margin ($249 sale price) makes stockouts expensive in lost gross profit.' },
        { productId: 'prod-8', title: 'Terra Trek Ultralight 2-Person Tent', currentStock: 9, recommendedReorderQty: 15, urgency: 'Moderate', estimatedCost: 2400, rationale: 'Outdoor travel season approaching; restock before peak trail season.' },
      ],
      deadStockItems: [{ title: 'The Craftsman Brass Fountain Pen', currentStock: 12, action: 'Bundle with corporate stationery packages or bundle with notebooks.' }],
      summaryNote: 'Prioritize reordering Japanese Denim and Horizon X Smartwatches immediately to prevent inventory stockouts within 7 to 10 days.',
    },
    source: 'fallback',
  });
});

// 4. AI Marketing Studio (server.ts হুবহু)
app.post('/api/ai/marketing-studio', requireAdmin, async (c) => {
  const { product, channel, language, campaignTheme, discountOffer } = await c.req.json();

  const prompt = `
Create high-converting e-commerce marketing content for the following product:
Product: ${product?.title || 'ShopZone Best Seller'}
Brand: ${product?.brand || 'ShopZone'}
Category: ${product?.category || 'General'}
Price: $${product?.salePrice || product?.regularPrice || '99'}
Discount / Promo: ${discountOffer || 'Special Seasonal Offer'}
Campaign Theme: ${campaignTheme || 'New Season Showcase'}

Channel: ${channel} (can be 'facebook', 'seo', 'ad_copy', 'campaign_idea', 'sms')
Language: ${language === 'bn' ? 'Bengali (বাংলা) - natural, attractive, professional Bengali e-commerce copy' : 'English - engaging, persuasive, professional'}

Provide output in JSON:
{
  "headline": "string",
  "content": "string",
  "callToAction": "string",
  "hashtags": ["string", "string", "string"],
  "seoMetaTitle": "string (max 60 chars)",
  "seoMetaDescription": "string (max 160 chars)",
  "targetAudience": "string",
  "keyBenefitAngles": ["string", "string"]
}
`;

  const aiResult = await callGemini(c.env, prompt, 'You are an award-winning bilingual digital marketing copywriter specializing in South Asian and international e-commerce.');
  if (aiResult) {
    try {
      return c.json({ success: true, data: JSON.parse(aiResult.replace(/```json/g, '').replace(/```/g, '').trim()), source: 'gemini' });
    } catch { /* fall through */ }
  }

  if (language === 'bn') {
    return c.json({
      success: true,
      data: {
        headline: `অভিজাত জীবনের আধুনিক সঙ্গী — ${product?.title || 'প্রিমিয়াম গ্যাজেট'}`,
        content: `🎧 গান শুনুন বা কাজে মনোনিবেশ করুন কোনো বাধা ছাড়াই!\n\n✨ অসাধারণ সাউন্ড কোয়ালিটি এবং দীর্ঘস্থায়ী ব্যাটারি লাইফ নিয়ে ShopZone-এ চলে এসেছে ${product?.title || 'আমাদের নতুন কালেকশন'}।\n\n🔹 বিশেষ বৈশিষ্ট্য:\n• প্রিমিয়াম বিল্ড কোয়ালিটি\n• দ্রুত ডেলিভারি সমগ্র বাংলাদেশে\n• ক্যাশ অন ডেলিভারি এবং বিকাশ/নগদে পেমেন্টের সুব্যবস্থা\n\n🔥 স্টক সীমিত! এখনই আপনার অর্ডার কনফার্ম করুন।`,
        callToAction: 'এখনই অর্ডার করুন — ShopZone-এ কিনুন',
        hashtags: ['#ShopZone', '#OnlineShoppingBD', '#PremiumQuality', '#ExclusiveOffer'],
        seoMetaTitle: `${product?.title || 'প্রোডাক্ট'} কিনুন সেরা দামে | ShopZone বাংলাদেশ`,
        seoMetaDescription: `${product?.title || 'প্রিমিয়াম প্রোডাক্ট'} এখন আকর্ষণীয় অফারে ShopZone-এ।`,
        targetAudience: 'টেক সচেতন তরুণ ও তরুণী, প্রফেশনালস এবং গ্যাজেট প্রেমী',
        keyBenefitAngles: ['১০০% অরিজিনাল কোয়ালিটি', 'সহজ রিটার্ন পলিসি ও নিরাপদ পেমেন্ট'],
      },
      source: 'fallback',
    });
  }

  return c.json({
    success: true,
    data: {
      headline: `Elevate Your Everyday Standard with ${product?.title || 'ShopZone Essentials'}`,
      content: `Experience performance engineered without compromise.\n\nWhether working from your desk or commuting across the city, the ${product?.title || 'ShopZone collection'} delivers benchmark reliability.\n\nKey Highlights:\n• Precision engineered for daily durability\n• Express tracked courier shipping\n• Easy 7-day hassle-free returns & warranty\n\nTap below to claim limited-run promotional pricing.`,
      callToAction: 'Shop Now at ShopZone',
      hashtags: ['#ShopZone', '#CuratedLiving', '#DesignExcellence', '#ModernLifestyle'],
      seoMetaTitle: `Buy ${product?.title || 'Premium Products'} Online | ShopZone`,
      seoMetaDescription: `Discover the ${product?.title || 'featured collection'} at ShopZone. Fast doorstep delivery and multiple payment methods.`,
      targetAudience: 'Style-conscious urban professionals and discerning shoppers',
      keyBenefitAngles: ['Premium materials and long-term durability', 'Instant customer support & money-back guarantee'],
    },
    source: 'fallback',
  });
});

// 5. Ask AI (server.ts হুবহু)
app.post('/api/ai/ask-assistant', requireAdmin, async (c) => {
  const { question, storeContext } = await c.req.json();

  const prompt = `
You are the AI Business Assistant for "ShopZone", a modern multi-category e-commerce platform.
The store administrator asks: "${question}"

Current Store Data Snapshot:
- Total Sales Revenue: $${storeContext?.totalRevenue ?? '845.30'}
- Total Orders Count: ${storeContext?.totalOrders ?? 4}
- Low Stock Count: ${storeContext?.lowStockCount ?? 2}
- Active Products: ${storeContext?.productCount ?? 12}
- Top Categories: Electronics, Fashion, Home, Beauty, Groceries
- Payment Methods: bKash, Nagad, Card, Cash on Delivery, Bank
- Products Summary: ${JSON.stringify(storeContext?.productsSummary || [])}
- Recent Orders: ${JSON.stringify(storeContext?.recentOrdersSummary || [])}

Provide a direct, data-grounded, professional response.
- Answer the user's question clearly.
- Distinguish verified numbers from estimates.
- Give 2-3 concrete recommended next steps.
- If the question is in Bengali, respond in fluent Bengali. Otherwise respond in English.
`;

  const aiResult = await callGemini(c.env, prompt, 'You are ShopZone executive AI business co-pilot. Keep replies insightful, clear, and actionable.');
  if (aiResult) return c.json({ success: true, answer: aiResult, source: 'gemini' });

  const qLower = (question || '').toLowerCase();
  let answer = '';
  if (qLower.includes('stock') || qLower.includes('low') || qLower.includes('inventory') || qLower.includes('মজুদ')) {
    answer = `📦 **Inventory Analysis:**\nCurrently, there are **${storeContext?.lowStockCount || 2} products** in warning or critical stock:\n1. **Selvedge Heavyweight Japanese Denim Jacket** (Only 4 units left)\n2. **Horizon X OLED Smartwatch** (Only 7 units left)\n\n**Recommended Action:**\n- Place a replenishment purchase order for 25 units of the Japanese Denim jacket immediately.`;
  } else if (qLower.includes('sales') || qLower.includes('revenue') || qLower.includes('বিক্রয়') || qLower.includes('টাকা')) {
    answer = `💰 **Sales & Revenue Summary:**\n- **Total Gross Revenue:** $${storeContext?.totalRevenue || '845.30'}\n- **Total Processed Orders:** ${storeContext?.totalOrders || 4}`;
  } else {
    answer = `📊 **ShopZone Business Status:**\nYour store is operating with **$${storeContext?.totalRevenue || '845.30'}** across **${storeContext?.totalOrders || 4} current cycle orders**.`;
  }
  return c.json({ success: true, answer, source: 'fallback' });
});

// 6. AI Customer Insights (server.ts হুবহু)
app.post('/api/ai/customer-insights', requireAdmin, async (c) => {
  const { orders } = await c.req.json();

  const prompt = `
Analyze customer behavior and order data for ShopZone:
${JSON.stringify((orders || []).map((o: any) => ({ city: o.customer?.city, total: o.total, paymentMethod: o.paymentMethod, itemsCount: o.items?.length, orderStatus: o.orderStatus })))}

Generate customer segment analysis in JSON:
{
  "customerCohorts": [{ "segmentName": "string", "characteristics": "string", "percentage": number, "retentionStrategy": "string" }],
  "paymentPreferences": [{ "method": "string", "share": "string", "insight": "string" }],
  "geographicHotspots": ["string", "string"],
  "repeatPurchaseDrivers": ["string", "string"],
  "personalizedRecommendationsTip": "string"
}
`;

  const aiResult = await callGemini(c.env, prompt, 'You are an e-commerce customer lifecycle and retention expert.');
  if (aiResult) {
    try {
      return c.json({ success: true, data: JSON.parse(aiResult.replace(/```json/g, '').replace(/```/g, '').trim()), source: 'gemini' });
    } catch { /* fall through */ }
  }

  return c.json({
    success: true,
    data: {
      customerCohorts: [
        { segmentName: 'Premium Tech Enthusiasts', characteristics: 'High cart value ($200+), prefer digital payment (bKash/Card), buy audio and smart wearables.', percentage: 45, retentionStrategy: 'Offer early-access pre-orders for new electronics and VIP warranty extensions.' },
        { segmentName: 'Urban Lifestyle & Apparel Buyers', characteristics: 'Interested in natural linen, selvedge denim, and interior aesthetic lighting.', percentage: 35, retentionStrategy: 'Send seasonal lookbooks with curated capsule wardrobe recommendations.' },
        { segmentName: 'Repeat Consumables Shoppers', characteristics: 'Frequent orders for artisan coffee and botanical skincare serums.', percentage: 20, retentionStrategy: 'Implement automated replenishment reminders every 30 days.' },
      ],
      paymentPreferences: [
        { method: 'bKash & Nagad', share: '50%', insight: 'Dominant mobile financial service choice for instant verification in Bangladesh.' },
        { method: 'Card (Visa/Mastercard)', share: '25%', insight: 'Preferred for orders over $200 with zero friction.' },
        { method: 'Cash on Delivery', share: '25%', insight: 'Crucial for first-time shoppers building trust.' },
      ],
      geographicHotspots: ['Dhaka Metropolitan (Banani, Dhanmondi, Uttara, Gulshan)', 'Chittagong Central (Nasirabad, GEC)'],
      repeatPurchaseDrivers: ['Doorstep packaging quality with protective eco-cushioning', 'Transparent SMS/Order tracking status updates'],
      personalizedRecommendationsTip: 'Recommend Ethiopian Coffee Beans to customers who purchase Scandinavian Desk Lamps or Workspace Tech.',
    },
    source: 'fallback',
  });
});

// ════════════════════════════════════════════════════════════
// DATABASE ROUTES — server.ts হুবহু
// ════════════════════════════════════════════════════════════

// GET /api/db/status
app.get('/api/db/status', async (c) => {
  const sql = getSql(c.env);
  if (!sql) return c.json({ connected: false, provider: 'Neon (PostgreSQL)', status: 'unconfigured', message: 'DATABASE_URL is not set in environment. Running in client storage / fallback mode.' });
  try {
    const result = await sql`SELECT NOW() as server_time, version() as version;`;
    const countResult = await sql`SELECT COUNT(*)::int as product_count FROM products;`;
    return c.json({ connected: true, provider: 'Neon (PostgreSQL)', status: 'active', serverTime: (result[0] as any)?.server_time, productCount: (countResult[0] as any)?.product_count || 0, message: 'Successfully connected to Neon Serverless PostgreSQL!' });
  } catch (err: any) {
    return c.json({ connected: false, provider: 'Neon (PostgreSQL)', status: 'error', message: err.message || 'Error querying Neon database' }, 500);
  }
});

// GET /api/products
app.get('/api/products', async (c) => {
  const sql = getSql(c.env);
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM products ORDER BY created_at DESC;`;
      return c.json({ success: true, source: 'neon', data: rows.map(mapRowToProduct) });
    } catch (err: any) {
      console.error('[Neon DB Error in GET /api/products]:', err);
      return c.json({ success: true, source: 'fallback', data: INITIAL_PRODUCTS });
    }
  }
  return c.json({ success: true, source: 'mock', data: INITIAL_PRODUCTS });
});

// POST /api/products
app.post('/api/products', requireAdmin, async (c) => {
  const sql = getSql(c.env);
  const p = await c.req.json();
  if (!p || !p.title) return c.json({ error: 'Product title is required' }, 400);

  const id = p.id || `prod-${Date.now()}`;
  const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (sql) {
    try {
      await sql`
        INSERT INTO products (id, title, slug, sku, category, brand, description, specifications, regular_price, sale_price, stock, rating, review_count, images, variations, featured, is_new, is_bestseller, tags, sales_count, created_at)
        VALUES (${id}, ${p.title}, ${slug}, ${p.sku || ''}, ${p.category || 'Electronics'}, ${p.brand || 'ShopZone'}, ${p.description || ''}, ${JSON.stringify(p.specifications || [])}, ${p.regularPrice || 0}, ${p.salePrice ?? null}, ${p.stock || 0}, ${p.rating || 5.0}, ${p.reviewCount || 0}, ${JSON.stringify(p.images || [])}, ${JSON.stringify(p.variations || {})}, ${p.featured ?? false}, ${p.isNew ?? true}, ${p.isBestSeller ?? false}, ${JSON.stringify(p.tags || [])}, ${p.salesCount || 0}, ${p.createdAt || new Date().toISOString()});
      `;
      return c.json({ success: true, source: 'neon', id });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  }
  return c.json({ success: true, source: 'mock', id });
});

// PUT /api/products/:id
app.put('/api/products/:id', requireAdmin, async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param('id');
  const p = await c.req.json();

  if (sql) {
    try {
      await sql`
        UPDATE products SET title = ${p.title}, regular_price = ${p.regularPrice}, sale_price = ${p.salePrice ?? null}, stock = ${p.stock}, category = ${p.category}, brand = ${p.brand}, description = ${p.description}, images = ${JSON.stringify(p.images || [])}, specifications = ${JSON.stringify(p.specifications || [])}, variations = ${JSON.stringify(p.variations || {})}, tags = ${JSON.stringify(p.tags || [])}, featured = ${p.featured ?? false}, is_new = ${p.isNew ?? false}, is_bestseller = ${p.isBestSeller ?? false}
        WHERE id = ${id};
      `;
      return c.json({ success: true, source: 'neon' });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  }
  return c.json({ success: true, source: 'mock' });
});

// DELETE /api/products/:id
app.delete('/api/products/:id', requireAdmin, async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param('id');

  if (sql) {
    try {
      await sql`DELETE FROM products WHERE id = ${id};`;
      return c.json({ success: true, source: 'neon' });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  }
  return c.json({ success: true, source: 'mock' });
});

// GET /api/orders
app.get('/api/orders', async (c) => {
  const sql = getSql(c.env);
  const authUser = await getAuthUser(c, c.env);
  if (!authUser || authUser.role !== 'admin') return c.json({ success: true, source: 'auth', data: [] });

  if (sql) {
    try {
      const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC;`;
      return c.json({ success: true, source: 'neon', data: rows.map(mapRowToOrder) });
    } catch {
      return c.json({ success: true, source: 'fallback', data: [] });
    }
  }
  return c.json({ success: true, source: 'mock', data: [] });
});

// GET /api/orders/track
app.get('/api/orders/track', async (c) => {
  const sql = getSql(c.env);
  const orderNumber = String(c.req.query('orderNumber') || '').trim().toUpperCase();
  const digits = String(c.req.query('phone') || '').replace(/\D/g, '');
  const notFound = { success: false, message: 'এই তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি। নম্বর দুটি আবার চেক করুন।' };

  if (!orderNumber || digits.length < 10 || !sql) return c.json(notFound, 404);

  try {
    const rows = await sql`SELECT * FROM orders WHERE upper(order_number) = ${orderNumber} LIMIT 1;`;
    const order = rows[0] ? mapRowToOrder(rows[0]) : null;
    const orderDigits = String((order as any)?.customer?.phone || '').replace(/\D/g, '');
    if (!order || orderDigits.slice(-10) !== digits.slice(-10)) return c.json(notFound, 404);
    return c.json({ success: true, order });
  } catch {
    return c.json(notFound, 404);
  }
});

// POST /api/orders
app.post('/api/orders', async (c) => {
  const sql = getSql(c.env);
  const authUser = await getAuthUser(c, c.env);
  const o = await c.req.json();

  if (!o || !o.items || !o.customer) return c.json({ error: 'Order items and customer details are required' }, 400);
  if (!o.customer.name || !o.customer.phone || !o.customer.address) return c.json({ error: 'নাম, মোবাইল নম্বর ও ঠিকানা দিন।' }, 400);

  const customer = { ...o.customer, email: authUser?.email ?? o.customer.email ?? '' };
  const id = o.id || `ord-${Date.now()}`;
  const orderNumber = o.orderNumber || `SZ-${Math.floor(100000 + Math.random() * 900000)}`;

  if (sql) {
    try {
      await sql`
        INSERT INTO orders (id, order_number, created_at, customer, items, subtotal, discount, shipping_fee, total, coupon_code, payment_method, payment_status, order_status, tracking_history, cancellation_reason, return_reason)
        VALUES (${id}, ${orderNumber}, ${o.createdAt || new Date().toISOString()}, ${JSON.stringify(customer)}, ${JSON.stringify(o.items)}, ${o.subtotal || 0}, ${o.discount || 0}, ${o.shippingFee || 0}, ${o.total || 0}, ${o.couponCode || null}, ${o.paymentMethod || 'cod'}, ${o.paymentStatus || 'pending'}, ${o.orderStatus || 'Pending'}, ${JSON.stringify(o.trackingHistory || [])}, ${o.cancellationReason || null}, ${o.returnReason || null});
      `;
      return c.json({ success: true, source: 'neon', id, orderNumber });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  }
  return c.json({ success: true, source: 'mock', id, orderNumber });
});

// PATCH /api/orders/:id/status
app.patch('/api/orders/:id/status', requireAdmin, async (c) => {
  const sql = getSql(c.env);
  const id = c.req.param('id');
  const { status, trackingStep } = await c.req.json();

  if (sql) {
    try {
      if (trackingStep) {
        await sql`UPDATE orders SET order_status = ${status}, tracking_history = tracking_history || ${JSON.stringify([trackingStep])}::jsonb WHERE id = ${id};`;
      } else {
        await sql`UPDATE orders SET order_status = ${status} WHERE id = ${id};`;
      }
      return c.json({ success: true, source: 'neon' });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  }
  return c.json({ success: true, source: 'mock' });
});

// POST /api/db/seed
app.post('/api/db/seed', requireAdmin, async (c) => {
  const sql = getSql(c.env);
  if (!sql) return c.json({ status: 'unconfigured' });

  try {
    await sql`CREATE TABLE IF NOT EXISTS categories (id VARCHAR(100) PRIMARY KEY, name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, description TEXT, icon_name VARCHAR(100), banner_image TEXT, item_count INT DEFAULT 0);`;
    await sql`CREATE TABLE IF NOT EXISTS products (id VARCHAR(100) PRIMARY KEY, title VARCHAR(255) NOT NULL, slug VARCHAR(255), sku VARCHAR(100), category VARCHAR(100), brand VARCHAR(100), description TEXT, specifications JSONB DEFAULT '[]'::jsonb, regular_price NUMERIC(10,2) NOT NULL, sale_price NUMERIC(10,2), stock INT DEFAULT 0, rating NUMERIC(3,2) DEFAULT 0, review_count INT DEFAULT 0, images JSONB DEFAULT '[]'::jsonb, variations JSONB DEFAULT '{}'::jsonb, featured BOOLEAN DEFAULT false, is_new BOOLEAN DEFAULT false, is_bestseller BOOLEAN DEFAULT false, tags JSONB DEFAULT '[]'::jsonb, sales_count INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());`;
    await sql`CREATE TABLE IF NOT EXISTS orders (id VARCHAR(100) PRIMARY KEY, order_number VARCHAR(100) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), customer JSONB NOT NULL, items JSONB NOT NULL, subtotal NUMERIC(10,2) NOT NULL, discount NUMERIC(10,2) DEFAULT 0, shipping_fee NUMERIC(10,2) DEFAULT 0, total NUMERIC(10,2) NOT NULL, coupon_code VARCHAR(100), payment_method VARCHAR(50), payment_status VARCHAR(50), order_status VARCHAR(50), tracking_history JSONB DEFAULT '[]'::jsonb, cancellation_reason TEXT, return_reason TEXT);`;
    await ensureUsersTable(c.env);
    return c.json({ status: 'connected' });
  } catch (error) {
    return c.json({ status: 'error', error: String(error) }, 500);
  }
});

// ─── Default export (Cloudflare Workers entry point) ─────────
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },
};
