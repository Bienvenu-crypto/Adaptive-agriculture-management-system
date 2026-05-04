'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MpUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  district: string;
  role: 'seller' | 'buyer';
}

interface Listing {
  id: string;
  seller_id: string;
  crop: string;
  quantity_kg: number;
  price_per_kg: number;
  currency: string;
  description: string | null;
  status: string;
  created_at: string;
  seller_name: string;
  seller_district: string;
  seller_phone: string | null;
}

interface BuyOrder {
  id: string;
  buyer_id: string;
  crop: string;
  quantity_kg: number;
  max_price_per_kg: number;
  currency: string;
  description: string | null;
  status: string;
  created_at: string;
  buyer_name: string;
  buyer_district: string;
  buyer_phone: string | null;
}

interface Trade {
  id: string;
  crop: string;
  quantity_kg: number;
  agreed_price_per_kg: number;
  total_value: number;
  currency: string;
  status: string;
  payment_status: 'unpaid' | 'pending' | 'paid';
  payment_method: string | null;
  payment_phone: string | null;
  created_at: string;
  seller_name: string;
  seller_phone: string | null;
  seller_district: string;
  buyer_name: string;
  buyer_phone: string | null;
  buyer_district: string;
  seller_id: string;
  buyer_id: string;
  completed_at?: string;
}

