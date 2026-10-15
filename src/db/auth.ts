import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from './neon';

// ===============================================================
// Neon-backed user authentication (register / login / logout / me)
// ফাইলের জায়গা: src/db/auth.ts
// ===============================================================

const COOKIE_NAME = 'sz_token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // ৭ দিন

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 32) {
    throw new Error('JWT_SECRET .env ফাইলে সেট করা নেই (কমপক্ষে ৩২ অক্ষর দরকার)।');
  }
  return secret;
}

// users টেবিল না থাকলে সার্ভার চালুর সময় বানিয়ে নেবে
export async function ensureUsersTable(): Promise<void> {
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

// ---------- helpers ----------
function normalizeEmail(v: unknown): string {
  return String(v || '').trim().toLowerCase();
}

// 01XXXXXXXXX ফরম্যাটে আনে (+880 / 880 / স্পেস / ড্যাশ সরিয়ে)
function normalizePhone(v: unknown): string {
  let d = String(v || '').replace(/[^\d]/g, '');
  if (d.startsWith('880')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('1')) d = '0' + d;
  return d;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BD_PHONE_RE = /^01[3-9]\d{8}$/;

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx < 0) return;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  });
  return out;
}

function setAuthCookie(res: Response, userId: string) {
  const token = jwt.sign({ sub: userId }, getSecret(), { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  });
}

// অন্য রুট (যেমন /api/orders) থেকেও এটা ব্যবহার করা যাবে
export async function getAuthUser(req: Request): Promise<AuthUser | null> {
  if (!sql) return null;
  try {
    const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
    if (!token) return null;
    const payload = jwt.verify(token, getSecret()) as { sub?: string };
    if (!payload.sub) return null;
    const rows = await sql`
      SELECT id, name, email, phone, role FROM users WHERE id = ${payload.sub} LIMIT 1;
    `;
    if (!rows[0]) return null;
    return rows[0] as AuthUser;
  } catch {
    return null;
  }
}

// লগইনে ভুল পাসওয়ার্ডের চেষ্টা সীমিত করার সহজ ব্যবস্থা (১৫ মিনিটে ১০ বার)
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

export const authRouter = Router();

const NEON_OFF = {
  success: false,
  message: 'ডাটাবেস সংযুক্ত নেই। লগইন/রেজিস্ট্রেশনের জন্য Neon ডাটাবেস চালু থাকতে হবে।',
};

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  if (!sql) return res.status(503).json(NEON_OFF);

  try {
    const name = String(req.body?.name || '').trim();
    const email = normalizeEmail(req.body?.email);
    const phone = normalizePhone(req.body?.phone);
    const password = String(req.body?.password || '');

    if (name.length < 2) {
      return res.status(400).json({ success: false, message: 'আপনার পুরো নাম লিখুন।' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, message: 'সঠিক ইমেইল ঠিকানা দিন।' });
    }
    if (!BD_PHONE_RE.test(phone)) {
      return res.status(400).json({ success: false, message: 'সঠিক মোবাইল নম্বর দিন (যেমন 01712345678)।' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।' });
    }

    const existing = await sql`
      SELECT email, phone FROM users WHERE email = ${email} OR phone = ${phone} LIMIT 1;
    `;
    if (existing[0]) {
      const field = existing[0].email === email ? 'ইমেইল' : 'মোবাইল নম্বর';
      return res.status(409).json({ success: false, message: `এই ${field} দিয়ে আগেই একাউন্ট খোলা আছে। লগইন করুন।` });
    }

    const id = `usr-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (id, name, email, phone, password_hash, role)
      VALUES (${id}, ${name}, ${email}, ${phone}, ${passwordHash}, 'customer');
    `;

    setAuthCookie(res, id);
    const user: AuthUser = { id, name, email, phone, role: 'customer' };
    return res.json({ success: true, user });
  } catch (err: any) {
    console.error('[Auth] register error:', err);
    return res.status(500).json({ success: false, message: err.message || 'রেজিস্ট্রেশন করা যায়নি।' });
  }
});

// POST /api/auth/login  (identifier = ইমেইল অথবা মোবাইল নম্বর)
authRouter.post('/login', async (req: Request, res: Response) => {
  if (!sql) return res.status(503).json(NEON_OFF);

  try {
    const identifier = String(req.body?.identifier || '').trim();
    const password = String(req.body?.password || '');

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'ইমেইল/মোবাইল নম্বর ও পাসওয়ার্ড দিন।' });
    }

    if (tooManyAttempts(`${req.ip}|${identifier.toLowerCase()}`)) {
      return res.status(429).json({ success: false, message: 'অনেকবার ভুল চেষ্টা হয়েছে। ১৫ মিনিট পরে আবার চেষ্টা করুন।' });
    }

    const isEmail = identifier.includes('@');
    const rows = isEmail
      ? await sql`SELECT * FROM users WHERE email = ${normalizeEmail(identifier)} LIMIT 1;`
      : await sql`SELECT * FROM users WHERE phone = ${normalizePhone(identifier)} LIMIT 1;`;

    const row = rows[0];
    const ok = row ? await bcrypt.compare(password, row.password_hash) : false;
    if (!row || !ok) {
      return res.status(401).json({ success: false, message: 'ইমেইল/মোবাইল নম্বর অথবা পাসওয়ার্ড ভুল।' });
    }

    attempts.delete(`${req.ip}|${identifier.toLowerCase()}`);
    setAuthCookie(res, row.id);
    const user: AuthUser = { id: row.id, name: row.name, email: row.email, phone: row.phone, role: row.role };
    return res.json({ success: true, user });
  } catch (err: any) {
    console.error('[Auth] login error:', err);
    return res.status(500).json({ success: false, message: err.message || 'লগইন করা যায়নি।' });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  return res.json({ success: true });
});

// GET /api/auth/me  (পেজ রিলোডে লগইন অবস্থা ফেরত পেতে)
authRouter.get('/me', async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  return res.json({ success: true, user });
});


// শুধু admin রোলের ইউজার এই রুটগুলো ব্যবহার করতে পারবে
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: 'আগে লগইন করুন।' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'এই কাজ শুধু অ্যাডমিন করতে পারবে।' });
  }
  next();
}