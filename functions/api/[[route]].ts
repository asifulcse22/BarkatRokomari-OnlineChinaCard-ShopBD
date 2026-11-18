import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { neon } from '@neondatabase/serverless';
import { GoogleGenAI } from '@google/genai';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { INITIAL_PRODUCTS } from '../../src/data/mockData';
import { mapRowToProduct, mapRowToOrder } from '../../src/db/neon';

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  GEMINI_API_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

const COOKIE_NAME = 'sz_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Helper to get Neon SQL client
function getSql(c: any) {
  const dbUrl = c.env.DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) return null;
  return neon(dbUrl);
}

// Helper to get JWT Secret
function getJwtSecret(c: any): string {
  const secret = c.env.JWT_SECRET || process.env.JWT_SECRET || '';
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  return secret;
}

// Helper to get Authenticated User
async function getAuthUser(c: any) {
  const sql = getSql(c);
  if (!sql) return null;

  try {
    const token = getCookie(c, COOKIE_NAME);
    if (!token) return null;

    const payload = jwt.verify(token, getJwtSecret(c)) as { sub?: string };
    if (!payload?.sub) return null;

    const rows = await sql`
      SELECT id, name, email, phone, role FROM users WHERE id = ${payload.sub} LIMIT 1;
    `;
    return rows[0] || null;
  } catch {
    return null;
  }
}

// Admin guard middleware
async function requireAdmin(c: any, next: () => Promise<void>) {
  const user = await getAuthUser(c);
  if (!user) {
    return c.json({ success: false, error: 'লগইন করুন।' }, 401);
  }
  if (user.role !== 'admin') {
    return c.json({ success: false, error: 'এই এক্সেস শুধু অ্যাডমিনের জন্য।' }, 403);
  }
  c.set('user', user);
  await next();
}

// ==========================================
// 1. AUTH ROUTES
// ==========================================