// ─── Auth Modal ──────────────────────────────────────────────────────────────
function AuthModal({
  onClose,
  onSuccess,
  defaultRole,
}: {
  onClose: () => void;
  onSuccess: (user: MpUser) => void;
  defaultRole: 'seller' | 'buyer';
}) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'seller' | 'buyer'>(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    district: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint =
        mode === 'signup'
          ? '/api/marketplace/auth/register'
          : '/api/marketplace/auth/login';

      const body =
        mode === 'signup'
          ? { ...form, role }
          : { email: form.email, password: form.password, phone: form.phone, role };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-slate-50 p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
        >
          Close
        </button>

        <div className="p-8">
          {/* Role selector */}
          <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
            {(['seller', 'buyer'] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setError(''); }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest capitalize transition-all ${role === r
                  ? r === 'seller'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {r === 'seller' ? 'Seller' : 'Buyer'}
              </button>
            ))}
          </div>

          <div className={`flex justify-center mb-4`}>
            <div className={`px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest ${role === 'seller' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              {role === 'seller' ? 'Store' : 'Cart'}
            </div>
          </div>

          <h2 className="text-2xl font-black text-center text-slate-900 mb-1 uppercase tracking-tighter">
            {mode === 'login' ? 'Welcome back' : `Join as ${role}`}
          </h2>
          <p className="text-slate-500 text-center mb-6 text-sm">
            {mode === 'login'
              ? `Sign in to your ${role} account`
              : role === 'seller'
                ? 'List your crops and connect with buyers'
                : 'Find the best crop deals from local farmers'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">District</label>
                  <input
                    type="text"
                    required
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    placeholder="e.g. Wakiso"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Manual district entry</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="tel"
                required={mode === 'signup'}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm"
                placeholder="+256 700..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm shadow-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl flex gap-2 items-center">
                <span className="flex-shrink-0 bg-red-600 text-white px-2 py-0.5 rounded-lg text-[8px]">ERROR</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-70 ${role === 'seller' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
              className={`font-bold hover:underline ${role === 'seller' ? 'text-emerald-600' : 'text-blue-600'}`}
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>

          {mode === 'signup' && (
            <p className="mt-3 text-center text-xs text-slate-400">
              You can create both a seller and buyer account using the same email.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Add Listing Modal ───────────────────────────────────────────────────────
function AddListingModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    crop: '',
    quantity_kg: '',
    price_per_kg: '',
    currency: 'UGX',
    description: ''
  });

  const currencies = ['UGX', 'KES', 'RWF', 'TZS', 'NGN', 'GHS', 'ZAR', 'USD'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: form.crop,
          quantity_kg: parseFloat(form.quantity_kg),
          price_per_kg: parseFloat(form.price_per_kg),
          currency: form.currency,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-slate-50 p-8">
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Close</button>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 px-3 py-1.5 rounded-xl text-emerald-600 font-black text-[10px] uppercase tracking-widest">New</div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">New Listing</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Post your crop for sale</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Crop Name</label>
              <input type="text" required value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                placeholder="e.g. Maize" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Currency</label>
              <select
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold appearance-none"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Quantity (kg)</label>
              <input type="number" required min="0.1" step="0.1" value={form.quantity_kg} onChange={e => setForm({ ...form, quantity_kg: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                placeholder="500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Price/kg</label>
              <input type="number" required min="1" value={form.price_per_kg} onChange={e => setForm({ ...form, price_per_kg: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                placeholder="1200" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none font-medium"
              rows={2} placeholder="Grade A, freshly harvested..." />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-colors disabled:opacity-70 shadow-lg shadow-emerald-600/20">
            {loading ? 'Processing...' : `Post Listing (${form.currency})`}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Add Buy Order Modal ─────────────────────────────────────────────────────
function AddBuyOrderModal({
  onClose,
  onSuccess,
  prefillCrop,
  prefillCurrency = 'UGX',
}: {
  onClose: () => void;
  onSuccess: (trade: Trade | null) => void;
  prefillCrop?: string;
  prefillCurrency?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    crop: prefillCrop || '',
    quantity_kg: '',
    max_price_per_kg: '',
    currency: prefillCurrency,
    description: ''
  });

  const currencies = ['UGX', 'KES', 'RWF', 'TZS', 'NGN', 'GHS', 'ZAR', 'USD'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/marketplace/buy-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: form.crop,
          quantity_kg: parseFloat(form.quantity_kg),
          max_price_per_kg: parseFloat(form.max_price_per_kg),
          currency: form.currency,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data.trade);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-slate-50 p-8">
        <button onClick={onClose} className="absolute top-4 right-4 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Close</button>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 px-3 py-1.5 rounded-xl text-blue-600 font-black text-[10px] uppercase tracking-widest">Order</div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">New Buy Order</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Request a crop</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Crop Name</label>
              <input type="text" required value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                placeholder="e.g. Maize" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Currency</label>
              <select
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold appearance-none"
              >
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Quantity (kg)</label>
              <input type="number" required min="0.1" step="0.1" value={form.quantity_kg} onChange={e => setForm({ ...form, quantity_kg: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                placeholder="200" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Max Price/kg</label>
              <input type="number" required min="1" value={form.max_price_per_kg} onChange={e => setForm({ ...form, max_price_per_kg: e.target.value })}
                className="w-full bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                placeholder="1500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Notes (optional)</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none font-medium"
              rows={2} placeholder="Preferred grade, delivery notes..." />
          </div>
          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-lg shadow-blue-600/20">
            {loading ? 'Submitting...' : `Submit Order (${form.currency})`}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Trade Success Toast ─────────────────────────────────────────────────────
function TradeToast({ trade, onDismiss }: { trade: Trade; onDismiss: () => void }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: -60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -60 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[500] w-full max-w-sm bg-slate-900 text-white p-6"
    >
      <div className="flex items-start gap-4">
        <div className="bg-emerald-100 px-3 py-1.5 rounded-xl text-emerald-600 flex-shrink-0 font-black text-[9px] uppercase tracking-widest">
          Match
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white text-xs uppercase tracking-tighter">Trade Matched!</p>
          <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest leading-loose">
            <strong>{trade.quantity_kg} KG</strong> of <strong>{trade.crop}</strong> at <strong>{trade.currency} {trade.agreed_price_per_kg.toLocaleString()}/KG</strong>
          </p>
          <p className="text-[10px] text-emerald-700 font-black mt-1 uppercase tracking-[0.2em]">
            TOTAL VALUE: {trade.currency} {trade.total_value.toLocaleString()}
          </p>
          <div className="mt-3 pt-3 bg-slate-50/50 rounded-xl p-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none px-1">Contact Intelligence</p>
            <div className="bg-slate-50 rounded-xl px-3 py-1.5">
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block mb-0.5">Seller ID: {trade.seller_name}</span>
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter block">{trade.seller_phone || 'REDACTED'}</span>
            </div>
          </div>
        </div>
        <button onClick={onDismiss} className="px-3 py-1.5 bg-slate-50 text-[9px] font-black text-slate-400 hover:text-slate-950 uppercase tracking-widest rounded-lg transition-colors">Dismiss</button>
      </div>
    </motion.div>
  );
}

// ─── Main Marketplace Component ───────────────────────────────────────────────
export default function Marketplace({ forcedTab }: { forcedTab?: string }) {
  const [mpUser, setMpUser] = useState<MpUser | any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-listings' | 'buy-orders' | 'trades' | 'advertising'>((forcedTab as any) || 'browse');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState<'seller' | 'buyer'>('seller');
  const [showAddListing, setShowAddListing] = useState(false);
  const [showAddBuyOrder, setShowAddBuyOrder] = useState(false);
  const [prefillCrop, setPrefillCrop] = useState('');
  const [prefillCurrency, setPrefillCurrency] = useState('UGX');
  const [tradeSearch, setTradeSearch] = useState('');
  const [tradeToast, setTradeToast] = useState<Trade | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [buyOrders, setBuyOrders] = useState<BuyOrder[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Advertising specific state
  const [isPayingAd, setIsPayingAd] = useState(false);

  // Handle forcedTab from parent
  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab as any);
    }
  }, [forcedTab]);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/marketplace/auth/session');
      const d = await res.json();
      setMpUser(d.user);
    } catch (e) {
      console.error('Session fetch failed', e);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // Check session on mount
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const fetchListings = useCallback(async () => {
    const res = await fetch('/api/marketplace/listings');
    const data = await res.json();
    setListings(data.listings || []);
  }, []);

  const fetchBuyOrders = useCallback(async () => {
    const res = await fetch('/api/marketplace/buy-orders');
    const data = await res.json();
    setBuyOrders(data.orders || []);
  }, []);

  const fetchTrades = useCallback(async () => {
    const res = await fetch('/api/marketplace/trades');
    const data = await res.json();
    setTrades(data.trades || []);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    await Promise.all([fetchListings(), fetchBuyOrders(), ...(mpUser ? [fetchTrades()] : [])]);
    setLoadingData(false);
  }, [fetchListings, fetchBuyOrders, fetchTrades, mpUser]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogout = async () => {
    await fetch('/api/marketplace/auth/session', { method: 'DELETE' });
    setMpUser(null);
    setActiveTab('browse');
    setTrades([]);
  };

  const confirmReceipt = async (tradeId: string) => {
    try {
      const res = await fetch('/api/marketplace/trades', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tradeId, status: 'completed' }),
      });
      if (res.ok) {
        setTrades(prev => prev.map(t => t.id === tradeId ? { ...t, status: 'completed', completed_at: new Date().toISOString() } : t));
      }
    } catch (err) {
      console.error('Failed to complete trade');
    }
  };

  const cancelListing = async (id: string) => {
    await fetch('/api/marketplace/listings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchListings();
  };

  const cancelBuyOrder = async (id: string) => {
    await fetch('/api/marketplace/buy-orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchBuyOrders();
  };

  const myListings = listings.filter(l => mpUser && l.seller_id === mpUser.id);
  const myBuyOrders = buyOrders.filter(o => mpUser && o.buyer_id === mpUser.id);

  const handleAdPayment = async () => {
    setIsPayingAd(true);
    try {
      const res = await fetch('/api/marketplace/subscribe', { method: 'POST' });
      if (res.ok) {
        await fetchSession();
        setActiveTab('advertising');
      } else {
        const data = await res.json();
        alert(data.error || 'Payment failed');
      }
    } catch (err) {
      alert('Network error during payment');
    } finally {
      setIsPayingAd(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[300px]">
        <div className="px-8 py-3 bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">
          Exchanging
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showAuthModal && (
          <AuthModal
            key="auth-modal"
            onClose={() => setShowAuthModal(false)}
            onSuccess={(user) => { setMpUser(user); fetchAll(); }}
            defaultRole={authRole}
          />
        )}
        {showAddListing && (
          <AddListingModal
            key="add-listing-modal"
            onClose={() => setShowAddListing(false)}
            onSuccess={() => { fetchListings(); setActiveTab('my-listings'); }}
          />
        )}
        {showAddBuyOrder && (
          <AddBuyOrderModal
            key="add-buy-order-modal"
            onClose={() => setShowAddBuyOrder(false)}
            prefillCrop={prefillCrop}
            prefillCurrency={prefillCurrency}
            onSuccess={(trade) => {
              fetchAll();
              if (trade) setTradeToast(trade);
              setActiveTab('trades');
            }}
          />
        )}
        {tradeToast && (
          <TradeToast key="trade-toast" trade={tradeToast} onDismiss={() => setTradeToast(null)} />
        )}
      </AnimatePresence>

      <div className="bg-transparent">
        {/* Header */}
        <div className={`p-6 text-white ${(forcedTab === 'buy-orders' || activeTab === 'buy-orders' || (mpUser?.role === 'buyer' && activeTab === 'browse')) ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-black uppercase tracking-tighter">AgroMarket</h3>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Verified</span>
              </div>
              <p className={`${(forcedTab === 'buy-orders' || activeTab === 'buy-orders' || (mpUser?.role === 'buyer' && activeTab === 'browse')) ? 'text-blue-100' : 'text-emerald-100'} text-[10px] font-bold uppercase tracking-widest`}>
                Agricultural Output Exchange
              </p>
            </div>

            {(mpUser && (!forcedTab || (forcedTab === 'my-listings' && mpUser.role === 'seller') || (forcedTab === 'buy-orders' && mpUser.role === 'buyer') || (forcedTab === 'advertising' && mpUser.role === 'seller'))) ? (
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="font-black text-sm uppercase tracking-tighter">{mpUser.name}</p>
                  <p className={`${mpUser.role === 'buyer' ? 'text-blue-200' : 'text-emerald-200'} text-[9px] uppercase tracking-widest font-black`}>{mpUser.role} · {mpUser.district}</p>
                </div>
                <button onClick={handleLogout} className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-[9px] font-black uppercase tracking-widest">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 flex-shrink-0">
                {(activeTab === 'my-listings' || forcedTab === 'my-listings' || !forcedTab) && (
                  <button
                    onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                  >
                    Login as Seller
                  </button>
                )}
                {(activeTab === 'buy-orders' || forcedTab === 'buy-orders' || !forcedTab) && (
                  <button
                    onClick={() => { setAuthRole('buyer'); setShowAuthModal(true); }}
                    className={`${(forcedTab === 'buy-orders' || activeTab === 'buy-orders') ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-white text-emerald-700 hover:bg-emerald-50'} px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-colors`}
                  >
                    Login as Buyer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats bar */}
          <div className="flex gap-4 mt-4 text-xs">
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="font-bold text-base">{listings.length}</span>
              <span className={`${(mpUser?.role === 'buyer' || forcedTab === 'buy-orders') ? 'text-blue-200' : 'text-emerald-200'} ml-1`}>listings</span>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="font-bold text-base">{buyOrders.length}</span>
              <span className={`${(mpUser?.role === 'buyer' || forcedTab === 'buy-orders') ? 'text-blue-200' : 'text-emerald-200'} ml-1`}>buy orders</span>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <span className="font-bold text-base">{trades.filter(t => t.status === 'pending' || t.status === 'completed').length}</span>
              <span className={`${(mpUser?.role === 'buyer' || forcedTab === 'buy-orders') ? 'text-blue-200' : 'text-emerald-200'} ml-1`}>trades</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {!forcedTab && (
          <div className="flex gap-1 p-2 bg-slate-50 overflow-x-auto">
            {([
              { key: 'browse', label: 'Browse' },
              ...(mpUser?.role === 'seller' ? [{ key: 'my-listings', label: 'Listings' }] : []),
              ...(mpUser?.role === 'buyer' ? [{ key: 'buy-orders', label: 'Orders' }] : []),
              ...(mpUser ? [{ key: 'trades', label: 'Trades' }] : []),
              { key: 'advertising', label: 'Advertising' },
            ] as { key: string; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                  }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="flex-1" />
            <button onClick={fetchAll} className="px-3 py-2 text-[9px] font-black text-slate-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-colors uppercase tracking-widest" title="Refresh">
              {loadingData ? '...' : 'Sync'}
            </button>
          </div>
        )}

        <div className="p-5">
          {/* BROWSE TAB */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Active Listings */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Available Listings
                  </h4>
                  {mpUser?.role === 'seller' && (
                    <button
                      onClick={() => {
                        if (!mpUser.is_subscribed) {
                          setActiveTab('advertising');
                          return;
                        }
                        setShowAddListing(true);
                      }}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors"
                    >
                      New Listing
                    </button>
                  )}
                  {!mpUser && (
                    <button onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }}
                      className="text-[10px] text-emerald-600 font-black uppercase tracking-widest hover:underline">
                      Sell your crops
                    </button>
                  )}
                </div>

                {listings.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Output</p>
                    <p className="text-sm font-bold mt-1">Be the first to list a crop</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {listings.map((listing) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50 rounded-xl transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-black text-[9px] uppercase tracking-tighter flex-shrink-0">
                            CROP
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm uppercase tracking-tighter">{listing.crop}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {listing.seller_district} · {listing.seller_name}
                              {listing.seller_phone && ` · ${listing.seller_phone}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-bold text-slate-900 text-sm">{listing.quantity_kg.toLocaleString()} kg</p>
                            <p className="text-xs text-emerald-700 font-bold">{listing.currency} {listing.price_per_kg.toLocaleString()}/kg</p>
                          </div>
                          <button
                            onClick={() => {
                              if (!mpUser) {
                                setAuthRole('buyer');
                                setShowAuthModal(true);
                                return;
                              }
                              if (mpUser.role !== 'buyer') {
                                alert("Your account is registered as a Seller. Please log in with a Buyer account to purchase crops.");
                                return;
                              }
                              setPrefillCrop(listing.crop);
                              setPrefillCurrency(listing.currency);
                              setShowAddBuyOrder(true);
                            }}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                          >
                            Buy
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buy Orders */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                    Current Demand
                  </h4>
                  {mpUser?.role === 'buyer' && (
                    <button onClick={() => { setPrefillCrop(''); setShowAddBuyOrder(true); }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">
                      New Order
                    </button>
                  )}
                  {!mpUser && (
                    <button onClick={() => { setAuthRole('buyer'); setShowAuthModal(true); }}
                      className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:underline">
                      Post a buy order
                    </button>
                  )}
                </div>

                {buyOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Demand</p>
                    <p className="text-sm font-bold mt-1">Post your crop requirements</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {buyOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-black text-[9px] uppercase tracking-tighter flex-shrink-0">
                            BUY
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm uppercase tracking-tighter">{order.crop}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                              {order.buyer_district} · {order.buyer_name}
                              {order.buyer_phone && ` · ${order.buyer_phone}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-sm tracking-tighter">{order.quantity_kg.toLocaleString()} KG</p>
                          <p className="text-[9px] text-blue-700 font-black uppercase tracking-widest">MAX {order.currency} {order.max_price_per_kg.toLocaleString()}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY LISTINGS TAB (seller) */}
          {activeTab === 'my-listings' && (
            <div>
              {!mpUser ? (
                <div className="text-center py-16">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Authentication Required</p>
                  <button onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Log in as Seller</button>
                </div>
              ) : mpUser.role !== 'seller' ? (
                <div className="text-center py-16">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Seller Account Required</p>
                  <button onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Log in as Seller</button>
                </div>
              ) : !mpUser.is_subscribed ? (
                <div className="text-center py-16 bg-slate-100">
                  <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Subscription Required</p>
                  <p className="text-sm text-slate-900 mt-2 font-bold max-w-xs mx-auto">You must pay the activation fee of 100,000 UGX to start listing your products.</p>
                  <button onClick={() => setActiveTab('advertising')} className="mt-6 bg-slate-900 text-white px-8 py-3 font-black uppercase text-[10px] tracking-widest">Go to Subscription</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Managed Assets</h4>
                      <p className="text-2xl font-black text-slate-950 uppercase tracking-tighter">{myListings.length} Active Listings</p>
                    </div>
                    <button onClick={() => setShowAddListing(true)}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                      + Add New Asset
                    </button>
                  </div>

                  {myListings.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 mb-12">
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">📦</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Inventory Empty</p>
                      <p className="text-sm font-bold text-slate-600 mb-8">Your commercial output will appear here</p>
                      <button onClick={() => setShowAddListing(true)} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">Initialize First Listing</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                      {myListings.map(listing => (
                        <div key={listing.id} className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500 overflow-hidden">
                          <div className="absolute top-0 right-0 p-4">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${listing.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                              {listing.status}
                            </span>
                          </div>
                          <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-xl font-black shadow-inner">
                              {listing.crop[0]}
                            </div>
                            <div>
                              <h5 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{listing.crop}</h5>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU: {listing.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume</p>
                              <p className="text-base font-black text-slate-900">{listing.quantity_kg.toLocaleString()} <span className="text-[10px] text-slate-500">KG</span></p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Price</p>
                              <p className="text-base font-black text-emerald-600">{listing.currency} {listing.price_per_kg.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Listed {format(new Date(listing.created_at), 'dd MMM')}
                            </p>
                            <button onClick={() => cancelListing(listing.id)}
                              className="px-4 py-2 text-[9px] font-black text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest">
                              Remove Asset
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Discovery: Current Demand (visible to sellers in Listings portal) */}
                  <div className="mt-16 pt-12 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-8 px-2">
                      <div>
                        <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">Live Demand</h4>
                        <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Opportunities to Fulfill</p>
                      </div>
                    </div>

                    {buyOrders.filter(o => o.buyer_id !== mpUser?.id).length === 0 ? (
                      <div className="text-center py-12 bg-slate-50/50 rounded-[2rem]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No external demand found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {buyOrders.filter(o => o.buyer_id !== mpUser?.id).map(order => (
                          <div key={order.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-emerald-200 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 font-black text-xs shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                {order.crop[0]}
                              </div>
                              <div>
                                <p className="font-black text-slate-950 uppercase tracking-tighter leading-none mb-1">{order.crop}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                  Seeking {order.quantity_kg.toLocaleString()} KG in {order.buyer_district}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900 leading-none mb-1">{order.currency} {order.max_price_per_kg.toLocaleString()}/kg</p>
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Max Budget</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* MY BUY ORDERS TAB (buyer) */}
          {activeTab === 'buy-orders' && (
            <div>
              {!mpUser ? (
                <div className="text-center py-16">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Authentication Required</p>
                  <button onClick={() => { setAuthRole('buyer'); setShowAuthModal(true); }} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Log in as Buyer</button>
                </div>
              ) : mpUser.role !== 'buyer' ? (
                <div className="text-center py-16">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Buyer Account Required</p>
                  <button onClick={() => { setAuthRole('buyer'); setShowAuthModal(true); }} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Log in as Buyer</button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Procurement Queue</h4>
                      <p className="text-2xl font-black text-slate-950 uppercase tracking-tighter">{myBuyOrders.length} Open Orders</p>
                    </div>
                    <button onClick={() => { setPrefillCrop(''); setShowAddBuyOrder(true); }}
                      className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                      + Create Purchase Req
                    </button>
                  </div>

                  {myBuyOrders.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 mb-12">
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl">🛒</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Queue Empty</p>
                      <p className="text-sm font-bold text-slate-600 mb-8">Your crop requirements will appear here</p>
                      <button onClick={() => { setPrefillCrop(''); setShowAddBuyOrder(true); }} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Post Initial Requirement</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                      {myBuyOrders.map(order => (
                        <div key={order.id} className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 overflow-hidden">
                          <div className="absolute top-0 right-0 p-4">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-xl font-black shadow-inner">
                              {order.crop[0]}
                            </div>
                            <div>
                              <h5 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{order.crop}</h5>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">REQ: {order.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Vol</p>
                              <p className="text-base font-black text-slate-900">{order.quantity_kg.toLocaleString()} <span className="text-[10px] text-slate-500">KG</span></p>
                            </div>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Price</p>
                              <p className="text-base font-black text-blue-600">{order.currency} {order.max_price_per_kg.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Requested {format(new Date(order.created_at), 'dd MMM')}
                            </p>
                            {order.status === 'open' && (
                              <button onClick={() => cancelBuyOrder(order.id)}
                                className="px-4 py-2 text-[9px] font-black text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all uppercase tracking-widest">
                                Revoke Request
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Discovery: Available Listings (visible to buyers in Orders portal) */}
                  <div className="mt-16 pt-12 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-8 px-2">
                      <div>
                        <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Market Discovery</h4>
                        <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Available for Purchase</p>
                      </div>
                    </div>

                    {listings.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50/50 rounded-[2rem]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No external listings found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {listings.map(listing => (
                          <div key={listing.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-transparent hover:border-blue-200 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-black text-xs shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                {listing.crop[0]}
                              </div>
                              <div>
                                <p className="font-black text-slate-950 uppercase tracking-tighter leading-none mb-1">{listing.crop}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                  {listing.quantity_kg.toLocaleString()} KG available from {listing.seller_name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm font-black text-slate-900 leading-none mb-1">{listing.currency} {listing.price_per_kg.toLocaleString()}/kg</p>
                                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Asking Price</p>
                              </div>
                              <button
                                onClick={() => {
                                  setPrefillCrop(listing.crop);
                                  setPrefillCurrency(listing.currency);
                                  setShowAddBuyOrder(true);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
                              >
                                Buy
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TRADES TAB */}
          {activeTab === 'trades' && mpUser && (
            <div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search trades by crop, user name, or phone number..."
                  value={tradeSearch}
                  onChange={(e) => setTradeSearch(e.target.value)}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>
              {(() => {
                const search = tradeSearch.toLowerCase();
                const filtered = trades.filter(t =>
                  t.crop.toLowerCase().includes(search) ||
                  t.seller_name.toLowerCase().includes(search) ||
                  t.buyer_name.toLowerCase().includes(search) ||
                  (t.seller_phone && t.seller_phone.includes(search)) ||
                  (t.buyer_phone && t.buyer_phone.includes(search))
                );

                if (trades.length === 0) {
                  return (
                    <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest">No Trade Activity</p>
                      <p className="text-sm font-bold mt-2 text-slate-500 max-w-xs mx-auto">
                        {mpUser.role === 'buyer'
                          ? 'Post a buy order to automatically match with a seller.'
                          : 'Trades will appear here once a match is found.'}
                      </p>
                    </div>
                  );
                }

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-16 text-slate-400 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest">No Results Found</p>
                      <p className="text-sm font-bold mt-1">Try a different search term</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto bg-transparent">
                    <table className="w-full text-left">
                      <thead className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
                        <tr className="bg-white/10">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-50 text-left">Crop</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-50 text-left">Quantity</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white text-left text-center">Total Value</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-50 text-left">Parties</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-50 text-left text-center">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-50 text-left">Completed On</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-50 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(trade => {
                          const isSeller = trade.seller_id === mpUser.id;
                          return (
                            <motion.tr
                              key={trade.id}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <span className="font-black text-slate-900 uppercase tracking-tight">{trade.crop}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-bold text-slate-600">{trade.quantity_kg} KG</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-black text-slate-900">{trade.currency} {trade.total_value.toLocaleString()}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Seller</span>
                                    <span className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[100px]">{trade.seller_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Buyer</span>
                                    <span className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[100px]">{trade.buyer_name}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-widest ${trade.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                  }`}>
                                  {trade.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                  {trade.completed_at ? format(new Date(trade.completed_at), 'dd MMM yyyy') : '--'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {trade.status === 'pending' && isSeller && (
                                  <button
                                    onClick={() => confirmReceipt(trade.id)}
                                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm"
                                  >
                                    Finalize
                                  </button>
                                )}
                                {trade.status === 'pending' && !isSeller && (
                                  <span className="text-[9px] font-black text-slate-300 uppercase italic">Awaiting Seller</span>
                                )}
                                {trade.status === 'completed' && (
                                  <span className="text-emerald-500 font-black text-[9px] uppercase">Verified</span>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ADVERTISING TAB */}
          {activeTab === 'advertising' && (
            <div className="space-y-8">
              {!mpUser ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Authentication Required</p>
                  <button onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Log in as Seller</button>
                </div>
              ) : mpUser.role !== 'seller' ? (
                <div className="text-center py-16">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Seller Account Required</p>
                  <button onClick={() => { setAuthRole('seller'); setShowAuthModal(true); }} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Log in as Seller</button>
                </div>
              ) : !mpUser.is_subscribed ? (
                <div className="max-w-md mx-auto bg-slate-50 overflow-hidden">
                  <div className="bg-emerald-600 p-8 text-white text-center">
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Market Expansion</h3>
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Reach more buyers instantly</p>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">One-time Activation Fee</p>
                      <p className="text-4xl font-black text-slate-900 tracking-tighter">100,000 <span className="text-lg">UGX</span></p>
                    </div>
                    <ul className="space-y-3">
                      {['Priority placement in Browse tab', 'Featured badge on your listings', 'Direct notifications to local buyers', 'Monthly analytics report'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                          <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-[10px]">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleAdPayment}
                      disabled={isPayingAd}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {isPayingAd ? 'Processing Payment...' : 'Pay 100,000 UGX to Start'}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-medium italic">Secure payment via mobile money or credit card</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-emerald-50 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-emerald-950 uppercase tracking-tighter">Advertising Dashboard</h3>
                      <p className="text-xs text-emerald-700 font-bold uppercase tracking-widest">Active · Verified Account</p>
                    </div>
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                      Featured Seller
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ad Impressions</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">1,284</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">+12% from yesterday</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clicks/Inquiries</p>
                      <p className="text-2xl font-black text-slate-900 tracking-tight">42</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">+5% from yesterday</p>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="text-xl font-black uppercase tracking-tighter mb-4">Promote a Listing</h4>
                      <p className="text-slate-400 text-xs mb-6 max-w-md">Select one of your existing listings to feature it at the top of the browse section for all buyers.</p>
                      {myListings.length > 0 ? (
                        <div className="space-y-2">
                          {myListings.map(listing => (
                            <div key={listing.id} className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer">
                              <span className="font-bold text-sm uppercase tracking-tight">{listing.crop} ({listing.quantity_kg}kg)</span>
                              <button className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Promote</button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-emerald-400">You don't have any listings to promote yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Removed Restricted Access section */}
        </div>
      </div>
    </>
  );
}
