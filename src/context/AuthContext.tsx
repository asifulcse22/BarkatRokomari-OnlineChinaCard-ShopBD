import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// File: src/context/AuthContext.tsx
// Customer login/registration nei. Shudhu admin login ekhane kaj kore.

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  /** Error message ferot dey. Login hole null ferot dey. */
  login: (identifier: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  /** Purono file gulo jate na bhange tai rakha hoyeche. Kono kaj kore na. */
  openAuth: (mode?: 'login' | 'register') => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Login/logout er por StoreContext ke notun kore data ante bola
const notifyAuthChanged = () => window.dispatchEvent(new Event('sz-auth-changed'));

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin age theke login thakle seta cheniye neya
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        return data?.message || 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      }
      setUser(data.user);
      notifyAuthChanged();
      return null;
    } catch {
      return 'সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। ইন্টারনেট চেক করুন।';
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    notifyAuthChanged();
  }, []);

  const noop = useCallback(() => {}, []);

  // Site shob shomoy sheshathei dekhabe. Kono loading ba login screen nei.
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        openAuth: noop,
        closeAuth: noop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};