app.post('/auth/register', async (c) => {
  const sql = getSql(c);
  if (!sql) return c.json({ success: false, message: 'ডাটাবেস কানেক্টেড নেই।' }, 503);

  try {
    const body = await c.req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    let phone = String(body?.phone || '').replace(/[^\d]/g, '');
    if (phone.startsWith('880')) phone = phone.slice(2);
    if (phone.length === 10 && phone.startsWith('1')) phone = '0' + phone;
    const password = String(body?.password || '');

    if (name.length < 2) return c.json({ success: false, message: 'আপনার নাম লিখুন।' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return c.json({ success: false, message: 'সঠিক ইমেইল দিন।' }, 400);
    if (!/^01[3-9]\d{8}$/.test(phone)) return c.json({ success: false, message: 'সঠিক মোবাইল নম্বর দিন।' }, 400);
    if (password.length < 8) return c.json({ success: false, message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' }, 400);

    const existing = await sql`
      SELECT email, phone FROM users WHERE email = ${email} OR phone = ${phone} LIMIT 1;
    `;
    if (existing[0]) {
      return c.json({ success: false, message: 'এই ইমেইল বা ফোন দিয়ে অলরেডি একাউন্ট রয়েছে।' }, 409);
    }

    const id = `usr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (id, name, email, phone, password_hash, role)
      VALUES (${id}, ${name}, ${email}, ${phone}, ${passwordHash}, 'customer');
    `;

    const token = jwt.sign({ sub: id }, getJwtSecret(c), { expiresIn: '7d' });
    setCookie(c, COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return c.json({ success: true, user: { id, name, email, phone, role: 'customer' } });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' }, 500);
  }
});

app.post('/auth/login', async (c) => {
  const sql = getSql(c);
  if (!sql) return c.json({ success: false, message: 'ডাটাবেস কানেক্টেড নেই।' }, 503);

  try {
    const { identifier, password } = await c.req.json();
    if (!identifier || !password) {
      return c.json({ success: false, message: 'ইমেইল/মোবাইল এবং পাসওয়ার্ড দিন।' }, 400);
    }

    const isEmail = identifier.includes('@');
    let phone = String(identifier).replace(/[^\d]/g, '');
    if (phone.startsWith('880')) phone = phone.slice(2);
    if (phone.length === 10 && phone.startsWith('1')) phone = '0' + phone;

    const rows = isEmail
      ? await sql`SELECT * FROM users WHERE email = ${identifier.trim().toLowerCase()} LIMIT 1;`
      : await sql`SELECT * FROM users WHERE phone = ${phone} LIMIT 1;`;

    const row = rows[0];
    const ok = row ? await bcrypt.compare(password, row.password_hash) : false;
    if (!row || !ok) {
      return c.json({ success: false, message: 'তথ্য সঠিক নয়।' }, 401);
    }

    const token = jwt.sign({ sub: row.id }, getJwtSecret(c), { expiresIn: '7d' });
    setCookie(c, COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return c.json({
      success: true,
      user: { id: row.id, name: row.name, email: row.email, phone: row.phone, role: row.role },
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message || 'লগইন ব্যর্থ হয়েছে।' }, 500);
  }
});

app.post('/auth/logout', (c) => {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
  return c.json({ success: true });
});

app.get('/auth/me', async (c) => {
  const user = await getAuthUser(c);
  return c.json({ success: true, user });
});

// ==========================================
// 2. DATABASE & PRODUCT ROUTES
// ==========================================

app.get('/db/status', async (c) => {
  const sql = getSql(c);
  if (!sql) {
    return c.json({
      connected: false,
      provider: 'Neon (PostgreSQL)',
      status: 'unconfigured',
      message: 'DATABASE_URL সেট করা নেই।',
    });
  }
  try {
    const result = await sql`SELECT NOW() as server_time;`;
    const countResult = await sql`SELECT COUNT(*)::int as product_count FROM products;`;
    return c.json({
      connected: true,
      provider: 'Neon (PostgreSQL)',
      status: 'active',
      serverTime: result[0]?.server_time,
      productCount: countResult[0]?.product_count || 0,
      message: 'Successfully connected to Neon Serverless PostgreSQL!',
    });
  } catch (err: any) {
    return c.json({ connected: false, status: 'error', message: err.message }, 500);
  }
});

app.get('/products', async (c) => {
  const sql = getSql(c);
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM products ORDER BY created_at DESC;`;
      return c.json({ success: true, source: 'neon', data: rows.map(mapRowToProduct) });
    } catch (err) {
      return c.json({ success: true, source: 'fallback', data: INITIAL_PRODUCTS });
    }
  }
  return c.json({ success: true, source: 'mock', data: INITIAL_PRODUCTS });
});

app.post('/products', requireAdmin, async (c) => {
  const sql = getSql(c);
  const p = await c.req.json();
  if (!p || !p.title) return c.json({ error: 'Product title is required' }, 400);

  const id = p.id || `prod-${Date.now()}`;
  const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (sql) {
    try {
      await sql`
        INSERT INTO products (
          id, title, slug, sku, category, brand, description, specifications,
          regular_price, sale_price, stock, rating, review_count, images,
          variations, featured, is_new, is_bestseller, tags, sales_count, created_at
        ) VALUES (
          ${id}, ${p.title}, ${slug}, ${p.sku || ''}, ${p.category || 'Electronics'},
          ${p.brand || 'ShopZone'}, ${p.description || ''}, ${JSON.stringify(p.specifications || [])},
          ${p.regularPrice || 0}, ${p.salePrice ?? null}, ${p.stock || 0},
          ${p.rating || 5.0}, ${p.reviewCount || 0}, ${JSON.stringify(p.images || [])},
          ${JSON.stringify(p.variations || {})}, ${p.featured ?? false},
          ${p.isNew ?? true}, ${p.isBestSeller ?? false},
          ${JSON.stringify(p.tags || [])}, ${p.salesCount || 0}, ${p.createdAt || new Date().toISOString()}
        );
      `;
      return c.json({ success: true, source: 'neon', id });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  }
  return c.json({ success: true, source: 'mock', id });
});

app.put('/products/:id', requireAdmin, async (c) => {
  const sql = getSql(c);
  const id = c.req.param('id');
  const p = await c.req.json();

  if (sql) {
    try {
      await sql`
        UPDATE products SET
          title = ${p.title},
          regular_price = ${p.regularPrice},
          sale_price = ${p.salePrice ?? null},
          stock = ${p.stock},
          category = ${p.category},
          brand = ${p.brand},
          description = ${p.description},
          images = ${JSON.stringify(p.images || [])},
          specifications = ${JSON.stringify(p.specifications || [])},
          variations = ${JSON.stringify(p.variations || {})},
          tags = ${JSON.stringify(p.tags || [])},
          featured = ${p.featured ?? false},
          is_new = ${p.isNew ?? false},
          is_bestseller = ${p.isBestSeller ?? false}
        WHERE id = ${id};
      `;
      return c.json({ success: true, source: 'neon' });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  }
  return c.json({ success: true, source: 'mock' });
});

app.delete('/products/:id', requireAdmin, async (c) => {
  const sql = getSql(c);
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

// ==========================================
// 3. ORDER ROUTES
// ==========================================

app.get('/orders', async (c) => {
  const authUser = await getAuthUser(c);
  if (!authUser || authUser.role !== 'admin') {
    return c.json({ success: true, source: 'auth', data: [] });
  }

  const sql = getSql(c);
  if (sql) {
    try {
      const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC;`;
      return c.json({ success: true, source: 'neon', data: rows.map(mapRowToOrder) });
    } catch (err) {
      return c.json({ success: true, source: 'fallback', data: [] });
    }
  }
  return c.json({ success: true, source: 'mock', data: [] });
});

app.get('/orders/track', async (c) => {
  const orderNumber = String(c.req.query('orderNumber') || '').trim().toUpperCase();
  const digits = String(c.req.query('phone') || '').replace(/\D/g, '');
  const sql = getSql(c);

  if (!orderNumber || digits.length < 10 || !sql) {
    return c.json({ success: false, message: 'তথ্য দিয়ে কোনো অর্ডার পাওয়া যায়নি।' }, 404);
  }

  try {
    const rows = await sql`SELECT * FROM orders WHERE upper(order_number) = ${orderNumber} LIMIT 1;`;
    const order = rows[0] ? mapRowToOrder(rows[0]) : null;
    const orderDigits = String(order?.customer?.phone || '').replace(/\D/g, '');

    if (!order || orderDigits.slice(-10) !== digits.slice(-10)) {
      return c.json({ success: false, message: 'তথ্য মেলেনি।' }, 404);
    }
    return c.json({ success: true, order });
  } catch (err) {
    return c.json({ success: false, message: 'অর্ডার পাওয়া যায়নি।' }, 404);
  }
});

app.post('/orders', async (c) => {
  const authUser = await getAuthUser(c);
  const o = await c.req.json();
  const sql = getSql(c);

  if (!o || !o.items || !o.customer) {
    return c.json({ error: 'Order details required' }, 400);
  }

  const customer = { ...o.customer, email: authUser?.email ?? o.customer.email ?? '' };
  const id = o.id || `ord-${Date.now()}`;
  const orderNumber = o.orderNumber || `SZ-${Math.floor(100000 + Math.random() * 900000)}`;

  if (sql) {
    try {
      await sql`
        INSERT INTO orders (
          id, order_number, created_at, customer, items, subtotal,
          discount, shipping_fee, total, coupon_code, payment_method,
          payment_status, order_status, tracking_history, cancellation_reason, return_reason
        ) VALUES (
          ${id}, ${orderNumber}, ${o.createdAt || new Date().toISOString()},
          ${JSON.stringify(customer)}, ${JSON.stringify(o.items)},
          ${o.subtotal || 0}, ${o.discount || 0}, ${o.shippingFee || 0}, ${o.total || 0},
          ${o.couponCode || null}, ${o.paymentMethod || 'cod'}, ${o.paymentStatus || 'pending'},
          ${o.orderStatus || 'Pending'}, ${JSON.stringify(o.trackingHistory || [])},
          ${o.cancellationReason || null}, ${o.returnReason || null}
        );
      `;
      return c.json({ success: true, source: 'neon', id, orderNumber });
    } catch (err: any) {
      return c.json({ error: err.message }, 500);
    }
  }
  return c.json({ success: true, source: 'mock', id, orderNumber });
});

app.patch('/orders/:id/status', requireAdmin, async (c) => {
  const id = c.req.param('id');
  const { status, trackingStep } = await c.req.json();
  const sql = getSql(c);

  if (sql) {
    try {
      if (trackingStep) {
        await sql`
          UPDATE orders 
          SET order_status = ${status},
              tracking_history = tracking_history || ${JSON.stringify([trackingStep])}::jsonb
          WHERE id = ${id};
        `;
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

// ==========================================
// 4. AI ENDPOINTS (GEMINI)
// ==========================================

async function callGemini(apiKey: string, prompt: string, systemInstruction?: string) {
  if (!apiKey) return null;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction, temperature: 0.7 } : { temperature: 0.7 },
    });
    return response.text || null;
  } catch (err) {
    return null;
  }
}

app.post('/ai/ask-assistant', async (c) => {
  const { question, storeContext } = await c.req.json();
  const apiKey = c.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

  const prompt = `
Store Admin asks: "${question}"
Store Context: Total Sales: $${storeContext?.totalRevenue ?? 0}, Orders: ${storeContext?.totalOrders ?? 0}.
Answer concisely in Bengali if asked in Bengali, else in English.
`;
  const result = await callGemini(apiKey, prompt);
  if (result) return c.json({ success: true, answer: result, source: 'gemini' });

  return c.json({
    success: true,
    answer: `📊 আপনার স্টোরের মোট বিক্রয় $${storeContext?.totalRevenue || 0} এবং মোট অর্ডার ${storeContext?.totalOrders || 0} টি। লো-স্টক আইটেমগুলোর দিকে খেয়াল রাখুন।`,
    source: 'fallback',
  });
});

export const onRequest = handle(app);